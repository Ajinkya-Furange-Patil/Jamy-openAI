
'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, User, Settings, NotebookText, Mail, Languages, GraduationCap, ClipboardEdit, PenSquare, Image as ImageIcon, MessageSquare, Briefcase } from 'lucide-react';

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
import type { Message } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { AudioPlayer } from './audio-player';
import { Badge } from './ui/badge';
import { SettingsDialog } from './settings-dialog';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { Paperclip } from 'lucide-react';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hello there! I'm Yadi AI, your advanced assistant. I can search the web, write code, create UI, and even generate images. How can I help you today?",
  },
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [history, setHistory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [voice, setVoice] = useState<string>('Algenib');
  const [currentTool, setCurrentTool] = useState('chat');
  const { toast } = useToast();

  useEffect(() => {
    const storedInstructions = localStorage.getItem('customInstructions');
    if (storedInstructions) {
      setCustomInstructions(storedInstructions);
    }
    const storedVoice = localStorage.getItem('voice');
    if (storedVoice) {
      setVoice(storedVoice);
    }
  }, []);

  const handleNewConversation = () => {
    setMessages(initialMessages);
    setHistory('');
    setAudioUrl('');
    setCurrentTool('chat');
  };

  const handleToolSelect = (tool: string, prompt?: string) => {
    setCurrentTool(tool);
    if(prompt) {
        const input = document.querySelector('textarea[placeholder="Ask me anything..."]');
        if (input) {
            (input as HTMLTextAreaElement).value = prompt;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            (input as HTMLTextAreaElement).focus();
        }
    }
  };

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
  };

  const handleSendMessage = async (input: string, file?: File) => {
    if (isLoading || (!input.trim() && !file)) return;

    let messageText: React.ReactNode = input;
    let documentText: string | undefined;

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
      messageText = (
        <div className="flex flex-col gap-2">
          {input && <span>{input}</span>}
          {fileBadge}
        </div>
      );
    }

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text: messageText || 'Processing file...', // Show placeholder if no text
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setAudioUrl('');

    const result = await sendMessage(
      history,
      input,
      documentText,
      customInstructions,
      voice
    );

    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      // Revert optimistic UI update on error
      setMessages((prev) => prev.slice(0, -1));
      return;
    }

    if (result.aiResponse) {
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: result.aiResponse,
        content: result.aiResponseContent,
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
        <Button className="w-full" onClick={() => setIsLoggedIn(true)}>
          Login
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-2 h-auto">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2 items-center">
                <Avatar className="size-8">
                  <AvatarImage
                    src="https://placehold.co/100x100.png"
                    data-ai-hint="profile picture"
                    alt="User avatar"
                  />
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
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-8 text-primary shrink-0"
              >
                <path
                  d="M16 2.66663C16 2.66663 8 7.33329 8 16C8 24.6666 16 29.3333 16 29.3333C16 29.3333 24 24.6666 24 16C24 7.33329 16 2.66663 16 2.66663Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 12L12 20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L20 20"
                  stroke="currentColor"
                  strokeWidth="2.5"
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
            <SidebarSeparator />
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('chat')}
                isActive={currentTool === 'chat'}
                tooltip={{ children: 'Chat', side: 'right' }}
                className="w-full"
              >
                <MessageSquare className="size-4" />
                <span>Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('image', 'Generate an image of ')}
                isActive={currentTool === 'image'}
                tooltip={{ children: 'Image Creator', side: 'right' }}
                className="w-full"
              >
                <ImageIcon className="size-4" />
                <span>Image Creator</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('summarize', 'Summarize the following document: ')}
                isActive={currentTool === 'summarize'}
                tooltip={{ children: 'Summarize', side: 'right' }}
                className="w-full"
              >
                <NotebookText className="size-4" />
                <span>Summarize</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('email', 'Write an email about ')}
                isActive={currentTool === 'email'}
                tooltip={{ children: 'Email Assistant', side: 'right' }}
                className="w-full"
              >
                <Mail className="size-4" />
                <span>Email Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('translate', 'Translate the following to Spanish: ')}
                isActive={currentTool === 'translate'}
                tooltip={{ children: 'Translate', side: 'right' }}
                className="w-full"
              >
                <Languages className="size-4" />
                <span>Translator</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator />
            
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleToolSelect('homework', 'Help me with my homework: ')}
                isActive={currentTool === 'homework'}
                tooltip={{ children: 'Homework Helper', side: 'right' }}
                className="w-full"
              >
                <GraduationCap className="size-4" />
                <span>For Students</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                 onClick={() => handleToolSelect('professional', 'Write a report on ')}
                 isActive={currentTool === 'professional'}
                tooltip={{ children: 'Professional Tools', side: 'right' }}
                className="w-full"
              >
                <Briefcase className="size-4" />
                <span>For Professionals</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
        <SidebarInset
          className={cn('flex flex-col h-[100svh] animated-gradient')}
        >
          <ChatHeader />
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={'Ask me anything...'}
          />
          {audioUrl && <AudioUrlProvider audioUrl={audioUrl} />}
        </SidebarInset>
      </SidebarProvider>
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onClearHistory={handleNewConversation}
        onCustomInstructionsChange={setCustomInstructions}
        onVoiceChange={setVoice}
      />
    </>
  );
}

function AudioUrlProvider({ audioUrl }: { audioUrl: string }) {
  const [url, setUrl] = useState(audioUrl);

  useEffect(() => {
    setUrl(audioUrl);
  }, [audioUrl]);

  if (!url) return null;

  return <AudioPlayer audioUrl={url} />;
}
