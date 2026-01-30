import { useEffect, useRef } from 'react';

export const useTypingSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/typewriter.mp3');
    audioRef.current.volume = 0.15;
    audioRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playTypingSound = (character: string, wordLength: number, characterIndexInWord: number) => {
    if (!audioRef.current) return;

    const totalDuration = 30;
    let startTime = 0;

    if (wordLength === 1) {
      startTime = 0;
    } else if (wordLength <= 3) {
      startTime = 2 + (characterIndexInWord % 3);
    } else if (wordLength <= 6) {
      startTime = 6 + (characterIndexInWord % 4);
    } else if (wordLength <= 9) {
      startTime = 11 + (characterIndexInWord % 6);
    } else if (wordLength <= 12) {
      startTime = 18 + (characterIndexInWord % 5);
    } else {
      startTime = 24 + (characterIndexInWord % 6);
    }

    let playbackRate = 1.0;
    let volume = 0.15;
    let duration = 0.2;

    if (character === ' ') {
      startTime = 0.5;
      playbackRate = 2.0;
      volume = 0.1;
      duration = 0.1;
    } else if (/[.,!?;:]/.test(character)) {
      startTime = 29;
      playbackRate = 1.5;
      volume = 0.12;
      duration = 0.15;
    } else if (/[A-Z]/.test(character)) {
      playbackRate = 1.3;
      volume = 0.18;
      startTime += 0.5;
    }

    try {
      const soundClone = audioRef.current.cloneNode() as HTMLAudioElement;
      soundClone.currentTime = startTime;
      soundClone.playbackRate = playbackRate;
      soundClone.volume = volume;

      soundClone.play();

      setTimeout(() => {
        if (!soundClone.paused) {
          soundClone.pause();
        }
      }, duration * 1000);

    } catch (error) {
      // Silent fail for autoplay issues
    }
  };

  return { playTypingSound };
};