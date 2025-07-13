'use server';

/**
 * @fileOverview A tool for executing code in a simulated environment for various languages.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const interpreterPrompt = ai.definePrompt({
  name: 'interpreterPrompt',
  input: { schema: z.object({ code: z.string(), language: z.string().optional().describe('The programming language of the code. Defaults to Python if not specified.') }) },
  output: { schema: z.string() },
  system:
    'You are a code interpreter. You will be given a code snippet and its programming language. Execute the code and return only the standard output as a raw string. Do not add any explanation, commentary, or markdown formatting. If there is an error, return the traceback or error message.',
  prompt: 'Language: {{{language}}}\nCode:\n{{{code}}}',
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
    description: 'Executes code in various programming languages and returns the output. Use this for calculations, data analysis, or any task that requires code execution.',
    inputSchema: z.object({
      code: z.string().describe('The code to execute.'),
      language: z.string().optional().describe('The programming language of the code (e.g., "python", "javascript", "java"). Defaults to python.'),
    }),
    outputSchema: z.string().describe('The standard output from the executed code.'),
  },
  async (input) => {
    const { output } = await interpreterPrompt(input);
    return output!;
  }
);
