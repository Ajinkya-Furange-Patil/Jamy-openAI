
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearHistory: () => void;
  onCustomInstructionsChange: (instructions: string) => void;
  onVoiceChange: (voice: string) => void;
  customInstructions: string;
  voice: string;
  autoPlayAudio: boolean;
  onAutoPlayAudioChange: (autoPlay: boolean) => void;
}

const voices = [
  { value: 'Algenib', label: 'Algenib (Male, US)' },
  { value: 'Enif', label: 'Enif (Female, US)' },
  { value: 'Sirius', label: 'Sirius (Male, UK)' },
  { value: 'Spica', label: 'Spica (Female, UK)' },
  { value: 'Antares', label: 'Antares (Male, IN)' },
  { value: 'Rasalas', label: 'Rasalas (Female, IN)' },
];

export function SettingsDialog({
  open,
  onOpenChange,
  onClearHistory,
  onCustomInstructionsChange,
  onVoiceChange,
  customInstructions,
  voice,
  autoPlayAudio,
  onAutoPlayAudioChange
}: SettingsDialogProps) {
  const [instructions, setInstructions] = useState(customInstructions);
  const [currentVoice, setCurrentVoice] = useState(voice);
  const [currentAutoPlay, setCurrentAutoPlay] = useState(autoPlayAudio);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setInstructions(customInstructions);
      setCurrentVoice(voice);
      setCurrentAutoPlay(autoPlayAudio);
    }
  }, [open, customInstructions, voice, autoPlayAudio]);

  const handleClear = () => {
    onClearHistory();
    toast({
      title: 'Success',
      description: 'Conversation history has been cleared.',
    });
    onOpenChange(false);
  };

  const handleSave = () => {
    localStorage.setItem('customInstructions', instructions);
    onCustomInstructionsChange(instructions);
    
    localStorage.setItem('voice', currentVoice);
    onVoiceChange(currentVoice);

    localStorage.setItem('autoPlayAudio', JSON.stringify(currentAutoPlay));
    onAutoPlayAudioChange(currentAutoPlay);

    toast({
      title: 'Success',
      description: 'Settings have been saved.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice Selection</Label>
              <Select value={currentVoice} onValueChange={setCurrentVoice}>
                <SelectTrigger id="voice" className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <p className="text-sm text-muted-foreground">
                Choose the voice for the text-to-speech feature.
              </p>
            </div>
            
            <div className="space-y-2">
               <Label>Audio Settings</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Auto-play audio</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically play audio responses.
                    </p>
                  </div>
                  <Switch
                    checked={currentAutoPlay}
                    onCheckedChange={setCurrentAutoPlay}
                  />
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <p className="text-sm text-muted-foreground">
                What would you like JAMY AI to know about you to provide better responses?
                </p>
                <Textarea
                id="custom-instructions"
                placeholder="For example, 'I am a software engineer specializing in frontend development...'"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[120px]"
                />
            </div>
            <div className="space-y-2">
                <Label>Conversation History</Label>
                <p className="text-sm text-muted-foreground">
                    This will permanently delete all your chat history.
                </p>
                <Button variant="destructive" onClick={handleClear}>
                Clear All History
                </Button>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
