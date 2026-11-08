'use server';
/**
 * @fileOverview An AI agent to provide networking suggestions, mentorship shadowing opportunities, and collaborative events.
 *
 * - provideAiNetworkingSuggestions - A function that handles the generation of networking suggestions.
 * - NetworkingSuggestionInput - The input type for the provideAiNetworkingSuggestions function.
 * - NetworkingSuggestionOutput - The return type for the provideAiNetworkingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NetworkingSuggestionInputSchema = z.object({
  userProfile: z
    .string()
    .describe("A summary of the user's professional profile, including skills, experience, and interests."),
  networkingGoals: z
    .string()
    .describe('The users specific networking goals, such as finding a mentor or learning a new skill.'),
});
export type NetworkingSuggestionInput = z.infer<typeof NetworkingSuggestionInputSchema>;

const NetworkingSuggestionOutputSchema = z.object({
  networkingSuggestions: z
    .array(z.string())
    .describe('A list of networking suggestions tailored to the user profile and goals.'),
  mentorshipOpportunities: z
    .array(z.string())
    .describe('A list of mentorship shadowing opportunities.'),
  collaborationEvents: z
    .array(z.string())
    .describe('A list of potential collaborative events the user might be interested in.'),
});
export type NetworkingSuggestionOutput = z.infer<typeof NetworkingSuggestionOutputSchema>;

export async function provideAiNetworkingSuggestions(
  input: NetworkingSuggestionInput
): Promise<NetworkingSuggestionOutput> {
  return provideAiNetworkingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiNetworkingSuggestionsPrompt',
  input: {schema: NetworkingSuggestionInputSchema},
  output: {schema: NetworkingSuggestionOutputSchema},
  prompt: `You are an AI-powered career advisor specializing in providing networking suggestions.

  Based on the user's professional profile and networking goals, suggest relevant networking opportunities, mentorship possibilities, and collaborative events.

  Profile: {{{userProfile}}}
  Goals: {{{networkingGoals}}}

  Consider the user's skills, experience, interests, and goals when generating suggestions.  The networkingSuggestions, mentorshipOpportunities and collaborationEvents should be distinct, and well-suited to the user.
  `,
});

const provideAiNetworkingSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideAiNetworkingSuggestionsFlow',
    inputSchema: NetworkingSuggestionInputSchema,
    outputSchema: NetworkingSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
