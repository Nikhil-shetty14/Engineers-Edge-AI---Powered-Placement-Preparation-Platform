'use server';
/**
 * @fileOverview Simulates technical interviews by generating questions and providing feedback.
 *
 * - simulateTechnicalInterview - A function to start the interview simulation.
 * - SimulateTechnicalInterviewInput - The input type for the simulateTechnicalInterview function.
 * - SimulateTechnicalInterviewOutput - The return type for the simulateTechnicalInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateTechnicalInterviewInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile including skills, experience, and job history.'),
  jobDescription: z
    .string()
    .describe('The job description for the role the user is interviewing for.'),
  userAnswer: z.string().optional().describe('The user provided answer to the interview question.'),
  previousQuestions: z
    .array(z.string())
    .optional()
    .describe('The list of previous questions asked in the interview.'),
});
export type SimulateTechnicalInterviewInput = z.infer<typeof SimulateTechnicalInterviewInputSchema>;

const SimulateTechnicalInterviewOutputSchema = z.object({
  question: z.string().describe('The next interview question to ask the candidate.'),
  feedback: z.string().optional().describe('Feedback on the candidate answer, if available.'),
  isSuitableQuestion: z
    .boolean()
    .optional()
    .describe('A flag indicating if the user answer was suitable for the prompt'),
});
export type SimulateTechnicalInterviewOutput = z.infer<typeof SimulateTechnicalInterviewOutputSchema>;

export async function simulateTechnicalInterview(
  input: SimulateTechnicalInterviewInput
): Promise<SimulateTechnicalInterviewOutput> {
  return simulateTechnicalInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateTechnicalInterviewPrompt',
  input: {schema: SimulateTechnicalInterviewInputSchema},
  output: {schema: SimulateTechnicalInterviewOutputSchema},
  prompt: `You are an AI-powered interview simulator designed to help candidates prepare for technical interviews.

  Your goal is to simulate a realistic technical interview experience, providing questions and feedback to the candidate.

  Consider the user's profile and the job description to generate relevant technical questions. If the user provides an answer,
  evaluate the answer and provide constructive feedback, otherwise return a first question.

  User Profile:
  {{userProfile}}

  Job Description:
  {{jobDescription}}

  Previous Questions:
  {{#each previousQuestions}}
    - {{this}}
  {{/each}}

  User Answer (if available):
  {{userAnswer}}
  \n  Based on all of the above information, generate the next technical question. If user answer is available, determine if the user answer was suitable for the prompt.
  Give feedback if the user answer is available.
  Output the next question and feedback as JSON. Make sure that the "question" and "feedback" keys are set.
  Also, populate the "isSuitableQuestion" key.
  Make sure that the JSON is valid. Do not include any other text in the response.
  `,
});

const simulateTechnicalInterviewFlow = ai.defineFlow(
  {
    name: 'simulateTechnicalInterviewFlow',
    inputSchema: SimulateTechnicalInterviewInputSchema,
    outputSchema: SimulateTechnicalInterviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
