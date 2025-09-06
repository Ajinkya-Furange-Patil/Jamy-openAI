
'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Settings, NotebookText, Mail, Languages, GraduationCap, Briefcase, Trash2, Bot, PencilRuler, BrainCircuit, History } from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AudioPlayer } from './audio-player';
import { Badge } from './ui/badge';
import { SettingsDialog } from './settings-dialog';
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
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const initialMessage: Message = {
  id: '1',
  role: 'assistant',
  text: "Hello there! I'm JAMY AI, your advanced assistant. I can search the web, write code, create UI, and even generate images. How can I help you today?",
};

const conversationStarters = [
    { icon: NotebookText, label: 'Summarize Document', prompt: 'Summarize the following document:' },
    { icon: Mail, label: 'Draft an Email', prompt: 'Draft an email to...' },
    { icon: Languages, label: 'Translate Text', prompt: 'Translate the following text to...' },
    { icon: GraduationCap, label: 'Homework Help', prompt: 'I have a homework question...' },
    { icon: Briefcase, label: 'Write a Report', prompt: 'Write a report on...' },
    { icon: PencilRuler, label: 'Create an Image', prompt: 'Create an image of...' },
    { icon: BrainCircuit, label: 'Interpret Code', prompt: 'Write some code to...' },
];

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [voice, setVoice] = useState<string>('Algenib');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedConversations = localStorage.getItem('conversations');
    const storedInstructions = localStorage.getItem('customInstructions');
    const storedVoice = localStorage.getItem('voice');
    const storedAutoPlay = localStorage.getItem('autoPlayAudio');

    if (storedInstructions) setCustomInstructions(storedInstructions);
    if (storedVoice) setVoice(storedVoice);
    if (storedAutoPlay) setAutoPlayAudio(JSON.parse(storedAutoPlay));

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
      }
    }
    handleNewConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    } else {
      localStorage.removeItem('conversations');
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
  };
  
  const handleStarterSelect = (prompt: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
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
          description: 'Currently, only plain text files are supported.',
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
       updateActiveConversation(c => ({
        ...c,
        messages: c.messages.slice(0, -1),
      }));
    }

    if (result.audioUrl) {
      setAudioUrl(result.audioUrl);
    }
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full h-10 w-10">
          <Avatar className="size-9">
            <AvatarImage
              src="https://placehold.co/100x100.png"
              data-ai-hint="profile picture"
              alt="User avatar"
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-xs leading-none text-muted-foreground">
              john.doe@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const HistoryMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" />
          <span>History</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 mt-2">
        <DropdownMenuLabel>Conversation History</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map(convo => {
              const firstUserMessage = convo.messages.find(m => m.role === 'user');
              let title = 'Chat';
              if (firstUserMessage?.text && typeof firstUserMessage.text === 'string' && firstUserMessage.text.trim()) {
                title = firstUserMessage.text.substring(0, 35) + (firstUserMessage.text.length > 35 ? '...' : '');
              } else if (convo.messages.length > 1) {
                const firstAssistantMessage = convo.messages.find(m => m.role === 'assistant');
                if (firstAssistantMessage?.text && typeof firstAssistantMessage.text === 'string' && firstAssistantMessage.text.trim()) {
                  title = "AI: " + firstAssistantMessage.text.substring(0, 30) + (firstAssistantMessage.text.length > 30 ? '...' : '');
                }
              }

              return (
                <DropdownMenuItem
                  key={convo.id}
                  onSelect={() => setActiveConversationId(convo.id)}
                  className="flex justify-between items-center"
                >
                  <span className='truncate'>{title}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
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
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">No history yet.</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[100svh] animated-gradient">
        <ChatHeader>
            <div className="flex items-center gap-2">
                <Bot className="size-8 text-primary shrink-0"/>
                <h1 className="text-xl font-semibold">JAMY AI</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                    <Plus className="mr-2 h-4 w-4" /> New Chat
                </Button>
                <HistoryMenu />
                {isLoggedIn ? <UserMenu /> : <Button onClick={() => setIsLoggedIn(true)}>Login</Button>}
            </div>
        </ChatHeader>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatMessages messages={activeConversation?.messages || []} isLoading={isLoading} />
          
          {!isLoading && (activeConversation?.messages.length ?? 0) <= 1 && (
            <div className="px-4">
                <div className="relative group">
                    <div className="conversation-starters no-scrollbar">
                        {conversationStarters.map((starter, index) => (
                            <div key={index} className="starter-card">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="shrink-0" onClick={() => handleStarterSelect(starter.prompt)}>
                                            <starter.icon className="mr-2 h-4 w-4" />
                                            {starter.label}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{starter.prompt}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}
          
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={'Ask me anything...'}
          />
        </div>
        {audioUrl && <AudioPlayer audioUrl={audioUrl} autoPlay={autoPlayAudio}/>}
      </div>
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
        autoPlayAudio={autoPlayAudio}
        onAutoPlayAudioChange={setAutoPlayAudio}
      />
    </TooltipProvider>
  );
}
