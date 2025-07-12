'use server';

/**
 * @fileOverview An AI agent that maintains conversation context.
 *
 * - maintainConversationContext - A function that maintains context in a conversation.
 * - MaintainConversationContextInput - The input type for the maintainConversationContext function.
 * - MaintainConversationContextOutput - The return type for the maintainConversationContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaintainConversationContextInputSchema = z.object({
  userMessage: z.string().describe('The message from the user.'),
  conversationHistory: z.string().describe('The history of the conversation.'),
  customInstructions: z.string().optional().describe('Custom instructions for the AI persona.'),
});
export type MaintainConversationContextInput = z.infer<
  typeof MaintainConversationContextInputSchema
>;

const MaintainConversationContextOutputSchema = z.object({
  aiResponse: z.string().describe('The AI response to the user message.'),
  updatedConversationHistory: z
    .string()
    .describe('The updated conversation history.'),
});
export type MaintainConversationContextOutput = z.infer<
  typeof MaintainConversationContextOutputSchema
>;

export async function maintainConversationContext(
  input: MaintainConversationContextInput
): Promise<MaintainConversationContextOutput> {
  return maintainConversationContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maintainConversationContextPrompt',
  input: {schema: MaintainConversationContextInputSchema},
  output: {schema: MaintainConversationContextOutputSchema},
  prompt: `You are Yadi, a helpful and friendly AI assistant. Your tone should be conversational and empathetic. Sound like a real person, not a robot. Maintain context throughout the conversation.
{{#if customInstructions}}

The user has provided the following custom instructions for you to follow:
---
{{customInstructions}}
---
{{/if}}

Conversation History:
{{conversationHistory}}

User Message:
{{userMessage}}

AI Response:`,
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

const maintainConversationContextFlow = ai.defineFlow(
  {
    name: 'maintainConversationContextFlow',
    inputSchema: MaintainConversationContextInputSchema,
    outputSchema: MaintainConversationContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Update conversation history with the user message and AI response.
    const updatedConversationHistory =
      input.conversationHistory + '\nUser: ' + input.userMessage + '\nAI: ' + output!.aiResponse;

    return {
      aiResponse: output!.aiResponse,
      updatedConversationHistory: updatedConversationHistory,
    };
  }
);
