'use server';

import { maintainConversationContext } from '@/ai/flows/maintain-conversation-context';
import { generateInitialResponse } from '@/ai/flows/generate-initial-response';

export async function sendMessage(history: string, message: string) {
  try {
    if (history) {
      const result = await maintainConversationContext({
        userMessage: message,
        conversationHistory: history,
      });
      return {
        aiResponse: result.aiResponse,
        updatedConversationHistory: result.updatedConversationHistory,
        error: null,
      };
    } else {
      const result = await generateInitialResponse({ prompt: message });
      const updatedHistory = `User: ${message}\nAI: ${result.response}`;
      return {
        aiResponse: result.response,
        updatedConversationHistory: updatedHistory,
        error: null,
      };
    }
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      aiResponse: null,
      updatedConversationHistory: history, // Return original history on error
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
