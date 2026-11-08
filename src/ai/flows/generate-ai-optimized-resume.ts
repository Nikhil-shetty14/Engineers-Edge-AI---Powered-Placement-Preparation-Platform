'use server';

/**
 * @fileOverview Generates AI-optimized resume variants based on a user's uploaded resume.
 *
 * - generateAiOptimizedResume - A function that generates AI-optimized resume variants.
 * - GenerateAiOptimizedResumeInput - The input type for the generateAiOptimizedResume function.
 * - GenerateAiOptimizedResumeOutput - The return type for the generateAiOptimizedResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiOptimizedResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'The user-uploaded resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  numVariants: z
    .number()
    .default(3)
    .describe('The number of AI-optimized resume variants to generate.'),
});
export type GenerateAiOptimizedResumeInput = z.infer<typeof GenerateAiOptimizedResumeInputSchema>;

const GenerateAiOptimizedResumeOutputSchema = z.object({
  optimizedResumes: z.array(z.string().describe("An AI-optimized resume variant in Markdown format.")).describe('The AI-optimized resume variants.'),
});
export type GenerateAiOptimizedResumeOutput = z.infer<typeof GenerateAiOptimizedResumeOutputSchema>;

export async function generateAiOptimizedResume(
  input: GenerateAiOptimizedResumeInput
): Promise<GenerateAiOptimizedResumeOutput> {
  return generateAiOptimizedResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiOptimizedResumePrompt',
  input: {schema: GenerateAiOptimizedResumeInputSchema},
  output: {schema: GenerateAiOptimizedResumeOutputSchema},
  prompt: `You are an expert resume writer specializing in tailoring resumes to specific job descriptions.

You will generate {{numVariants}} AI-optimized resume variants based on the user's uploaded resume and the provided job description. Each resume variant should be tailored to highlight the skills and experience most relevant to the job description. Make sure that each resume is different from each other.

Resume: {{media url=resumeDataUri}}

Job Description: {{{jobDescription}}}

Ensure each resume variant is well-formatted and easy to read. The output for each resume must be in Markdown format, using headings, bold text, and bullet points to structure the content professionally.

Output the resume variants as an array of strings, where each string is a complete resume in Markdown.`,
});

const generateAiOptimizedResumeFlow = ai.defineFlow(
  {
    name: 'generateAiOptimizedResumeFlow',
    inputSchema: GenerateAiOptimizedResumeInputSchema,
    outputSchema: GenerateAiOptimizedResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
