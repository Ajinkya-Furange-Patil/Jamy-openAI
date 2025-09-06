
'use server';

import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import { orchestratorFlow } from '@/ai/flows/orchestrator-flow';
import type { Message } from '@/lib/types';
import { Message as GenkitMessage } from 'genkit';

export async function sendMessage(
  history: Message[],
  message: string,
  documentText?: string,
  customInstructions?: string,
  voice?: string,
) {
  try {
    const genkitHistory: GenkitMessage[] = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: [{ text: typeof msg.text === 'string' ? msg.text : 'User uploaded a file.' }], 
    }));


    const orchestratorResult = await orchestratorFlow({
      prompt: message,
      documentText,
      history: genkitHistory,
      customInstructions,
    });
    
    if (!orchestratorResult.text) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        error: 'The AI did not generate a response. Please try again.',
      };
    }
    
    const ttsResult = await convertTextToSpeech({text: orchestratorResult.text, voice});
    
    return {
      aiResponse: orchestratorResult.text,
      aiResponseContent: orchestratorResult.content,
      audioUrl: ttsResult.media,
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      aiResponse: null,
      aiResponseContent: null,
      audioUrl: null,
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
