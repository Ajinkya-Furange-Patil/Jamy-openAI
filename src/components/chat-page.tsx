
'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Settings, NotebookText, Mail, Languages, GraduationCap, Briefcase, MessageSquare, Trash2, Bot, PencilRuler, BrainCircuit } from 'lucide-react';

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
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import type { Message, Conversation } from '@/lib/types';
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
import { LogOut, Paperclip } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const initialMessage: Message = {
  id: '1',
  role: 'assistant',
  text: "Hello there! I'm JAMY, your advanced assistant. I can search the web, write code, create UI, and even generate images. How can I help you today?",
};


export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [voice, setVoice] = useState<string>('Algenib');
  const { toast } = useToast();

  useEffect(() => {
    const storedConversations = localStorage.getItem('conversations');
    const storedInstructions = localStorage.getItem('customInstructions');
    const storedVoice = localStorage.getItem('voice');

    if (storedInstructions) setCustomInstructions(storedInstructions);
    if (storedVoice) setVoice(storedVoice);

    if (storedConversations) {
      try {
        const parsedConvos = JSON.parse(storedConversations);
        if (Array.isArray(parsedConvos) && parsedConvos.length > 0) {
          setConversations(parsedConvos);
          setActiveConversationId(parsedConvos[0].id);
          return;
        }
      } catch (e) {
         console.error("Failed to parse conversations from localStorage", e);
         // If parsing fails, start with a new conversation
      }
    }
    handleNewConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Avoid saving empty conversations array on initial load
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const updateActiveConversation = (updater: (convo: Conversation) => Conversation) => {
    setConversations(prev =>
      prev.map(c => (c.id === activeConversationId ? updater(c) : c))
    );
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `convo-${Date.now()}`,
      messages: [initialMessage],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setAudioUrl('');
  };

  const deleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    setConversations(remainingConversations);
    
    if (activeConversationId === id) {
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        handleNewConversation();
      }
    }
    // If we delete all conversations, clear from storage as well
    if (remainingConversations.length === 0) {
        localStorage.removeItem('conversations');
    }
  }

  const handleToolSelect = (prompt: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      // A little trick to programmatically update the textarea value and its state
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(textarea, prompt);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  const fileToText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSendMessage = async (input: string, file?: File) => {
    if (isLoading || (!input.trim() && !file) || !activeConversation) return;

    let messageText: React.ReactNode = input;
    let documentText: string | undefined;

    if (file) {
      if (!file.type.startsWith('text/')) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Currently, only plain text files (.txt) are supported.',
        });
        return;
      }
      try {
        documentText = await fileToText(file);
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
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'Could not read the text from the uploaded file.',
        });
        return;
      }
    }

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text: messageText,
    };

    const currentHistory = activeConversation.messages;

    updateActiveConversation(c => ({
      ...c,
      messages: [...c.messages, userMessage],
    }));

    setIsLoading(true);
    setAudioUrl('');

    const result = await sendMessage(
      currentHistory,
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
      // Revert message on error
      updateActiveConversation(c => ({
        ...c,
        messages: c.messages.slice(0, -1),
      }));
      return;
    }

    if (result.aiResponse) {
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: result.aiResponse,
        content: result.aiResponseContent,
      };
      updateActiveConversation(c => ({
        ...c,
        messages: [...c.messages, aiMessage],
      }));
    } else {
       // Revert message if no response
       updateActiveConversation(c => ({
        ...c,
        messages: c.messages.slice(0, -1),
      }));
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
            <Bot className="size-8 text-primary shrink-0"/>
              <span className="text-xl font-semibold">JAMY</span>
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

             <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Features</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleToolSelect('Summarize the following document:')} tooltip={{ children: 'Summarize', side: 'right' }}>
                      <NotebookText /><span>Summarize</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleToolSelect('Draft an email to...')} tooltip={{ children: 'Email Assistant', side: 'right' }}>
                      <Mail /><span>Email Assistant</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton onClick={() => handleToolSelect('Translate the following text to...')} tooltip={{ children: 'Translate', side: 'right' }}>
                       <Languages /><span>Translate</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                     <SidebarMenuButton onClick={() => handleToolSelect('I have a homework question...')} tooltip={{ children: 'Homework Helper', side: 'right' }}>
                       <GraduationCap /><span>Homework Helper</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton onClick={() => handleToolSelect('Write a report on...')} tooltip={{ children: 'Report Writer', side: 'right' }}>
                       <Briefcase /><span>Report Writer</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton onClick={() => handleToolSelect('Create an image of...')} tooltip={{ children: 'Image Creator', side: 'right' }}>
                       <PencilRuler /><span>Image Creator</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton onClick={() => handleToolSelect('Write some code to...')} tooltip={{ children: 'Code Interpreter', side: 'right' }}>
                       <BrainCircuit /><span>Code Interpreter</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>History</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.slice(0,10).map(convo => {
                    const firstUserMessage = convo.messages.find(m => m.role === 'user');
                    let title = 'Chat';
                    if (firstUserMessage?.text && typeof firstUserMessage.text === 'string' && firstUserMessage.text.trim()) {
                      title = firstUserMessage.text.substring(0, 25) + (firstUserMessage.text.length > 25 ? '...' : '')
                    } else if (convo.messages.length > 1) {
                      const firstAssistantMessage = convo.messages.find(m => m.role === 'assistant');
                       if (firstAssistantMessage?.text && typeof firstAssistantMessage.text === 'string' && firstAssistantMessage.text.trim()) {
                         title = "AI: " + firstAssistantMessage.text.substring(0, 20) + (firstAssistantMessage.text.length > 20 ? '...' : '')
                       }
                    }
                    

                    return (
                        <SidebarMenuItem key={convo.id}>
                          <div className='flex items-center w-full'>
                            <SidebarMenuButton
                              onClick={() => setActiveConversationId(convo.id)}
                              isActive={activeConversationId === convo.id}
                              tooltip={{ children: title, side: 'right' }}
                              className="w-full"
                            >
                              <MessageSquare className="size-4" />
                              <span>{title}</span>
                            </SidebarMenuButton>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100">
                                  <Trash2 className="size-3"/>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this conversation.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteConversation(convo.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
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
        <SidebarInset
          className={cn('flex flex-col h-[100svh] animated-gradient')}
        >
          <ChatHeader />
          <ChatMessages messages={activeConversation?.messages || []} isLoading={isLoading} />
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
        onClearHistory={() => {
          localStorage.removeItem('conversations');
          setConversations([]);
          handleNewConversation();
        }}
        customInstructions={customInstructions}
        onCustomInstructionsChange={setCustomInstructions}
        voice={voice}
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
