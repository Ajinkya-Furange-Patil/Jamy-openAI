import type { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: ReactNode;
  content?: ReactNode;
  audioUrl?: string;
}

export interface Conversation {
    id: string;
    messages: Message[];
}
