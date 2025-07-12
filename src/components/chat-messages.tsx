import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 md:p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3 w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback className="bg-background">
                  <Bot className="text-primary" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-sm md:max-w-md rounded-lg px-4 py-3',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback className="bg-background">
                  <User className="text-primary" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3 w-full justify-start">
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback className="bg-background">
                  <Bot className="text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-sm md:max-w-md rounded-lg px-4 py-3 bg-muted">
                <Loader2 className="animate-spin text-primary" />
              </div>
            </div>
        )}
      </div>
    </ScrollArea>
  );
}
