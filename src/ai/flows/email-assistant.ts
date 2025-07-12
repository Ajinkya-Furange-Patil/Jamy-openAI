'use server';

/**
 * @fileOverview An AI agent that assists with writing emails.
 *
 * - generateEmail - A function that handles the email generation process.
 * - GenerateEmailInput - The input type for the generateEmail function.
 * - GenerateEmailOutput - The return type for the generateEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailInputSchema = z.object({
  prompt: z.string().describe('The user prompt describing the email to be generated.'),
});
export type GenerateEmailInput = z.infer<typeof GenerateEmailInputSchema>;

const GenerateEmailOutputSchema = z.object({
  email: z.string().describe('The generated email content.'),
});
export type GenerateEmailOutput = z.infer<typeof GenerateEmailOutputSchema>;

export async function generateEmail(
  input: GenerateEmailInput
): Promise<GenerateEmailOutput> {
  return emailAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emailAssistantPrompt',
  input: {schema: GenerateEmailInputSchema},
  output: {schema: GenerateEmailOutputSchema},
  prompt: `You are an expert email writing assistant. Your task is to generate a professional and well-written email based on the user's prompt. Make sure the email is clear, concise, and appropriate for the context described by the user.

User Prompt:
{{{prompt}}}`,
});

const emailAssistantFlow = ai.defineFlow(
  {
    name: 'emailAssistantFlow',
    inputSchema: GenerateEmailInputSchema,
    outputSchema: GenerateEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
