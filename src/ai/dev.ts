'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-response.ts';
import '@/ai/flows/maintain-conversation-context.ts';
import '@/ai/flows/generate-document-summary.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/email-assistant.ts';
import '@/ai/flows/language-translator.ts';
import '@/ai/flows/homework-helper.ts';
import '@/ai/flows/research-assistant.ts';
import '@/ai/flows/meeting-summarizer.ts';
import '@/ai/flows/report-writer.ts';
import '@/ai/flows/image-creator.ts';
import '@/ai/flows/orchestrator-flow.ts';
