import type { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: ReactNode;
}
