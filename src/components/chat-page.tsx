
'use client';

import { useState } from 'react';
import { Plus, LogOut, User, Settings, Presentation } from 'lucide-react';

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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-8 text-primary shrink-0"
            >
              <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8.5 8.5C9.32843 8.5 10 9.17157 10 10C10 10.8284 9.32843 11.5 8.5 11.5C7.67157 11.5 7 10.8284 7 10C7 9.17157 7.67157 8.5 8.5 8.5Z"
                fill="currentColor"
              />
              <path
                d="M15.5 12.5C16.3284 12.5 17 13.1716 17 14C17 14.8284 16.3284 15.5 15.5 15.5C14.6716 15.5 14 14.8284 14 14C14 13.1716 14.6716 12.5 15.5 12.5Z"
                fill="currentColor"
              />
              <path
                d="M12 7C12.5523 7 13 7.44772 13 8V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V8C11 7.44772 11.4477 7 12 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
