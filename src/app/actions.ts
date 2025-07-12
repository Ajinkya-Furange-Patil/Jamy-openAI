'use server';

import { maintainConversationContext } from '@/ai/flows/maintain-conversation-context';
import { generateInitialResponse } from '@/ai/flows/generate-initial-response';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech';

export async function sendMessage(history: string, message: string) {
  try {
    let aiResponseText: string | null = null;
    let updatedHistory: string | null = null;

    if (history) {
      const result = await maintainConversationContext({
        userMessage: message,
        conversationHistory: history,
      });
      aiResponseText = result.aiResponse;
      updatedHistory = result.updatedConversationHistory;
    } else {
      const result = await generateInitialResponse({ prompt: message });
      aiResponseText = result.response;
      updatedHistory = `User: ${message}\nAI: ${result.response}`;
    }

    if (!aiResponseText) {
       return {
        aiResponse: null,
        audioUrl: null,
        updatedConversationHistory: history,
        error: 'No response from AI.',
      };
    }
    
    const ttsResult = await convertTextToSpeech(aiResponseText);

    return {
      aiResponse: aiResponseText,
      audioUrl: ttsResult.media,
      updatedConversationHistory: updatedHistory,
      error: null,
    };

  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      aiResponse: null,
      audioUrl: null,
      updatedConversationHistory: history, // Return original history on error
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
