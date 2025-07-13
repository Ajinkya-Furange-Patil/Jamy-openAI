'use server';

import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import type {ReactNode} from 'react';
import { orchestratorFlow } from '@/ai/flows/orchestrator-flow';

export async function sendMessage(
  history: string,
  message: string,
  documentText?: string,
  customInstructions?: string
) {
  try {
    const result = await orchestratorFlow({
      prompt: message,
      documentText,
      history,
      customInstructions,
    });

    if (!result.text) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        updatedConversationHistory: history,
        error: 'The AI did not generate a response. Please try again.',
      };
    }

    const ttsResult = await convertTextToSpeech(result.text);

    return {
      aiResponse: result.text,
      aiResponseContent: result.content,
      audioUrl: ttsResult.media,
      updatedConversationHistory: result.history,
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
      updatedConversationHistory: history, // Return original history on error
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
