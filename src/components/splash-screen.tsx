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
      <div className="relative flex items-center justify-center w-32 h-32">
        <div className="absolute w-full h-full rounded-full bg-primary/20 animate-ping" />
        <div className="absolute w-3/4 h-3/4 rounded-full bg-primary/50 animate-ping delay-200" />
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-16 text-primary animate-pulse"
        >
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8.5 8.5C9.32843 8.5 10 9.17157 10 10C10 10.8284 9.32843 11.5 8.5 11.5C7.67157 11.5 7 10.8284 7 10C7 9.17157 7.67157 8.5 8.5 8.5Z"
            fill="currentColor"
          />
          <path
            d="M15.5 12.5C16.3284 12.5 17 13.1716 17 14C17 14.8284 16.3284 15.5 15.5 15.5C14.6716 15.5 14 14.8284 14 14C14 13.1716 14.6716 12.5 15.5 12.5Z"
            fill="currentColor"
          />
          <path
            d="M12 7C12.5523 7 13 7.44772 13 8V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V8C11 7.44772 11.4477 7 12 7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
