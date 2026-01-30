import React, { useEffect, useRef } from 'react';

interface BackgroundAudioProps {
  src: string;
  volume?: number;
  isPlaying?: boolean;
}

const BackgroundAudio = ({
  src,
  volume = 0.5,
  isPlaying = true
}: BackgroundAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const playAudio = () => {
      if (isPlaying && audio.paused) {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Audio playing successfully");
            })
            .catch(error => {
              console.log("⚠️ Autoplay blocked:", error.message);

              const simulateClick = () => {
                document.dispatchEvent(new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true
                }));
              };

              setTimeout(() => {
                audio.play().catch(() => {
                  setTimeout(() => {
                    simulateClick();
                    audio.play().catch(() => {
                      console.log("Final attempt failed");
                    });
                  }, 100);
                });
              }, 100);
            });
        }
      }
    };

    playAudio();

    audio.addEventListener('canplay', playAudio);

    const handleInteraction = () => {
      if (audio.paused && isPlaying) {
        audio.play().catch(console.error);
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      audio.removeEventListener('canplay', playAudio);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [src, volume, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default BackgroundAudio;