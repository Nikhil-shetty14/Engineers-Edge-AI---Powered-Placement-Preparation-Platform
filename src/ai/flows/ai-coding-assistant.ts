'use server';

/**
 * @fileOverview An AI-powered coding assistant.
 *
 * - aiCodingAssistant - A function that provides help with coding questions.
 * - AiCodingAssistantInput - The input type for the function.
 * - AiCodingAssistantOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiCodingAssistantInputSchema = z.object({
  prompt: z.string().describe('The user\'s coding question or code snippet.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type AiCodingAssistantInput = z.infer<typeof AiCodingAssistantInputSchema>;

const AiCodingAssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s prompt.'),
});
export type AiCodingAssistantOutput = z.infer<typeof AiCodingAssistantOutputSchema>;

export async function aiCodingAssistant(input: AiCodingAssistantInput): Promise<AiCodingAssistantOutput> {
  return aiCodingAssistantFlow(input);
}

const codingAssistantPrompt = ai.definePrompt({
  name: 'aiCodingAssistantPrompt',
  input: { schema: AiCodingAssistantInputSchema },
  output: { schema: AiCodingAssistantOutputSchema },
  prompt: `You are an expert AI Coding Assistant. Your role is to help users with their programming questions, debug code, and explain complex topics.

  Provide clear, concise, and accurate answers. When providing code examples, use Markdown code blocks with the appropriate language identifier (e.g., \`\`\`javascript).

  Conversation History:
  {{#each conversationHistory}}
  **{{role}}:**
  {{{content}}}
  ---
  {{/each}}

  User's Request:
  {{{prompt}}}

  Your Response:
  `,
});


const aiCodingAssistantFlow = ai.defineFlow(
  {
    name: 'aiCodingAssistantFlow',
    inputSchema: AiCodingAssistantInputSchema,
    outputSchema: AiCodingAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await codingAssistantPrompt(input);
    return output!;
  }
);
