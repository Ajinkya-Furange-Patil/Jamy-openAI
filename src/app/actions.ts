
'use server';

import 'dotenv/config';
import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import type {Message} from '@/lib/types';
import {OpenAI} from 'openai';

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN,
});
  

export async function sendMessage(
  history: Message[],
  message: string,
  documentText?: string,
  customInstructions?: string,
  voice?: string
) {
  try {
    const formattedHistory: OpenAI.Chat.ChatCompletionMessageParam[] =
      history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text as string,
      }));

    // Add the current user message to the history for the API call
    let userMessageContent = message;
    if (documentText) {
      userMessageContent += `\n\n--- Attached Document ---\n${documentText}`;
    }

    formattedHistory.push({role: 'user', content: userMessageContent});

    // Add custom instructions as a system message if they exist
    if (customInstructions) {
      formattedHistory.unshift({
        role: 'system',
        content: customInstructions,
      });
    }

    const chatCompletion = await client.chat.completions.create({
      model: 'openai/gpt-oss-20b:hyperbolic',
      messages: formattedHistory,
    });

    const aiResponse = chatCompletion.choices[0].message?.content || null;

    if (!aiResponse) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        error: 'The AI did not generate a response. Please try again.',
      };
    }

    const ttsResult = await convertTextToSpeech({text: aiResponse, voice});

    return {
      aiResponse: aiResponse,
aiResponseContent: null,
      audioUrl: ttsResult.media,
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unexpected response was received from the server.';
    return {
      aiResponse: null,
      aiResponseContent: null,
      audioUrl: null,
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
