
'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ audioUrl, autoPlay = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (audioRef.current) {
        // Pause and reset current audio before changing src
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;

      if (autoPlay) {
        // The play() method returns a Promise which can be used to detect when playback has begun.
        playPromise.current = audioRef.current.play();

        if (playPromise.current !== null) {
          playPromise.current.catch(error => {
            // Autoplay was prevented.
            console.error("Audio playback failed:", error);
            playPromise.current = null;
          });
        }
      }
    }
  }, [audioUrl, autoPlay]);

  return <audio ref={audioRef} className="hidden" />;
}
