'use server';

import {maintainConversationContext} from '@/ai/flows/maintain-conversation-context';
import {generateInitialResponse} from '@/ai/flows/generate-initial-response';
import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import {generateDocumentSummary} from '@/ai/flows/generate-document-summary';

export async function sendMessage(
  history: string,
  message: string,
  documentText?: string
) {
  try {
    let aiResponseText: string | null = null;
    let updatedHistory: string | null = history;

    // If a document is attached, summarize it first.
    if (documentText) {
      const summaryResult = await generateDocumentSummary({documentText});
      aiResponseText = `I've summarized the document for you:\n\n${summaryResult.summary}`;
      // Add a system message to history about the summary.
      updatedHistory += `\nSystem: Summarized document. Summary: ${summaryResult.summary}`;
    }

    // If there's also a text message, handle it as a follow-up.
    if (message.trim()) {
      if (updatedHistory) {
        const result = await maintainConversationContext({
          userMessage: message,
          conversationHistory: updatedHistory,
        });
        aiResponseText = result.aiResponse; // The conversational response overrides the summary as the final spoken response
        updatedHistory = result.updatedConversationHistory;
      } else {
        const result = await generateInitialResponse({prompt: message});
        aiResponseText = result.response;
        updatedHistory = `User: ${message}\nAI: ${result.response}`;
      }
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
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      aiResponse: null,
      audioUrl: null,
      updatedConversationHistory: history, // Return original history on error
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
