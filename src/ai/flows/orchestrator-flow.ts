'use server';
/**
 * @fileoverview The main orchestrator flow for the JAMY AI assistant.
 * This flow is responsible for receiving user prompts and dispatching them to the appropriate tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

import { generateDocumentSummary } from './generate-document-summary';
import { generateEmail } from './email-assistant';
import { translateText } from './language-translator';
import { homeworkHelper } from './homework-helper';
import { researchAssistant } from './research-assistant';
import { summarizeMeeting } from './meeting-summarizer';
import { writeReport } from './report-writer';
import { createImage } from './image-creator';
import { codeInterpreterTool } from './code-interpreter';
import { uxDesignerTool } from './ux-designer';
import { webSearchTool } from './web-search';
import { Message } from '@/lib/types';
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
    if ('props' in node && node.props.children) {
      return extractTextFromMessage(node.props.children);
    }
    return '';
};

const OrchestratorInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  history: z.array(z.any()).optional().describe('The conversation history.'),
  customInstructions: z
    .string()
    .optional()
    .describe('Custom instructions for the AI persona.'),
});
export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

const OrchestratorOutputSchema = z.object({
  response: z.string().describe('The generated response from the AI.'),
  content: z.string().optional().describe('Optional structured content, like an image URL.'),
});
export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>;


const tools = [
  generateDocumentSummary,
  generateEmail,
  translateText,
  homeworkHelper,
  researchAssistant,
  summarizeMeeting,
  writeReport,
  createImage,
  codeInterpreterTool,
  uxDesignerTool,
  webSearchTool
];

export const orchestratorPrompt = ai.definePrompt({
  name: 'orchestratorPrompt',
  input: { schema: OrchestratorInputSchema },
  output: { schema: OrchestratorOutputSchema },
  tools,
  prompt: `You are JAMY AI, a powerful and friendly AI assistant. Your tone should be conversational, knowledgeable, and empathetic. Sound like a real person, not a robot.
Your primary role is to understand the user's request and use the available tools to provide the most accurate and helpful response.
Analyze the user's prompt and the conversation history to determine the best course of action.

{{#if customInstructions}}
The user has provided the following custom instructions for you to follow:
---
{{customInstructions}}
---
{{/if}}

{{#if history}}
CONVERSATION HISTORY:
{{#each history}}
  {{#if (eq role 'user')}}
User: {{text}}
  {{else}}
AI: {{text}}
  {{/if}}
{{/each}}
{{/if}}

User Prompt: {{prompt}}

Based on the prompt and history, decide if a tool is needed. If so, call the appropriate tool. If not, respond directly to the user.`,
    config: {
        safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        ],
    },
});


export const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: z.custom<OrchestratorInput>(),
    outputSchema: z.custom<OrchestratorOutput>(),
  },
  async (input) => {

    const historyForPrompt = (input.history || []).map((msg: Message) => ({
        role: msg.role,
        text: extractTextFromMessage(msg.text),
    }));

    const result = await orchestratorPrompt({
        ...input,
        history: historyForPrompt,
    });
    
    const output = result.output;
    if (!output) {
      throw new Error('The AI did not generate a response.');
    }
    
    // Check if the output contains a tool call result
    const toolResult = result.choices[0].message.toolCalls?.[0]?.output;

    if (toolResult) {
      if (toolResult.imageUrl) {
        return { response: "Here is the image you requested.", content: toolResult.imageUrl };
      }
      if (toolResult.summary) {
        return { response: toolResult.summary };
      }
       if (toolResult.email) {
        return { response: toolResult.email };
      }
       if (toolResult.translation) {
        return { response: toolResult.translation };
      }
       if (toolResult.answer) {
        return { response: toolResult.answer };
      }
       if (toolResult.researchData) {
        return { response: toolResult.researchData };
      }
      if (toolResult.report) {
        return { response: toolResult.report };
      }
       if (toolResult.result) {
        return { response: toolResult.result };
      }
      return { response: JSON.stringify(toolResult, null, 2) };
    }


    return { response: output.response, content: output.content };
  }
);
