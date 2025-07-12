'use client';

import { useState } from 'react';
import { Plus, Bot } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { type Message } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm Yadi AI. How can I assist you today?",
  },
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [history, setHistory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNewConversation = () => {
    setMessages(initialMessages);
    setHistory('');
  };

  const handleSendMessage = async (input: string) => {
    if (isLoading || !input.trim()) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const result = await sendMessage(history, input);
    
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    if (result.aiResponse) {
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: result.aiResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
    
    if (result.updatedConversationHistory) {
      setHistory(result.updatedConversationHistory);
    }
  };

  const handleGeneratePdf = () => {
    // TODO: Implement PDF generation logic
    toast({
      title: 'Generate PDF',
      description: 'PDF generation is not yet implemented.',
    });
  };

  const handleGeneratePpt = () => {
    // TODO: Implement PPT generation logic
    toast({
      title: 'Generate PPT',
      description: 'PPT generation is not yet implemented.',
    });
  };


  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-2">
          <div className="flex items-center gap-2 p-2">
            <Bot className="size-8 text-primary shrink-0" />
            <span className="text-xl font-semibold">Yadi AI</span>
          </div>
        </SidebarHeader>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleNewConversation}
              tooltip={{ children: 'New Conversation', side: 'right' }}
              className="w-full"
            >
              <Plus className="size-4" />
              <span>New Conversation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset className="flex flex-col h-[100svh]">
        <ChatHeader onGeneratePdf={handleGeneratePdf} onGeneratePpt={handleGeneratePpt} />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </SidebarInset>
    </SidebarProvider>
  );
}
