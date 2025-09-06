'use server';
import 'dotenv/config';

import type { Message } from '@/lib/types';
import { orchestratorFlow } from '@/ai/flows/orchestrator-flow';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech';
import { ReactNode } from 'react';

// Helper to convert ReactNode to a string for the AI.
// This should only handle simple cases on the server.
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
    if ('props' in node && node.props.children) {
      return extractTextFromMessage(node.props.children);
    }
    return '';
};


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

    const flowResult = await orchestratorFlow({
      prompt: userMessageContent,
      history: history,
      customInstructions: customInstructions,
    });
    
    const aiResponse = flowResult.response;
    const aiResponseContent = flowResult.content;

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
