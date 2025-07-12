'use server';

/**
 * @fileOverview An AI agent that assists with writing reports.
 *
 * - writeReport - A function that handles the report generation process.
 * - WriteReportInput - The input type for the writeReport function.
 * - WriteReportOutput - The return type for the writeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WriteReportInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or requirements for the report to be generated.'),
});
export type WriteReportInput = z.infer<typeof WriteReportInputSchema>;

const WriteReportOutputSchema = z.object({
  report: z.string().describe('The generated report content.'),
});
export type WriteReportOutput = z.infer<typeof WriteReportOutputSchema>;

export async function writeReport(
  input: WriteReportInput
): Promise<WriteReportOutput> {
  return reportWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportWriterPrompt',
  input: {schema: WriteReportInputSchema},
  output: {schema: WriteReportOutputSchema},
  prompt: `You are a professional report writer. Your task is to generate a well-structured and detailed report based on the user's topic and requirements. Write in a clear, professional, and approachable style.

User's Report Topic:
{{{topic}}}`,
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

const reportWriterFlow = ai.defineFlow(
  {
    name: 'reportWriterFlow',
    inputSchema: WriteReportInputSchema,
    outputSchema: WriteReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
