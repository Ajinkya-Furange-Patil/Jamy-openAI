'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500',
        isMounted ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="relative flex items-center justify-center w-48 h-48">
        <div className="absolute w-full h-full rounded-full bg-primary/10 animate-ping" />
        <div className="absolute w-2/3 h-2/3 rounded-full bg-primary/20 animate-ping [animation-delay:0.2s]" />
        <div className="absolute w-1/3 h-1/3 rounded-full bg-primary/50 animate-ping [animation-delay:0.4s]" />
         <svg
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary animate-pulse"
        >
            <path d="M16 2.66663C16 2.66663 8 7.33329 8 16C8 24.6666 16 29.3333 16 29.3333C16 29.3333 24 24.6666 24 16C24 7.33329 16 2.66663 16 2.66663Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 12L12 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
