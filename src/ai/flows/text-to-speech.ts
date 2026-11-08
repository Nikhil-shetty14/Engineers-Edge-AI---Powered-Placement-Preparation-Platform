'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) flow using Genkit.
 *
 * - textToSpeech - Converts a string of text into an audio data URI.
 */

import { ai } from '@/ai/genkit';
import {
  TextToSpeechInputSchema,
  TextToSpeechOutputSchema,
  type TextToSpeechInput,
  type TextToSpeechOutput,
} from '@/ai/schema/text-to-speech';
import wav from 'wav';

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
        prompt: query,
      });

      if (!media || !media.url) {
        return { audio: '' };
      }

      const pcmData = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const wavData = await toWav(pcmData);
      const audioDataUri = `data:audio/wav;base64,${wavData}`;

      return { audio: audioDataUri };
    } catch (error) {
      console.warn('Text-to-speech generation warning:', error);
      return { audio: '' };
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
