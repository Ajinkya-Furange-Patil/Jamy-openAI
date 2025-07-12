'use server';
/**
 * @fileOverview An AI agent that generates images from text prompts.
 *
 * - createImage - A function that handles the image creation process.
 * - CreateImageInput - The input type for the createImage function.
 * - CreateImageOutput - The return type for the createImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateImageInputSchema = z.object({
  prompt: z
    .string()
    .describe('A detailed text prompt describing the image to be generated.'),
});
export type CreateImageInput = z.infer<typeof CreateImageInputSchema>;

const CreateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The generated image as a data URI. Expected format: data:image/png;base64,<encoded_data>'
    ),
});
export type CreateImageOutput = z.infer<typeof CreateImageOutputSchema>;

export async function createImage(
  input: CreateImageInput
): Promise<CreateImageOutput> {
  return imageCreatorFlow(input);
}

const imageCreatorFlow = ai.defineFlow(
  {
    name: 'imageCreatorFlow',
    inputSchema: CreateImageInputSchema,
    outputSchema: CreateImageOutputSchema,
  },
  async ({prompt}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to return a valid image.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
