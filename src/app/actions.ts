'use server';
import 'dotenv/config';

import type { Message } from '@/lib/types';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech';
import { OpenAI } from 'openai';
import { ReactNode } from 'react';

// Helper to convert ReactNode to a string for the AI.
const extractTextFromMessage = (node: ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'number' || typeof node === 'boolean' || !node) {
      return '';
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromMessage).join('');
    }
    if (node && typeof node === 'object' && 'props' in node && node.props.children) {
      return extractTextFromMessage(node.props.children);
    }
    return '';
};


const client = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
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
    let userMessageContent = message;
    if (documentText) {
      userMessageContent += `\n\n--- Attached Document ---\n${documentText}`;
    }

    const messagesForApi = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: extractTextFromMessage(msg.text),
    }));
    
    messagesForApi.push({ role: 'user', content: userMessageContent });


    const chatCompletion = await client.chat.completions.create({
        model: "openai/gpt-oss-20b:hyperbolic",
        messages: messagesForApi,
    });

    const aiResponse = chatCompletion.choices[0].message?.content || null;
    let aiResponseContent = null;

    if (!aiResponse) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        error: 'The AI did not generate a response. Please try again.',
      };
    }

    const ttsResult = await convertTextToSpeech({ text: aiResponse, voice });

    return {
      aiResponse: aiResponse,
      aiResponseContent: aiResponseContent,
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
