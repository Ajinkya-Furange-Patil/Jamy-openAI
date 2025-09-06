'use client';

import { useState, useRef, type FormEvent, useEffect, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Mic, Loader2, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      if (scrollHeight > 0) {
        inputRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        setInput(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;
    onSendMessage(input, file ?? undefined);
    setInput('');
    setFile(null);
    if(isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  const isAttachmentDisabled = isLoading || !!file;

  return (
    <div className="p-4 border-t bg-background shrink-0">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-start gap-4"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="text/plain"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleAttachmentClick}
              disabled={isAttachmentDisabled}
              title={"Attach file"}
            >
              <Paperclip className="w-4 h-4" />
              <span className="sr-only">Attach file</span>
            </Button>
        </div>

        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message here or use the microphone..."}
          className={cn(
            'flex-1 resize-none pr-24 pl-12 transition-shadow duration-300 max-h-48',
            'focus-visible:animate-pulse-border'
            )}
          rows={1}
          disabled={isLoading}
          autoFocus
        />

        {file && (
          <div className="absolute bottom-full left-0 mb-2 pl-2">
            <Badge variant="secondary" className="flex items-center gap-2">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        <Button
          type="button"
          size="icon"
          variant={isRecording ? 'destructive' : 'ghost'}
          onClick={handleMicClick}
          className="absolute right-[52px] top-1/2 -translate-y-1/2 h-8 w-8"
          disabled={isLoading}
        >
          <Mic className="w-4 h-4" />
          <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || (!input.trim() && !file)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
