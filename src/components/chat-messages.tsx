
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

function TypingIndicator() {
    return (
        <div className="relative w-2 h-2 rounded-full bg-current text-primary dot-flashing before:w-2 before:h-2 before:rounded-full before:bg-current before:left-[-12px] after:w-2 after:h-2 after:rounded-full after:bg-current after:left-[12px]"/>
    )
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 md:p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3 w-full fade-in',
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
                'max-w-sm md:max-w-md rounded-lg px-4 py-3 shadow-md transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 hover:shadow-primary/20',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <div className="text-sm whitespace-pre-wrap space-y-2">{message.content}</div>
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
           <div className="flex items-start gap-3 w-full justify-start fade-in">
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback className="bg-background">
                  <Bot className="text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-sm md:max-w-md rounded-lg px-4 py-3 bg-muted flex items-center justify-center min-h-[44px]">
                <TypingIndicator />
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
