'use server';

import {maintainConversationContext} from '@/ai/flows/maintain-conversation-context';
import {generateInitialResponse} from '@/ai/flows/generate-initial-response';
import {convertTextToSpeech} from '@/ai/flows/text-to-speech';
import {generateDocumentSummary} from '@/ai/flows/generate-document-summary';
import {generateEmail} from '@/ai/flows/email-assistant';
import {translateText} from '@/ai/flows/language-translator';
import type {Tool} from '@/lib/types';
import {homeworkHelper} from '@/ai/flows/homework-helper';
import {researchAssistant} from '@/ai/flows/research-assistant';
import {summarizeMeeting} from '@/ai/flows/meeting-summarizer';
import {writeReport} from '@/ai/flows/report-writer';

export async function sendMessage(
  history: string,
  message: string,
  documentText?: string,
  activeTool: Tool = 'chat',
  customInstructions?: string
) {
  try {
    let aiResponseText: string | null = null;
    let updatedHistory: string = history;

    if (activeTool === 'summarize' && documentText) {
      const summaryResult = await generateDocumentSummary({documentText});
      aiResponseText = `I've summarized the document for you:\n\n${summaryResult.summary}`;
      updatedHistory += `\nSystem: Summarized document. Summary: ${summaryResult.summary}`;
    } else if (activeTool === 'email' && message.trim()) {
      const emailResult = await generateEmail({prompt: message});
      aiResponseText = emailResult.email;
      updatedHistory += `\nUser (Email Assistant): ${message}\nAI: ${aiResponseText}`;
    } else if (activeTool === 'translate' && message.trim()) {
      const translateResult = await translateText({text: message});
      aiResponseText = translateResult.translation;
      updatedHistory += `\nUser (Translator): ${message}\nAI: ${aiResponseText}`;
    } else if (activeTool === 'homework-helper' && message.trim()) {
      const result = await homeworkHelper({question: message});
      aiResponseText = result.answer;
      updatedHistory += `\nUser (Homework Helper): ${message}\nAI: ${aiResponseText}`;
    } else if (activeTool === 'research-assistant' && message.trim()) {
      const result = await researchAssistant({topic: message});
      aiResponseText = result.researchData;
      updatedHistory += `\nUser (Research Assistant): ${message}\nAI: ${aiResponseText}`;
    } else if (activeTool === 'meeting-summarizer' && (message.trim() || documentText)) {
      const content = documentText || message;
      const result = await summarizeMeeting({transcript: content});
      aiResponseText = `Here is the summary of the meeting:\n\n${result.summary}`;
      updatedHistory += `\nSystem: Summarized meeting. Summary: ${result.summary}`;
    } else if (activeTool === 'report-writer' && message.trim()) {
      const result = await writeReport({topic: message});
      aiResponseText = result.report;
      updatedHistory += `\nUser (Report Writer): ${message}\nAI: ${aiResponseText}`;
    } else {
      // Default chat behavior
      if (message.trim()) {
        if (history) {
          const result = await maintainConversationContext({
            userMessage: message,
            conversationHistory: history,
            customInstructions,
          });
          aiResponseText = result.aiResponse;
          updatedHistory = result.updatedConversationHistory;
        } else {
          const result = await generateInitialResponse({prompt: message, customInstructions});
          aiResponseText = result.response;
          updatedHistory = `User: ${message}\nAI: ${result.response}`;
        }
      } else if (documentText) {
        // Handle summarization if it's the only thing provided in chat mode
        const summaryResult = await generateDocumentSummary({documentText});
        aiResponseText = `I've summarized the document for you:\n\n${summaryResult.summary}`;
        updatedHistory += `\nSystem: Summarized document. Summary: ${summaryResult.summary}`;
      }
    }

    if (!aiResponseText) {
      return {
        aiResponse: null,
        audioUrl: null,
        updatedConversationHistory: history,
        error: 'The AI did not generate a response. Please try again.',
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
