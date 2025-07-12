import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

export function ChatHeader() {
  return (
    <header className="flex items-center h-16 shrink-0 justify-between px-4 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>
      <Badge variant="outline">Free & Open Source</Badge>
    </header>
  );
}
