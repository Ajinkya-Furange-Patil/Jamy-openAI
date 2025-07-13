'use server';

/**
 * @fileOverview A tool for generating UI/UX design code.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const uiuxDesignerPrompt = ai.definePrompt({
  name: 'uiuxDesignerPrompt',
  input: { schema: z.string() },
  output: { schema: z.string() },
  system: `You are an expert UI/UX designer and frontend developer. Your task is to generate clean, modern, and functional JSX code for React components.
You must use Tailwind CSS for styling and prefer using components from the shadcn/ui library where appropriate (e.g., <Button>, <Input>, <Card>, etc.).
The code should be a single, complete JSX component. Do not include imports or exports.
Respond ONLY with the JSX code inside a markdown code block (\`\`\`jsx ... \`\`\`). Do not add any explanation or commentary before or after the code.`,
  prompt: '{{{input}}}',
  config: {
    safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  }
});

export const uiuxDesignerTool = ai.defineTool(
  {
    name: 'uiuxDesigner',
    description: 'Designs and generates JSX code for UI components. Use this when the user asks to design, create, or build a UI element like a form, card, button, or page layout.',
    inputSchema: z.object({
      prompt: z.string().describe('A description of the UI component to be designed.'),
    }),
    outputSchema: z.string().describe('The generated JSX code for the component.'),
  },
  async (input) => {
    const { output } = await uiuxDesignerPrompt(input.prompt);
    return output!;
  }
);
