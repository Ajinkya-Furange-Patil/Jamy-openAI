
import type { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: ReactNode;
  content?: ReactNode; // For rich content like images
  attachment?: {
    name: string;
    type: string;
  };
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
}
