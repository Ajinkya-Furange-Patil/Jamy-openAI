
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearHistory: () => void;
  onCustomInstructionsChange: (instructions: string) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onClearHistory,
  onCustomInstructionsChange,
}: SettingsDialogProps) {
  const [theme, setTheme] = useState('dark');
  const [instructions, setInstructions] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      setTheme(currentTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentTheme);

      const storedInstructions = localStorage.getItem('customInstructions') || '';
      setInstructions(storedInstructions);
    }
  }, [open]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const handleClear = () => {
    onClearHistory();
    toast({
      title: 'Success',
      description: 'Conversation history has been cleared.',
    });
    onOpenChange(false);
  };

  const handleSaveInstructions = () => {
    localStorage.setItem('customInstructions', instructions);
    onCustomInstructionsChange(instructions);
    toast({
      title: 'Success',
      description: 'Custom instructions have been saved.',
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
            <Label>Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-instructions">Custom Instructions</Label>
            <p className="text-sm text-muted-foreground">
              What would you like Yadi AI to know about you to provide better responses?
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
            <Label>Conversation</Label>
            <Button variant="outline" onClick={handleClear}>
              Clear History
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveInstructions}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
