'use server';

/**
 * @fileOverview An AI agent that assists with research.
 *
 * - researchAssistant - A function that handles research queries.
 * - ResearchAssistantInput - The input type for the researchAssistant function.
 * - ResearchAssistantOutput - The return type for the researchAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResearchAssistantInputSchema = z.object({
  topic: z.string().describe('The research topic from the user.'),
});
export type ResearchAssistantInput = z.infer<
  typeof ResearchAssistantInputSchema
>;

const ResearchAssistantOutputSchema = z.object({
  researchData: z
    .string()
    .describe('The generated research data and information.'),
});
export type ResearchAssistantOutput = z.infer<
  typeof ResearchAssistantOutputSchema
>;

export async function researchAssistant(
  input: ResearchAssistantInput
): Promise<ResearchAssistantOutput> {
  return researchAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'researchAssistantPrompt',
  input: {schema: ResearchAssistantInputSchema},
  output: {schema: ResearchAssistantOutputSchema},
  prompt: `You are a highly skilled research assistant. Your task is to provide comprehensive and well-sourced information on the user's research topic.

User's Research Topic:
{{{topic}}}`,
});

const researchAssistantFlow = ai.defineFlow(
  {
    name: 'researchAssistantFlow',
    inputSchema: ResearchAssistantInputSchema,
    outputSchema: ResearchAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
