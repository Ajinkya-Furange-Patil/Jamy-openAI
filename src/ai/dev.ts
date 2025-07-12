import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-response.ts';
import '@/ai/flows/maintain-conversation-context.ts';
import '@/ai/flows/generate-document-summary.ts';