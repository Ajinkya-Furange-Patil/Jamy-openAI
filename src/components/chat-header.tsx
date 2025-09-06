
import { cn } from "@/lib/utils";

interface ChatHeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  children: React.ReactNode;
}

export function ChatHeader({ children, className, ...props }: ChatHeaderProps) {
  return (
    <header className={cn("flex items-center h-16 shrink-0 justify-between px-4 md:px-6 border-b shadow-sm bg-background/50 backdrop-blur-sm z-10", className)} {...props}>
      {children}
    </header>
  );
}
