'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
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

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
            // If it ends unexpectedly, restart it.
            recognitionRef.current?.start();
        }
      };
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // prevent restart on unmount
            recognitionRef.current.stop();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
    if(isRecording) {
        setIsRecording(false);
        recognitionRef.current?.stop();
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="p-4 border-t bg-background shrink-0">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-start gap-4"
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here or use the microphone..."
          className={cn(
            'flex-1 resize-none pr-24 transition-shadow duration-300',
            input.length > 0 && 'focus-visible:animate-pulse-border'
            )}
          rows={1}
          disabled={isLoading}
          autoFocus
        />
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
          disabled={isLoading || !input.trim()}
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
