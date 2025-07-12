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
import {createImage} from '@/ai/flows/image-creator';
import type {ReactNode} from 'react';

export async function sendMessage(
  history: string,
  message: string,
  documentText?: string,
  activeTool: Tool = 'chat',
  customInstructions?: string
) {
  try {
    let aiResponse: {
      text: string | null;
      content?: ReactNode;
    } = {text: null};
    let updatedHistory: string = history;

    if (activeTool === 'summarize' && documentText) {
      const summaryResult = await generateDocumentSummary({documentText});
      aiResponse.text = `I've summarized the document for you:\n\n${summaryResult.summary}`;
      updatedHistory += `\nSystem: Summarized document. Summary: ${summaryResult.summary}`;
    } else if (activeTool === 'email' && message.trim()) {
      const emailResult = await generateEmail({prompt: message});
      aiResponse.text = emailResult.email;
      updatedHistory += `\nUser (Email Assistant): ${message}\nAI: ${aiResponse.text}`;
    } else if (activeTool === 'translate' && message.trim()) {
      const translateResult = await translateText({text: message});
      aiResponse.text = translateResult.translation;
      updatedHistory += `\nUser (Translator): ${message}\nAI: ${aiResponse.text}`;
    } else if (activeTool === 'homework-helper' && message.trim()) {
      const result = await homeworkHelper({question: message});
      aiResponse.text = result.answer;
      updatedHistory += `\nUser (Homework Helper): ${message}\nAI: ${aiResponse.text}`;
    } else if (activeTool === 'research-assistant' && message.trim()) {
      const result = await researchAssistant({topic: message});
      aiResponse.text = result.researchData;
      updatedHistory += `\nUser (Research Assistant): ${message}\nAI: ${aiResponse.text}`;
    } else if (
      activeTool === 'meeting-summarizer' &&
      (message.trim() || documentText)
    ) {
      const content = documentText || message;
      const result = await summarizeMeeting({transcript: content});
      aiResponse.text = `Here is the summary of the meeting:\n\n${result.summary}`;
      updatedHistory += `\nSystem: Summarized meeting. Summary: ${result.summary}`;
    } else if (activeTool === 'report-writer' && message.trim()) {
      const result = await writeReport({topic: message});
      aiResponse.text = result.report;
      updatedHistory += `\nUser (Report Writer): ${message}\nAI: ${aiResponse.text}`;
    } else if (activeTool === 'image-creator' && message.trim()) {
      const result = await createImage({prompt: message});
      aiResponse.text = `Here is the image you requested. Is there anything else you'd like to create?`;
      aiResponse.content = result.imageUrl; // This will be the data URI
      updatedHistory += `\nUser (Image Creator): ${message}\nAI: [Generated an image]`;
    } else {
      // Default chat behavior
      if (message.trim()) {
        if (history) {
          const result = await maintainConversationContext({
            userMessage: message,
            conversationHistory: history,
            customInstructions,
          });
          aiResponse.text = result.aiResponse;
          updatedHistory = result.updatedConversationHistory;
        } else {
          const result = await generateInitialResponse({
            prompt: message,
            customInstructions,
          });
          aiResponse.text = result.response;
          updatedHistory = `User: ${message}\nAI: ${result.response}`;
        }
      } else if (documentText) {
        // Handle summarization if it's the only thing provided in chat mode
        const summaryResult = await generateDocumentSummary({documentText});
        aiResponse.text = `I've summarized the document for you:\n\n${summaryResult.summary}`;
        updatedHistory += `\nSystem: Summarized document. Summary: ${summaryResult.summary}`;
      }
    }

    if (!aiResponse.text) {
      return {
        aiResponse: null,
        aiResponseContent: null,
        audioUrl: null,
        updatedConversationHistory: history,
        error: 'The AI did not generate a response. Please try again.',
      };
    }

    const ttsResult = await convertTextToSpeech(aiResponse.text);

    return {
      aiResponse: aiResponse.text,
      aiResponseContent: aiResponse.content,
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
      aiResponseContent: null,
      audioUrl: null,
      updatedConversationHistory: history, // Return original history on error
      error: `Sorry, I encountered an error. ${errorMessage}`,
    };
  }
}
