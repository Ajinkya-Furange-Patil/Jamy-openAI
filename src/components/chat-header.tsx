import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Presentation, FileText } from 'lucide-react';

export function ChatHeader() {
  return (
    <header className="flex items-center h-16 shrink-0 justify-between px-4 border-b shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex">Free & Open Source</Badge>
      </div>
    </header>
  );
}
