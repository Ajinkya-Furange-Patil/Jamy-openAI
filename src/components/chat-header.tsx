import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Presentation } from 'lucide-react';

interface ChatHeaderProps {
  onGeneratePdf: () => void;
  onGeneratePpt: () => void;
}

export function ChatHeader({ onGeneratePdf, onGeneratePpt }: ChatHeaderProps) {
  return (
    <header className="flex items-center h-16 shrink-0 justify-between px-4 border-b shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onGeneratePdf}>
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onGeneratePpt}>
          <Presentation className="mr-2 h-4 w-4" />
          Generate PPT
        </Button>
        <Badge variant="outline" className="hidden sm:inline-flex">Free & Open Source</Badge>
      </div>
    </header>
  );
}
