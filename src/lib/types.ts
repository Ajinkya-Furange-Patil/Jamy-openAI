import type { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: ReactNode;
  audioUrl?: string;
}

export type Tool =
  | 'chat'
  | 'summarize'
  | 'email'
  | 'translate'
  | 'homework-helper'
  | 'research-assistant'
  | 'meeting-summarizer'
  | 'report-writer';
