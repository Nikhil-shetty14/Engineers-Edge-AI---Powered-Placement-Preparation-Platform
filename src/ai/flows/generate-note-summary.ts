'use server';
/**
 * @fileOverview An AI flow to generate a title and summary for a given text content.
 *
 * - generateNoteSummary - A function that creates a title and summary.
 * - GenerateNoteSummaryInput - The input type for the function.
 * - GenerateNoteSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNoteSummaryInputSchema = z.object({
  content: z.string().describe('The full text content to be summarized.'),
});
export type GenerateNoteSummaryInput = z.infer<
  typeof GenerateNoteSummaryInputSchema
>;

const GenerateNoteSummaryOutputSchema = z.object({
  title: z
    .string()
    .describe('A short, concise title for the note (5-10 words).'),
  summary: z.string().describe('A brief summary of the note content.'),
});
export type GenerateNoteSummaryOutput = z.infer<
  typeof GenerateNoteSummaryOutputSchema
>;

export async function generateNoteSummary(
  input: GenerateNoteSummaryInput
): Promise<GenerateNoteSummaryOutput> {
  return generateNoteSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNoteSummaryPrompt',
  input: { schema: GenerateNoteSummaryInputSchema },
  output: { schema: GenerateNoteSummaryOutputSchema },
  prompt: `You are an expert at summarizing text. Analyze the following content and generate a concise title and a brief summary.

Content:
{{{content}}}

Generate a title that is 5-10 words long.
Generate a summary that captures the key points of the content.`,
});

const generateNoteSummaryFlow = ai.defineFlow(
  {
    name: 'generateNoteSummaryFlow',
    inputSchema: GenerateNoteSummaryInputSchema,
    outputSchema: GenerateNoteSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
