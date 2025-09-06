import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

export function ChatHeader() {
  return (
    <header className="flex items-center h-16 shrink-0 justify-between px-4 border-b shadow-sm bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex bg-background">Yadi AI</Badge>
      </div>
    </header>
  );
}
