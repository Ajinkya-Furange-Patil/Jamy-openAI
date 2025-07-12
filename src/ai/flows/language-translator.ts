'use server';

/**
 * @fileOverview An AI agent for language translation.
 *
 * - translateText - A function that handles text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return languageTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'languageTranslatorPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a powerful language translator. Your task is to translate the given text. Be direct with the translation, but you can add a small, friendly note if the context is ambiguous. If the user does not specify a target language, try to infer it or default to a common language like English or Spanish based on the context.

Text to translate:
{{{text}}}`,
});

const languageTranslatorFlow = ai.defineFlow(
  {
    name: 'languageTranslatorFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
