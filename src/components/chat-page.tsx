
'use client';

import { useState } from 'react';
import { Plus, LogOut, User, Settings } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { type Message } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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
    toast({
      title: 'Generate PDF',
      description: 'PDF generation is not yet implemented.',
    });
  };

  const handleGeneratePpt = () => {
    toast({
      title: 'Generate PPT',
      description: 'PPT generation is not yet implemented.',
    });
  };
  
  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: 'Settings are not yet implemented.',
    });
  };

  const UserProfile = () => {
    if (!isLoggedIn) {
      return (
        <Button className="w-full" onClick={() => setIsLoggedIn(true)}>Login</Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-2 h-auto">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2 items-center">
                <Avatar className="size-8">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="profile picture" alt="User avatar" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">John Doe</span>
                  <span className="text-xs text-muted-foreground">john.doe@example.com</span>
                </div>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mb-2">
          <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-2">
          <div className="flex items-center gap-2 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-8 text-primary shrink-0"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 19 9 19 7c0-2.2-1.8-4-4-4S11 4.8 11 7c0 2 1.3 3.2 2.5 4.5.8.8 1.3 1.5 1.5 2.5" />
              <path d="M9 18c-3.3 0-6-2.7-6-6v-1.5" />
              <path d="M14 22v-4.5" />
              <path d="M10 14H2" />
              <path d="M3 21.5V17" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-xl font-semibold">Yadi AI</span>
          </div>
        </SidebarHeader>
        <SidebarMenu className="p-2 flex-1">
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
        <SidebarSeparator />
        <SidebarFooter className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSettings}
              tooltip={{ children: 'Settings', side: 'right' }}
              className="w-full"
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col h-[100svh]">
        <ChatHeader onGeneratePdf={handleGeneratePdf} onGeneratePpt={handleGeneratePpt} />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </SidebarInset>
    </SidebarProvider>
  );
}
