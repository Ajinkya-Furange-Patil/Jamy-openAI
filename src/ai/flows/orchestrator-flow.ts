
'use server';

/**
 * @fileOverview An AI agent that orchestrates various tools to respond to user requests.
 *
 * - orchestratorFlow - A function that handles the orchestration process.
 * - OrchestratorInput - The input type for the orchestratorFlow function.
 * - OrchestratorOutput - The return type for the orchestratorFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateEmail} from './email-assistant';
import {translateText} from './language-translator';
import {homeworkHelper} from './homework-helper';
import {researchAssistant} from './research-assistant';
import {summarizeMeeting} from './meeting-summarizer';
import {writeReport} from './report-writer';
import {createImage} from './image-creator';
import {generateDocumentSummary} from './generate-document-summary';
import { codeInterpreterTool } from '../tools/code-interpreter';
import { uiuxDesignerTool } from '../tools/uiux-designer';
import type { Message } from 'genkit';

// Define tools for the orchestrator to use
const emailTool = ai.defineTool(
  {
    name: 'emailAssistant',
    description: 'Drafts an email based on a user prompt. Use this when the user asks to write, draft, or compose an email.',
    inputSchema: z.object({prompt: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await generateEmail(input)).email
);

const translationTool = ai.defineTool(
  {
    name: 'languageTranslator',
    description: 'Translates text. Use this when the user asks to translate text.',
    inputSchema: z.object({text: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await translateText(input)).translation
);

const homeworkTool = ai.defineTool(
  {
    name: 'homeworkHelper',
    description: 'Helps students with homework questions. Use for academic or educational questions.',
    inputSchema: z.object({question: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await homeworkHelper(input)).answer
);

const researchTool = ai.defineTool(
  {
    name: 'researchAssistant',
    description: 'Provides comprehensive information on a research topic. Use when a user asks for research on a topic.',
    inputSchema: z.object({topic: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await researchAssistant(input)).researchData
);

const meetingSummaryTool = ai.defineTool(
  {
    name: 'meetingSummarizer',
    description: 'Summarizes a meeting transcript, highlighting key points, decisions, and action items.',
    inputSchema: z.object({transcript: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await summarizeMeeting(input)).summary
);

const reportWriterTool = ai.defineTool(
  {
    name: 'reportWriter',
    description: 'Generates a well-structured report based on a user-provided topic.',
    inputSchema: z.object({topic: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await writeReport(input)).report
);

const imageCreatorTool = ai.defineTool(
  {
    name: 'imageCreator',
    description: 'Generates an image from a detailed text prompt. Use when the user asks to create, draw, or generate an image.',
    inputSchema: z.object({prompt: z.string()}),
    outputSchema: z.object({imageUrl: z.string()}),
  },
  createImage
);

const documentSummaryTool = ai.defineTool(
  {
    name: 'documentSummarizer',
    description: 'Summarizes a provided text document.',
    inputSchema: z.object({documentText: z.string()}),
    outputSchema: z.string(),
  },
  async (input) => (await generateDocumentSummary(input)).summary
);

const webSearchTool = ai.defineTool(
    {
      name: 'webSearch',
      description: 'Searches the web for up-to-date information on a given topic. Use this for questions about current events, recent discoveries, or things that require real-time information.',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.string(),
    },
    async (input) => {
      // In a real application, you would use a search engine API here.
      // For this prototype, we'll simulate a search result.
      const response = await ai.generate({
          prompt: `You are a web search engine. Provide a concise, factual summary for the search query: "${input.query}"`,
      });
      return response.text;
    }
  );


const OrchestratorInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  documentText: z.string().optional().describe('Optional text content from a file.'),
  history: z.array(z.custom<Message>()).optional().describe('The conversation history.'),
  customInstructions: z.string().optional().describe('Custom instructions for the AI persona.'),
});
export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

const OrchestratorOutputSchema = z.object({
  response: z.string().describe('The generated response from the AI.'),
  content: z.string().optional().describe('Optional content, like an image URL data URI.'),
});
export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>;

const orchestratorPrompt = ai.definePrompt({
  name: 'orchestratorPrompt',
  input: {schema: OrchestratorInputSchema},
  output: {schema: OrchestratorOutputSchema},
  tools: [
    webSearchTool,
    codeInterpreterTool,
    uiuxDesignerTool,
    emailTool,
    translationTool,
    homeworkTool,
    researchTool,
    meetingSummaryTool,
    reportWriterTool,
    imageCreatorTool,
    documentSummaryTool,
  ],
  system: `You are JAMY AI, a powerful and friendly AI assistant. Your tone should be conversational and empathetic.
Based on the user's prompt, you must decide which tool is most appropriate to use. If no specific tool is needed, you can have a general conversation.

Tool Usage Guidelines:
- Document-related questions: If the user provides a document, consider using the document summarizer tool.
- Current Events: If the user asks about current events or something requiring real-time information, use the web search tool.
- UI/UX Design: If the user asks you to design, create, or build a UI component, use the uiuxDesignerTool to generate JSX code.
- Image Generation: If you generate an image, set the 'content' field in the output to the image URL.
- Coding Questions:
  - If the user asks for a code snippet (e.g., "how to write a function...", "show me an example of..."), write the code directly in your response, inside a markdown code block. DO NOT use the codeInterpreterTool for this.
  - If the user asks a question that requires a calculation, data processing, or the result of code execution, use the codeInterpreterTool. Write the necessary code and the tool will return the output.
- All other tasks (email, translation, homework, etc.) should use their respective tools.

When you use a tool, especially the code interpreter or UI/UX designer, it's good practice to show the user the code you executed or created. You can do this by putting the code or results in a markdown code block (\`\`\`) in your response.

{{#if customInstructions}}
The user has provided the following custom instructions for you to follow:
---
{{customInstructions}}
---
{{/if}}`,
  config: {
    history: '{{history}}',
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
  prompt: `User prompt: {{prompt}}
{{#if documentText}}
Attached document content:
---
{{documentText}}
---
{{/if}}
`,
});

export const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: z.object({
      text: z.string(),
      content: z.string().optional(),
    }),
  },
  async (input) => {
    const {output} = await orchestratorPrompt(input);

    if (!output) {
      throw new Error('The AI did not generate a response.');
    }
    
    return {
      text: output.response,
      content: output.content,
    };
  }
);
