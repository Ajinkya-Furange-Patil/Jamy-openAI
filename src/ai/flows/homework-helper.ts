'use server';

/**
 * @fileOverview An AI agent that helps students with their homework.
 *
 * - homeworkHelper - A function that handles homework assistance.
 * - HomeworkHelperInput - The input type for the homeworkHelper function.
 * - HomeworkHelperOutput - The return type for the homeworkHelper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomeworkHelperInputSchema = z.object({
  question: z.string().describe('The homework question from the user.'),
});
export type HomeworkHelperInput = z.infer<typeof HomeworkHelperInputSchema>;

const HomeworkHelperOutputSchema = z.object({
  answer: z.string().describe('The generated answer to the homework question.'),
});
export type HomeworkHelperOutput = z.infer<typeof HomeworkHelperOutputSchema>;

export async function homeworkHelper(
  input: HomeworkHelperInput
): Promise<HomeworkHelperOutput> {
  return homeworkHelperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'homeworkHelperPrompt',
  input: {schema: HomeworkHelperInputSchema},
  output: {schema: HomeworkHelperOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to help students by providing clear, accurate, and step-by-step answers to their homework questions.

User's Question:
{{{question}}}`,
});

const homeworkHelperFlow = ai.defineFlow(
  {
    name: 'homeworkHelperFlow',
    inputSchema: HomeworkHelperInputSchema,
    outputSchema: HomeworkHelperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
