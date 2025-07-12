
'use client';

import { useState } from 'react';
import { Plus, LogOut, User, Settings, Presentation, FileText, NotebookText, Mail, Languages, GraduationCap, ClipboardEdit, Briefcase, PenSquare } from 'lucide-react';

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
  SidebarGroup,
  SidebarGroupLabel,
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
  
  const handleSummarize = () => {
    toast({
      title: 'Summarize Document',
      description: 'Document summarization is not yet implemented in the UI.',
    });
  };

  const handleEmailAssistant = () => {
    toast({
      title: 'Email Assistant',
      description: 'Email Assistant is not yet implemented.',
    });
  };

  const handleTranslate = () => {
    toast({
      title: 'Language Translator',
      description: 'Language Translator is not yet implemented.',
    });
  };

  const handleHomeworkHelper = () => {
    toast({
      title: 'Homework Helper',
      description: 'Homework Helper is not yet implemented.',
    });
  };

  const handleResearchAssistant = () => {
    toast({
      title: 'Research Assistant',
      description: 'Research Assistant is not yet implemented.',
    });
  };

  const handleMeetingSummarizer = () => {
    toast({
      title: 'Meeting Summarizer',
      description: 'Meeting Summarizer is not yet implemented.',
    });
  };

  const handleReportWriter = () => {
    toast({
      title: 'Report Writer',
      description: 'Report Writer is not yet implemented.',
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
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <SidebarGroup className="px-0 pt-4 pb-2">
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSummarize}
                tooltip={{ children: 'Summarize Document', side: 'right' }}
                className="w-full"
              >
                <NotebookText className="size-4" />
                <span>Summarize</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleEmailAssistant}
                tooltip={{ children: 'Email Assistant', side: 'right' }}
                className="w-full"
              >
                <Mail className="size-4" />
                <span>Email Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleTranslate}
                tooltip={{ children: 'Language Translator', side: 'right' }}
                className="w-full"
              >
                <Languages className="size-4" />
                <span>Translator</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup className="px-0 pt-2 pb-2">
            <SidebarGroupLabel>For Students</SidebarGroupLabel>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleHomeworkHelper}
                tooltip={{ children: 'Homework Helper', side: 'right' }}
                className="w-full"
              >
                <ClipboardEdit className="size-4" />
                <span>Homework Helper</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleResearchAssistant}
                tooltip={{ children: 'Research Assistant', side: 'right' }}
                className="w-full"
              >
                <GraduationCap className="size-4" />
                <span>Research Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup className="px-0 pt-2 pb-2">
            <SidebarGroupLabel>For Professionals</SidebarGroupLabel>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleMeetingSummarizer}
                tooltip={{ children: 'Meeting Summarizer', side: 'right' }}
                className="w-full"
              >
                <Briefcase className="size-4" />
                <span>Meeting Summarizer</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleReportWriter}
                tooltip={{ children: 'Report Writer', side: 'right' }}
                className="w-full"
              >
                <PenSquare className="size-4" />
                <span>Report Writer</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
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
