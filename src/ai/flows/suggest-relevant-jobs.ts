'use server';

/**
 * @fileOverview Suggests relevant job roles based on user profile data.
 *
 * - suggestRelevantJobs - A function that suggests relevant job roles.
 * - SuggestRelevantJobsInput - The input type for the suggestRelevantJobs function.
 * - SuggestRelevantJobsOutput - The return type for the suggestRelevantJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantJobsInputSchema = z.object({
  profileData: z
    .string()
    .describe("User's profile data from LinkedIn, GitHub, and projects."),
});
export type SuggestRelevantJobsInput = z.infer<typeof SuggestRelevantJobsInputSchema>;

const JobRoleSchema = z.object({
  title: z.string().describe('The title of the job role.'),
  company: z.string().describe('The company offering the job.'),
  location: z.string().describe('The location of the job.'),
  description: z.string().describe('A brief description of the job.'),
  skills: z.array(z.string()).describe('List of skills required for the job.'),
  relevanceScore: z.number().describe('A score indicating how relevant the job is to the user.'),
});

const SkillMapEntrySchema = z.object({
  skill: z.string().describe('The name of the skill.'),
  importance: z.number().describe('The importance of the skill.'),
});

const SuggestRelevantJobsOutputSchema = z.object({
  jobRoles: z.array(JobRoleSchema).describe('A list of suggested job roles.'),
  skillMap: z
    .array(SkillMapEntrySchema)
    .describe(
      'An array of skills and their importance based on the suggested job roles.'
    ),
});
export type SuggestRelevantJobsOutput = z.infer<typeof SuggestRelevantJobsOutputSchema>;

export async function suggestRelevantJobs(
  input: SuggestRelevantJobsInput
): Promise<SuggestRelevantJobsOutput> {
  return suggestRelevantJobsFlow(input);
}

const suggestRelevantJobsPrompt = ai.definePrompt({
  name: 'suggestRelevantJobsPrompt',
  input: {schema: SuggestRelevantJobsInputSchema},
  output: {schema: SuggestRelevantJobsOutputSchema},
  prompt: `You are an AI-powered career advisor. Analyze the user's profile data and suggest relevant job roles. Also, generate a skill map based on the job roles.

User Profile Data: {{{profileData}}}

Output the job roles and skill map in JSON format.

Consider the relevance score of each job role to the user profile data.
Include the skills required for each job.
Create a skill map, considering how many times each skill is used across all job roles. The more prevalent a skill, the higher it should be weighted in the skillmap.
`,
});

const suggestRelevantJobsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantJobsFlow',
    inputSchema: SuggestRelevantJobsInputSchema,
    outputSchema: SuggestRelevantJobsOutputSchema,
  },
  async input => {
    const {output} = await suggestRelevantJobsPrompt(input);
    return output!;
  }
);
