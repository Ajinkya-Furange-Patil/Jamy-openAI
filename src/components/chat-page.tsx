
'use client';

import { useState, useEffect } from 'react';
import { Plus, LogOut, User, Settings, Presentation, FileText, NotebookText, Mail, Languages, GraduationCap, ClipboardEdit, Briefcase, PenSquare, Paperclip, MessageSquare } from 'lucide-react';

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
import { type Message, type Tool } from '@/lib/types';
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
import { AudioPlayer } from './audio-player';
import { Badge } from './ui/badge';
import { SettingsDialog } from './settings-dialog';
import { cn } from '@/lib/utils';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello there! I'm Yadi AI, your friendly assistant. How can I help you today? Feel free to select a specialized tool or just start chatting.",
  },
];

const toolPlaceholders: Record<Tool, string> = {
    chat: 'Type your message here or use the microphone...',
    summarize: 'Attach a .txt file to summarize. You can add optional instructions here.',
    email: 'Describe the email you want to write. For example, "Draft a follow-up email to a client..."',
    translate: 'Enter the text you want to translate. For example, "Translate \'Hello, how are you?\' to French"',
    'homework-helper': 'Ask a question about your homework...',
    'research-assistant': 'What topic do you need help researching?',
    'meeting-summarizer': 'Paste the meeting transcript or attach a file to summarize.',
    'report-writer': 'Describe the report you need. For example, "Write a quarterly sales report..."'
};

const toolInitialMessages: Record<Tool, Message[]> = {
    chat: initialMessages,
    summarize: [{ id: '1', role: 'assistant', content: 'Welcome to the Summarizer tool. Please attach a text file (.txt) and I will provide a concise summary for you.' }],
    email: [{ id: '1', role: 'assistant', content: 'Welcome to the Email Assistant. Tell me what kind of email you need to write, and I\'ll draft it for you.' }],
    translate: [{ id: '1', role: 'assistant', content: 'Welcome to the Language Translator. Enter any text and I will translate it for you.' }],
    'homework-helper': [{ id: '1', role: 'assistant', content: 'Welcome to the Homework Helper. How can I assist you with your assignments?' }],
    'research-assistant': [{ id: '1', role: 'assistant', content: 'Welcome to the Research Assistant. What information are you looking for today?' }],
    'meeting-summarizer': [{ id: '1', role: 'assistant', content: 'Welcome to the Meeting Summarizer. You can paste a transcript or upload a file to get started.' }],
    'report-writer': [{ id: '1', role: 'assistant', content: 'Welcome to the Report Writer. Describe the report you need, and I will help you create it.' }],
};


export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [history, setHistory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('chat');
  const [customInstructions, setCustomInstructions] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedInstructions = localStorage.getItem('customInstructions');
    if (storedInstructions) {
      setCustomInstructions(storedInstructions);
    }
  }, []);

  const handleNewConversation = () => {
    setMessages(toolInitialMessages[activeTool] || initialMessages);
    setHistory('');
    setAudioUrl('');
  };
  
  const handleToolChange = (tool: Tool) => {
      setActiveTool(tool);
      setMessages(toolInitialMessages[tool] || initialMessages);
      setHistory('');
      setAudioUrl('');
  }

  const fileToText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            resolve(text);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
  }


  const handleSendMessage = async (input: string, file?: File) => {
    if (isLoading || (!input.trim() && !file)) return;
  
    let messageContent: React.ReactNode = input;
    let documentText: string | undefined;

    if ((activeTool === 'summarize' || activeTool === 'meeting-summarizer') && !file && !input.trim()) {
        toast({
            variant: 'destructive',
            title: 'Input Required',
            description: `The ${activeTool} tool requires a file or text to be provided.`,
        });
        return;
    }

    if (file) {
      if (file.type.startsWith('text/')) {
        try {
          documentText = await fileToText(file);
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'Could not read the text from the uploaded file.',
          });
          return;
        }
      } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Currently, only plain text files (.txt) are supported.',
        });
        return;
      }
      
      const fileBadge = (
        <Badge variant="outline" className="flex items-center gap-2 max-w-xs">
          <Paperclip className="h-4 w-4" />
          <span className="truncate">{file.name}</span>
        </Badge>
      );
      messageContent = (
        <div className="flex flex-col gap-2">
          {input && <span>{input}</span>}
          {fileBadge}
        </div>
      );
    }

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: messageContent || "Processing file...", // Show placeholder if no text
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setAudioUrl('');

    const result = await sendMessage(history, input, documentText, activeTool, customInstructions);
    
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      // Revert optimistic UI update on error
      setMessages(prev => prev.slice(0, -1));
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
    
    if (result.audioUrl) {
      setAudioUrl(result.audioUrl);
    }
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
    <>
      <SidebarProvider>
        <Sidebar side="left" collapsible="icon" variant="sidebar">
          <SidebarHeader className="p-2">
            <div className="flex items-center gap-2 p-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8 text-primary shrink-0">
                  <path d="M16 2.66663C16 2.66663 8 7.33329 8 16C8 24.6666 16 29.3333 16 29.3333C16 29.3333 24 24.6666 24 16C24 7.33329 16 2.66663 16 2.66663Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12L12 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            <SidebarSeparator />
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolChange('chat')}
                isActive={activeTool === 'chat'}
                tooltip={{ children: 'General Chat', side: 'right' }}
                className="w-full"
              >
                <MessageSquare className="size-4" />
                <span>Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarGroup className="px-0 pt-4 pb-2">
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleToolChange('summarize')}
                  isActive={activeTool === 'summarize'}
                  tooltip={{ children: 'Summarize Document', side: 'right' }}
                  className="w-full"
                >
                  <NotebookText className="size-4" />
                  <span>Summarize</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleToolChange('email')}
                  isActive={activeTool === 'email'}
                  tooltip={{ children: 'Email Assistant', side: 'right' }}
                  className="w-full"
                >
                  <Mail className="size-4" />
                  <span>Email Assistant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleToolChange('translate')}
                  isActive={activeTool === 'translate'}
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
                  onClick={() => handleToolChange('homework-helper')}
                  isActive={activeTool === 'homework-helper'}
                  tooltip={{ children: 'Homework Helper', side: 'right' }}
                  className="w-full"
                >
                  <ClipboardEdit className="size-4" />
                  <span>Homework Helper</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleToolChange('research-assistant')}
                  isActive={activeTool === 'research-assistant'}
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
                  onClick={() => handleToolChange('meeting-summarizer')}
                  isActive={activeTool === 'meeting-summarizer'}
                  tooltip={{ children: 'Meeting Summarizer', side: 'right' }}
                  className="w-full"
                >
                  <Briefcase className="size-4" />
                  <span>Meeting Summarizer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleToolChange('report-writer')}
                  isActive={activeTool === 'report-writer'}
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
                onClick={() => setIsSettingsOpen(true)}
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
        <SidebarInset className={cn("flex flex-col h-[100svh] animated-gradient")}>
          <ChatHeader />
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={toolPlaceholders[activeTool]}
            activeTool={activeTool}
            key={activeTool}
          />
          {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
        </SidebarInset>
      </SidebarProvider>
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onClearHistory={handleNewConversation}
        onCustomInstructionsChange={setCustomInstructions}
      />
    </>
  );
}
