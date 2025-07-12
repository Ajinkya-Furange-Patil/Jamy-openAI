import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-response.ts';
import '@/ai/flows/maintain-conversation-context.ts';
import '@/ai/flows/generate-document-summary.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/email-assistant.ts';
import '@/ai/flows/language-translator.ts';
