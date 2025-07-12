'use server';

/**
 * @fileOverview Document summarization AI agent.
 *
 * - generateDocumentSummary - A function that handles the document summarization process.
 * - GenerateDocumentSummaryInput - The input type for the generateDocumentSummary function.
 * - GenerateDocumentSummaryOutput - The return type for the generateDocumentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentSummaryInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be summarized.'),
});
export type GenerateDocumentSummaryInput = z.infer<
  typeof GenerateDocumentSummaryInputSchema
>;

const GenerateDocumentSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the document.'),
});
export type GenerateDocumentSummaryOutput = z.infer<
  typeof GenerateDocumentSummaryOutputSchema
>;

export async function generateDocumentSummary(
  input: GenerateDocumentSummaryInput
): Promise<GenerateDocumentSummaryOutput> {
  return generateDocumentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentSummaryPrompt',
  input: {schema: GenerateDocumentSummaryInputSchema},
  output: {schema: GenerateDocumentSummaryOutputSchema},
  prompt: `Summarize the following document. Make sure the summary is concise and captures the key points of the document.

Document:
{{{documentText}}}`,
});

const generateDocumentSummaryFlow = ai.defineFlow(
  {
    name: 'generateDocumentSummaryFlow',
    inputSchema: GenerateDocumentSummaryInputSchema,
    outputSchema: GenerateDocumentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
