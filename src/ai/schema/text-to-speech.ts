import { z } from 'zod';

export const TextToSpeechInputSchema = z.string();
export const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe('The audio data URI of the spoken text.'),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
