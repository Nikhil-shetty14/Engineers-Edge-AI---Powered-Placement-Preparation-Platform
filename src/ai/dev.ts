'use server';

/**
 * @fileoverview This file is the entry point for Genkit's development server.
 *
 * It imports all the defined flows and schemas so that they can be discovered
 * and used by the Genkit tools.
 */

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ai-optimized-resume.ts';
import '@/ai/flows/simulate-technical-interviews.ts';
import '@/ai/flows/provide-ai-networking-suggestions.ts';
import '@/ai/flows/suggest-relevant-jobs.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/suggest-projects.ts';
import '@/ai/flows/ai-coding-assistant.ts';
import '@/ai/flows/generate-note-summary.ts';
