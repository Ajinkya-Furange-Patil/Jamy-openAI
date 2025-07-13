'use server';

/**
 * @fileOverview A tool for executing Python code in a simulated environment.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const interpreterPrompt = ai.definePrompt({
  name: 'interpreterPrompt',
  input: { schema: z.string() },
  output: { schema: z.string() },
  system:
    'You are a Python interpreter. Execute the given code and return only the standard output as a string. Do not provide any explanation or commentary. If there is an error, return the traceback.',
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

export const codeInterpreterTool = ai.defineTool(
  {
    name: 'codeInterpreter',
    description: 'Executes Python code and returns the output. Use this for calculations, data analysis, or any task that requires code execution.',
    inputSchema: z.object({
      code: z.string().describe('The Python code to execute.'),
    }),
    outputSchema: z.string().describe('The standard output from the executed code.'),
  },
  async (input) => {
    const { output } = await interpreterPrompt(input.code);
    return output!;
  }
);
