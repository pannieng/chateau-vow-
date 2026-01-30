import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANIONS } from '../constants/companions';
import type { Companion } from '../types';
import BreakCeremony from '../components/BreakCeremony';
import GalgameEndConfirmation from '../components/GalgameEndConfirmation';
import SpiritMeter from '../components/SpiritMeter';
import ImmersiveTimer from '../components/ImmersiveTimer';
import FloatingTimerNotification from '../components/FloatingTimerNotification';
import { Coffee as Tea } from 'lucide-react';

interface TimerStageProps {
  selectedCharacter: number;
  selectedTime: number;
  playerName: string;
  onEndVow: () => void;
}

const TimerStage = ({
  selectedCharacter,
  selectedTime,
  playerName,
  onEndVow
}: {
  selectedCharacter: number;
  selectedTime: number;
  playerName: string;
  onEndVow: () => void;
}) => {
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedTime * 60);
  const [isActive, setIsActive] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAffinity, setShowAffinity] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('neutral');
  const [isImmersive, setIsImmersive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60);
  const [showDialogueBubble, setShowDialogueBubble] = useState(true);
  const [dialogueText, setDialogueText] = useState("");
  const [showCompletionPage, setShowCompletionPage] = useState(false);
  
  // Page Visibility API states
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const progress = ((selectedTime * 60 - timeLeft) / (selectedTime * 60)) * 100;

  // ===================== PAGE VISIBILITY API =====================
  useEffect(() => {
    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      // When tab becomes inactive and timer is running
      if (!isVisible && isActive && !isCompleted && !showCompletionPage && !isBreakMode) {
        // Show floating timer after a short delay
        setTimeout(() => {
          setShowFloatingTimer(true);
        }, 1000);
        
        // Optional: Play a subtle notification sound
        try {
          const audio = new Audio('/audio/notification-bell.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {}); // Silent fail if audio doesn't play
        } catch (e) {
          console.log('Audio notification failed:', e);
        }
        
        // Optional: Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus Timer Running', {
            body: `Your ${selectedTime} minute focus session is still active`,
            icon: '/favicon.ico',
            silent: true
          });
        }
      } else if (isVisible) {
        // Tab became active - hide floating timer
        setShowFloatingTimer(false);
      }
    };

    // Handle window focus (alt-tab, cmd+tab)
    const handleWindowFocus = () => {
      setHasFocus(true);
      setShowFloatingTimer(false);
    };

    const handleWindowBlur = () => {
      setHasFocus(false);
      // Check if user switched to another window (not just another tab)
      setTimeout(() => {
        if (!document.hidden && !hasFocus && isActive && !isCompleted && !showCompletionPage && !isBreakMode) {
          setShowFloatingTimer(true);
        }
      }, 500);
    };

    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Initial check
    handleVisibilityChange();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, isCompleted, showCompletionPage, isBreakMode, selectedTime, hasFocus]);

  // ===================== TIMER LOGIC =====================
  // Show "Let's start" dialogue at beginning
  useEffect(() => {
    if (selected && showDialogueBubble && !showCompletionPage) {
      const startLines = selected.startDialogue;
      const randomLine = startLines[Math.floor(Math.random() * startLines.length)];
      setDialogueText(randomLine);

      // Hide bubble after 4 seconds
      const timer = setTimeout(() => {
        setShowDialogueBubble(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [selected, showDialogueBubble, showCompletionPage]);

  // Main timer logic
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0 && !isBreakMode && !showCompletionPage) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;

          // Show periodic encouragement at specific time points
          const minutes = Math.floor(newTime / 60);
          if (minutes === Math.floor(selectedTime * 0.75) ||
            minutes === Math.floor(selectedTime * 0.5) ||
            minutes === Math.floor(selectedTime * 0.25)) {
            showCharacterDialogue("middle");
          }

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted && !showCompletionPage) {
      setIsCompleted(true);
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isCompleted, isBreakMode, selectedTime, showCompletionPage]);

  // Break timer logic
  useEffect(() => {
    let breakInterval: number | null = null;

    if (isBreakMode && breakTimeLeft > 0) {
      breakInterval = window.setInterval(() => {
        setBreakTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isBreakMode && breakTimeLeft === 0) {
      setIsBreakMode(false);
      setBreakTimeLeft(5 * 60);
      setIsActive(true);
    }

    return () => {
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [isBreakMode, breakTimeLeft]);

  // Handle timer completion
  const handleTimerComplete = () => {
    setShowCompletionPage(true);
    showCharacterDialogue("end");
    setShowAffinity(true);
    
    // Hide floating timer when timer completes
    setShowFloatingTimer(false);
    
    // Play completion sound
    try {
      const audio = new Audio('/audio/timer-complete.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Completion sound failed:', e);
    }
    
    // Show completion notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Session Complete!', {
        body: 'Your vow has been fulfilled. Great work!',
        icon: '/favicon.ico'
      });
    }
  };

  // Show character dialogue function
  const showCharacterDialogue = (stage: "start" | "middle" | "end" | "distraction") => {
    if (!selected || showCompletionPage) return;

    let dialogueArray: string[] = [];
    switch (stage) {
      case "start":
        dialogueArray = selected.startDialogue;
        break;
      case "middle":
        dialogueArray = selected.middleDialogue;
        break;
      case "end":
        dialogueArray = selected.endDialogue;
        break;
      case "distraction":
        dialogueArray = selected.distractionDialogue;
        break;
    }

    const randomLine = dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
    setDialogueText(randomLine);
    setShowDialogueBubble(true);

    // Hide after 3 seconds for distraction, 4 seconds for others
    const hideTime = stage === "distraction" ? 2000 : 4000;
    setTimeout(() => {
      setShowDialogueBubble(false);
    }, hideTime);
  };

  // The Gaze: Ken Burns effect
  useEffect(() => {
    if (!videoRef.current || isBreakMode || showCompletionPage) return;

    let animationFrameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 1000;

    const updateTransform = () => {
      const now = Date.now();
      if (now - lastUpdate > UPDATE_INTERVAL) {
        lastUpdate = now;
        const minutes = Math.floor(timeLeft / 60);

        if (minutes <= 5) {
          videoRef.current!.style.transform = 'scale(1.4)';
          videoRef.current!.style.transition = 'transform 30s linear';
        } else if (minutes <= 15) {
          videoRef.current!.style.transform = 'scale(1.2)';
          videoRef.current!.style.transition = 'transform 20s linear';
        } else {
          videoRef.current!.style.transform = 'scale(1)';
          videoRef.current!.style.transition = 'transform 10s linear';
        }
      }

      animationFrameId = requestAnimationFrame(updateTransform);
    };

    animationFrameId = requestAnimationFrame(updateTransform);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [timeLeft, isBreakMode, showCompletionPage]);

  // Zen mode effect
  useEffect(() => {
    if (showCompletionPage) return;

    let timeoutId: number;

    const handleInteraction = () => {
      setLastInteraction(Date.now());
      setIsZenMode(false);

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        if (Date.now() - lastInteraction > 10000 && !isCompleted && !isBreakMode) {
          setIsZenMode(true);
        }
      }, 1000);
    };

    const throttledInteraction = throttle(handleInteraction, 100);

    window.addEventListener('mousemove', throttledInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', throttledInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastInteraction, isCompleted, isBreakMode, showCompletionPage]);

  // Throttle utility
  const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const handleCharacterClick = () => {
    if (!selected || isCompleted || isBreakMode || showCompletionPage) return;

    showCharacterDialogue("distraction");
  };

  const handleStartBreak = () => {
    if (showCompletionPage) return;
    setIsBreakMode(true);
    setIsActive(false);
    // Hide floating timer during break
    setShowFloatingTimer(false);
  };

  const handleConfirmEndVow = () => {
    setShowEndConfirmation(false);
    // Stop all timers and clean up
    setIsActive(false);
    setIsCompleted(true);
    // Hide floating timer
    setShowFloatingTimer(false);
    // Call parent function to go back to selection
    onEndVow();
  };

  // Handle staying in the vow
  const handleContinueVow = () => {
    setShowEndConfirmation(false);
    // Resume timer if it was paused
    setIsActive(true);
    showCharacterDialogue("middle");
  };

  // Handle canceling the end confirmation
  const handleCancelEnd = () => {
    setShowEndConfirmation(false);
    // Resume timer if it was paused
    setIsActive(true);
  };

  // Handle restore from floating timer
  const handleRestoreFromFloating = () => {
    setShowFloatingTimer(false);
    // Bring tab to front
    window.focus();
  };

  // Handle minimize floating timer
  const handleMinimizeFloatingTimer = () => {
    setShowFloatingTimer(false);
  };

  return (
    <motion.div
      key="timer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="timer-stage"
    >
      {/* ===================== FLOATING TIMER NOTIFICATION ===================== */}
      {showFloatingTimer && !isBreakMode && !showCompletionPage && (
        <FloatingTimerNotification
          selectedCharacter={selectedCharacter}
          selectedTime={selectedTime}
          playerName={playerName}
          remainingTime={timeLeft}
          isTimerRunning={isActive && !isCompleted}
          onRestore={handleRestoreFromFloating}
          onMinimize={handleMinimizeFloatingTimer}
        />
      )}

      {/* BREAK CEREMONY OVERLAY */}
      <AnimatePresence>
        {isBreakMode && !showCompletionPage && (
          <BreakCeremony
            breakTimeLeft={breakTimeLeft}
            onResume={() => {
              setIsBreakMode(false);
              setIsActive(true);
              setBreakTimeLeft(5 * 60);
            }}
            selectedCharacter={selectedCharacter}
          />
        )}
      </AnimatePresence>

      {/* TOP DIALOGUE BUBBLE - Only show during active timer */}
      <AnimatePresence>
        {showDialogueBubble && !isBreakMode && !showCompletionPage && (
          <motion.div
            key="dialogue-bubble"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              pointerEvents: 'none',
              width: 'min(500px, 90vw)',
              textAlign: 'center'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px 24px',
              border: '2px solid rgba(255, 182, 193, 0.4)',
              boxShadow: '0 15px 40px rgba(255, 182, 193, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)',
              position: 'relative',
              marginBottom: '12px',
              display: 'inline-block',
              maxWidth: '90%'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '24px',
                height: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRight: '2px solid rgba(255, 182, 193, 0.4)',
                borderBottom: '2px solid rgba(255, 182, 193, 0.4)',
                borderRadius: '4px'
              }} />

              <div style={{
                color: '#ff6b93',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '2px',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                {selected?.name}
              </div>

              <div style={{
                color: '#4a2c3a',
                fontSize: '14px',
                lineHeight: '1.5',
                fontStyle: 'italic',
                fontFamily: "'Georgia', serif",
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}>
                "{dialogueText}"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO AND TIMER DISPLAY - Only show during active timer */}
      {!showCompletionPage && (
        <>
          <div className="gaze-container">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="gaze-video"
              key={currentVideo}
            >
              <source
                src={isBreakMode
                  ? "/videos/break_tea.mp4"
                  : currentVideo === 'smiling' && selected?.videoSmilingUrl
                    ? selected.videoSmilingUrl
                    : selected?.videoUrl || "/videos/default_live.mp4"
                }
                type="video/mp4"
              />
            </video>
            <div className="timer-video-overlay" />

            {/* Character clickable area */}
            <div
              className="character-hover-trigger"
              onClick={handleCharacterClick}
              style={{
                cursor: 'pointer',
                position: 'absolute',
                inset: '30%',
                zIndex: 25
              }}
            />
          </div>

          {/* ZEN MODE FRAME */}
          <AnimatePresence>
            {isZenMode && !isBreakMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="zen-frame"
              >
                <div className="frame-top" />
                <div className="frame-right" />
                <div className="frame-bottom" />
                <div className="frame-left" />
                <div className="frame-corner frame-corner--tl">❀</div>
                <div className="frame-corner frame-corner--tr">❀</div>
                <div className="frame-corner frame-corner--bl">❀</div>
                <div className="frame-corner frame-corner--br">❀</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SPIRIT METER */}
          {!isBreakMode && (
            <SpiritMeter
              progress={progress}
              isCompleted={isCompleted}
            />
          )}

          {/* TIMER DISPLAY */}
          {!isBreakMode && !isCompleted && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="timer-character-name"
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '40px',
                  zIndex: 25
                }}
              >
                {selected?.name}
              </motion.div>

              <motion.div
                style={{
                  position: 'absolute',
                  top: '80px',
                  left: '20px',
                  zIndex: 25
                }}
              >
                <ImmersiveTimer
                  timeLeft={timeLeft}
                  isImmersive={isImmersive}
                  onToggleImmersive={() => setIsImmersive(!isImmersive)}
                />
              </motion.div>
            </>
          )}

          {/* Progress Indicator */}
          {!isBreakMode && !isCompleted && (
            <motion.div
              className="progress-indicator"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="progress-dot" />
              <span>{isBreakMode ? 'BREAK MODE' : 'FOCUS MODE'}</span>
            </motion.div>
          )}

          {/* TIMER CONTROLS */}
          {!isCompleted && !isBreakMode && (
            <motion.div
              className={`timer-controls ${isZenMode ? 'timer-controls--zen' : ''}`}
              animate={{ opacity: isZenMode ? 0.2 : 1 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'fixed',
                bottom: '40px',
                left: '180px',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '20px',
                zIndex: 30,
                backgroundColor: 'rgba(255, 240, 245, 0.85)',
                backdropFilter: 'blur(15px)',
                padding: '16px 24px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 182, 193, 0.4)',
                boxShadow: '0 20px 50px rgba(255, 182, 193, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)'
              }}
            >
              <motion.button
                onClick={handleStartBreak}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  padding: '16px 32px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 182, 193, 0.6)',
                  background: 'linear-gradient(135deg, rgba(255, 248, 250, 0.95), rgba(255, 240, 245, 0.95))',
                  color: '#4A2C3A',
                  fontWeight: '600',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                  minWidth: '200px',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(255, 182, 193, 0.4)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.1,
                  backgroundImage: `radial-gradient(circle at 20% 30%, #FFB6C1 2px, transparent 2px),
                      radial-gradient(circle at 80% 70%, #FFB6C1 2px, transparent 2px),
                      radial-gradient(circle at 40% 80%, #FFB6C1 2px, transparent 2px)`,
                  backgroundSize: '30px 30px',
                  pointerEvents: 'none'
                }} />

                <Tea size={20} style={{ color: '#FF69B4' }} />
                <span>Tea Ceremony</span>
              </motion.button>

              {/* End Vow Button */}
              <motion.button
                onClick={() => setShowEndConfirmation(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  padding: '16px 32px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 105, 180, 0.6)',
                  background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.9), rgba(255, 105, 180, 0.9))',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                  minWidth: '200px',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(255, 105, 180, 0.4)'
                }}
              >
                <span style={{ fontSize: '20px' }}>✿</span>
                <span>End Sacred Vow</span>
              </motion.button>
            </motion.div>
          )}

          {/* Right side - Zen mode indicator */}
          {isZenMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="zen-mode-indicator"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '999px',
                color: '#ff6b93',
                fontSize: '12px',
                letterSpacing: '1px',
                border: '1px solid rgba(255, 182, 193, 0.5)'
              }}
            >
              ✨ Zen Mode
            </motion.div>
          )}
        </>
      )}

      {/* GALGAME END CONFIRMATION DIALOG - CENTERED OVERLAY */}
      <AnimatePresence>
        {showEndConfirmation && (
          <GalgameEndConfirmation
            selectedCharacter={selectedCharacter}
            playerName={playerName}
            onConfirmEnd={handleConfirmEndVow}
            onCancel={handleCancelEnd}
            onContinueVow={handleContinueVow}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimerStage;