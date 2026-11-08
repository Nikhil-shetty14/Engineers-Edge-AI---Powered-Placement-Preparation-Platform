'use server';

/**
 * @fileOverview Suggests project ideas based on user input.
 *
 * - suggestProjects - A function that suggests project ideas.
 * - SuggestProjectsInput - The input type for the suggestProjects function.
 * - SuggestProjectsOutput - The return type for the suggestProjects function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestProjectsInputSchema = z.object({
  prompt: z.string().describe("User's request for project ideas, e.g., 'a project using React and Firebase'."),
});
export type SuggestProjectsInput = z.infer<typeof SuggestProjectsInputSchema>;

const ProjectSchema = z.object({
    title: z.string().describe('A catchy and descriptive title for the project.'),
    description: z.string().describe('A one-paragraph summary of what the project is and its purpose.'),
    features: z.array(z.string()).describe('A list of 3-5 key features for the project.'),
    techStack: z.array(z.string()).describe('A list of recommended technologies (e.g., Next.js, Firebase, Tailwind CSS).'),
});

const SuggestProjectsOutputSchema = z.object({
  projects: z.array(ProjectSchema).describe('A list of 2 unique project suggestions.'),
});
export type SuggestProjectsOutput = z.infer<typeof SuggestProjectsOutputSchema>;

export async function suggestProjects(
  input: SuggestProjectsInput
): Promise<SuggestProjectsOutput> {
  return suggestProjectsFlow(input);
}

const suggestProjectsPrompt = ai.definePrompt({
  name: 'suggestProjectsPrompt',
  input: { schema: SuggestProjectsInputSchema },
  output: { schema: SuggestProjectsOutputSchema },
  prompt: `You are an expert career advisor for software engineers. Your task is to suggest impressive portfolio projects based on a user's prompt.
The projects should be realistic for a single developer and highlight skills that are valuable in the job market.

User Prompt: {{{prompt}}}

Please generate 2 distinct project ideas. For each project, provide:
1. A clear, compelling title.
2. A one-paragraph description.
3. A bulleted list of 3-5 core features.
4. A recommended technology stack. Prefer modern technologies like Next.js, React, Firebase, Tailwind CSS, and Genkit for AI features.
`,
});

const suggestProjectsFlow = ai.defineFlow(
  {
    name: 'suggestProjectsFlow',
    inputSchema: SuggestProjectsInputSchema,
    outputSchema: SuggestProjectsOutputSchema,
  },
  async input => {
    const { output } = await suggestProjectsPrompt(input);
    return output!;
  }
);
