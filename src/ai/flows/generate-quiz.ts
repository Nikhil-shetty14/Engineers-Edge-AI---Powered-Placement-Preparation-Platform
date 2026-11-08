'use server';

/**
 * @fileOverview Generates a technical quiz based on a given topic.
 *
 * - generateQuiz - A function to generate a quiz with questions and answers.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).describe('An array of 4 multiple-choice options.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  explanation: z.string().describe('A brief explanation of why the answer is correct.'),
});

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz (e.g., Python, C, React).'),
  numQuestions: z.number().default(5).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuestionSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an expert in creating educational content and technical quizzes.

  Generate a quiz with {{numQuestions}} multiple-choice questions for the following topic: {{{topic}}}.

  Each question must have exactly 4 options.
  For each question, provide the question text, the array of options, the correct answer, and a concise explanation for the correct answer.
  Ensure the questions cover a range of difficulties from easy to moderate.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
