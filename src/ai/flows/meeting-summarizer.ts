'use server';

/**
 * @fileOverview An AI agent for summarizing meeting transcripts.
 *
 * - summarizeMeeting - A function that handles meeting summarization.
 * - SummarizeMeetingInput - The input type for the summarizeMeeting function.
 * - SummarizeMeetingOutput - The return type for the summarizeMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingInputSchema = z.object({
  transcript: z
    .string()
    .describe('The text transcript of the meeting to be summarized.'),
});
export type SummarizeMeetingInput = z.infer<
  typeof SummarizeMeetingInputSchema
>;

const SummarizeMeetingOutputSchema = z.object({
  summary: z.string().describe('The summary of the meeting, including key decisions and action items.'),
});
export type SummarizeMeetingOutput = z.infer<
  typeof SummarizeMeetingOutputSchema
>;

export async function summarizeMeeting(
  input: SummarizeMeetingInput
): Promise<SummarizeMeetingOutput> {
  return meetingSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meetingSummarizerPrompt',
  input: {schema: SummarizeMeetingInputSchema},
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `You are an expert at summarizing meeting transcripts. Your task is to read the following transcript and provide a concise summary. The summary should include:
1.  Key discussion points.
2.  Final decisions made.
3.  Action items assigned to individuals.

Meeting Transcript:
{{{transcript}}}`,
});

const meetingSummarizerFlow = ai.defineFlow(
  {
    name: 'meetingSummarizerFlow',
    inputSchema: SummarizeMeetingInputSchema,
    outputSchema: SummarizeMeetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
