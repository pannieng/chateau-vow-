import { useEffect, useRef } from 'react';

export const useMagicSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/magic-click.mp3');
    audioRef.current.volume = 0.2;
    audioRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMagicSound = () => {
    if (!audioRef.current) return;

    try {
      const soundClone = audioRef.current.cloneNode() as HTMLAudioElement;
      soundClone.currentTime = 0;
      soundClone.volume = 0.2;
      soundClone.playbackRate = 1.0;

      soundClone.play().catch(() => {
        // Silent fail
      });

    } catch (error) {
      // Silent fail
    }
  };

  return { playMagicSound };
};