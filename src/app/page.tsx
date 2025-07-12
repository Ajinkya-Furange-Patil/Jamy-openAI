
'use client';

import { ChatPage } from '@/components/chat-page';
import { SplashScreen } from '@/components/splash-screen';
import { useEffect, useState } from 'react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <ChatPage />;
}
