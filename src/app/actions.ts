
'use server';

import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import { orchestratorFlow } from '@/ai/flows/orchestrator-flow';

export async function sendMessage(
  history: string,
  message: string,
  documentText?: string,
  customInstructions?: string,
  voice?: string,
) {
  try {
    // Start both requests in parallel
    const orchestratorPromise = orchestratorFlow({
      prompt: message,
      documentText,
      history,
      customInstructions,
    });

    const [orchestratorResult] = await Promise.all([orchestratorPromise]);
    
    if (!orchestratorResult.text) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        updatedConversationHistory: history,
        error: 'The AI did not generate a response. Please try again.',
      };
    }
    
    // Start TTS conversion but don't wait for it
    const ttsPromise = convertTextToSpeech({text: orchestratorResult.text, voice});

    // Wait for the TTS to complete separately
    const ttsResult = await ttsPromise;
    
    return {
      aiResponse: orchestratorResult.text,
      aiResponseContent: orchestratorResult.content,
      audioUrl: ttsResult.media,
      updatedConversationHistory: orchestratorResult.history,
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
