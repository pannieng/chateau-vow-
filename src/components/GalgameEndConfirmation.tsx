import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Companion } from '../types';
import { COMPANIONS } from '../constants/companions';

interface GalgameEndConfirmationProps {
  selectedCharacter: number;
  playerName: string;
  onConfirmEnd: () => void;
  onCancel: () => void;
  onContinueVow: () => void;
}

const GalgameEndConfirmation = ({
  selectedCharacter,
  playerName,
  onConfirmEnd,
  onCancel,
  onContinueVow
}: GalgameEndConfirmationProps) => {
  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const [isTyping, setIsTyping] = useState(true);
  const [dialogueText, setDialogueText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const [rainVolume, setRainVolume] = useState(0.4);

  const emotionalDialogues = [
    `Are you leaving already, ${playerName}? Our vow hasn't finished...`,
    "I was enjoying our time together. Must you break our promise?",
    "The gates are still sealed. Stay a little longer with me...",
    "I don't want you to go. Can't we continue our focus together?",
    "Please... don't abandon our vow. I believe in your strength."
  ];

  // Initialize rain sound
  useEffect(() => {
    // Create and manage rain audio
    rainAudioRef.current = new Audio('/audio/rain-sound.mp3');
    rainAudioRef.current.loop = true;
    rainAudioRef.current.volume = rainVolume;

    const playRainSound = async () => {
      if (rainAudioRef.current) {
        try {
          await rainAudioRef.current.play();
          console.log("🌧️ Rain sound started");
        } catch (error) {
          console.log("⚠️ Rain sound autoplay blocked");
          
          const handleInteraction = () => {
            if (rainAudioRef.current && rainAudioRef.current.paused) {
              rainAudioRef.current.play().catch(console.error);
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
          };
          
          document.addEventListener('click', handleInteraction);
          document.addEventListener('touchstart', handleInteraction);
        }
      }
    };

    playRainSound();

    return () => {
      if (rainAudioRef.current) {
        rainAudioRef.current.pause();
        rainAudioRef.current.currentTime = 0;
        rainAudioRef.current = null;
      }
    };
  }, []);

  // Update rain volume
  useEffect(() => {
    if (rainAudioRef.current) {
      rainAudioRef.current.volume = rainVolume;
    }
  }, [rainVolume]);

  // Fade out rain when making a choice
  useEffect(() => {
    if (hasChosen) {
      const fadeOutInterval = setInterval(() => {
        setRainVolume(prev => {
          if (prev <= 0.05) {
            clearInterval(fadeOutInterval);
            return 0;
          }
          return prev - 0.05;
        });
      }, 100);
      
      return () => clearInterval(fadeOutInterval);
    }
  }, [hasChosen]);

  // Reset all state when the component mounts
  useEffect(() => {
    setIsTyping(true);
    setDialogueText("");
    setShowOptions(false);
    setHasChosen(false);
    setRainVolume(0.4);
  }, [selectedCharacter, playerName]);

  useEffect(() => {
    if (!selected || hasChosen) return;

    const characterEmotionalLines = selected.distractionDialogue.map(line =>
      line.replace("Focus on your work", "Please don't leave me")
        .replace("Eyes on the goal", "Stay with me")
        .replace("Your attention should", "I need you to")
    );

    const allDialogues = [...characterEmotionalLines, ...emotionalDialogues];
    const randomDialogue = allDialogues[Math.floor(Math.random() * allDialogues.length)];

    setDialogueText("");
    setIsTyping(true);

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < randomDialogue.length) {
        setDialogueText(randomDialogue.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTimeout(() => setShowOptions(true), 500);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [selected, playerName, hasChosen]);

  const handleSkipTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  const handleEndAnyway = () => {
    if (hasChosen) return;
    
    setHasChosen(true);
    setShowOptions(false);
    
    // Dramatic rain increase before ending
    setRainVolume(0.6);
    
    setTimeout(() => {
      onConfirmEnd();
    }, 800);
  };

  const handleStay = () => {
    setHasChosen(true);
    setDialogueText("Thank you for staying... I won't let you down.");
    setIsTyping(true);

    // Gentle rain fade as user stays
    setRainVolume(0.2);
    
    setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => {
        onContinueVow();
      }, 1000);
    }, 1500);
  };

  const handleCancelOption = () => {
    // Fade out rain quickly when canceling
    const fadeOut = setInterval(() => {
      setRainVolume(prev => {
        if (prev <= 0.05) {
          clearInterval(fadeOut);
          return 0;
        }
        return prev - 0.1;
      });
    }, 50);
    
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="galgame-confirmation-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      {/* Animated rain effects in background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Heavy rain droplets */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`heavy-rain-${i}`}
            className="rain-drop-background"
            initial={{
              y: -50,
              x: Math.random() * 100 + 'vw',
              opacity: 0
            }}
            animate={{
              y: '100vh',
              opacity: [0, 0.8 * (rainVolume / 0.4), 0]
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(135, 206, 235, 0.9), rgba(135, 206, 235, 0.3), transparent)',
              filter: 'blur(0.5px)'
            }}
          />
        ))}

        {/* Medium rain droplets */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`medium-rain-${i}`}
            className="rain-drop-medium"
            initial={{
              y: -30,
              x: Math.random() * 100 + 'vw',
              opacity: 0
            }}
            animate={{
              y: '100vh',
              opacity: [0, 0.6 * (rainVolume / 0.4), 0]
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '1px',
              height: '30px',
              background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.7), rgba(173, 216, 230, 0.2), transparent)',
              filter: 'blur(0.3px)'
            }}
          />
        ))}

        {/* Light rain splashes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`light-rain-${i}`}
            className="rain-splash"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.4 * (rainVolume / 0.4), 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '20px',
              height: '10px',
              background: 'radial-gradient(ellipse at center, rgba(173, 216, 230, 0.5), transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(1px)'
            }}
          />
        ))}

        {/* Animated heartbreak effect */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`heartbreak-${i}`}
            className="heartbreak-fragment"
            initial={{
              x: '50vw',
              y: '50vh',
              scale: 1,
              opacity: 1,
              rotate: 0
            }}
            animate={{
              x: `calc(50vw + ${(Math.random() - 0.5) * 500}px)`,
              y: `calc(50vh + ${(Math.random() - 0.5) * 500}px)`,
              scale: 0,
              opacity: 0,
              rotate: 360
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
              clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 50% 75%, 20% 100%, 0% 35%)',
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* MAIN CONTAINER - Fixed duplicate */}
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="galgame-confirmation-container"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 245, 0.98))',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '700px',
          width: '90%',
          position: 'relative',
          border: '3px solid rgba(255, 182, 193, 0.5)',
          boxShadow: '0 25px 60px rgba(255, 105, 180, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Container rain effect */}
        <div className="container-rain-effect" style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: '30px'
        }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`container-rain-${i}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: [0, 60 + i * 3],
                opacity: [0, 0.5 * (rainVolume / 0.4), 0]
              }}
              transition={{
                duration: 1 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear"
              }}
              style={{
                position: 'absolute',
                top: '10px',
                left: `${5 + i * 8}%`,
                width: '1px',
                height: '30px',
                background: 'linear-gradient(to bottom, rgba(135, 206, 235, 0.7), rgba(135, 206, 235, 0.2), transparent)',
                filter: 'blur(0.3px)'
              }}
            />
          ))}
        </div>

        {/* Character portrait with emotional overlay */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="character-emotional-portrait"
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            margin: '0 auto 30px'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid rgba(255, 182, 193, 0.7)',
              boxShadow: '0 15px 40px rgba(255, 105, 180, 0.3)',
              position: 'relative'
            }}
          >
            <img
              src={selected?.sadimageUrl}
              alt={selected?.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9) contrast(1.1) sepia(0.1)'
              }}
            />
            {/* Rain effect on character portrait */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none'
            }}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`rain-drop-${i}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{
                    opacity: [0, 0.9 * (rainVolume / 0.4), 0],
                    y: [0, 40 + i * 5, 80]
                  }}
                  transition={{
                    duration: 1.5 + i * 0.2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: `${35 + i * 15}px`,
                    width: '2px',
                    height: '25px',
                    background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.9), rgba(135, 206, 250, 0.4), transparent)',
                    borderRadius: '0 0 2px 2px',
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Glowing aura */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: '-10px',
              background: 'radial-gradient(circle, rgba(255, 182, 193, 0.3), transparent 70%)',
              borderRadius: '50%',
              zIndex: -1
            }}
          />
        </motion.div>

        {/* Dialogue box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="galgame-dialogue-box"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(255, 182, 193, 0.4)',
            boxShadow: '0 10px 30px rgba(255, 182, 193, 0.2)',
            position: 'relative',
            overflow: 'visible'
          }}
          onClick={handleSkipTyping}
        >
          {/* Rain droplets on dialogue box */}
          <div className="dialogue-rain" style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none'
          }}>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`dialogue-rain-${i}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{
                  y: [0, 30],
                  opacity: [0, 0.4 * (rainVolume / 0.4), 0]
                }}
                transition={{
                  duration: 1.2 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: `${15 + i * 20}%`,
                  width: '1px',
                  height: '20px',
                  background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.6), transparent)',
                  filter: 'blur(0.3px)'
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              top: '-15px',
              left: '40px',
              background: '#FF69B4',
              color: 'white',
              padding: '5px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              overflow:'visible',
              letterSpacing: '1px',
              zIndex: 1
            }}
          >
            {selected?.name}
          </div>

          <div
            style={{
              color: '#4A2C3A',
              fontSize: '18px',
              lineHeight: '1.6',
              minHeight: '80px',
              fontStyle: 'italic',
              paddingTop: '10px',
              position: 'relative',
              zIndex: 1
            }}
          >
            "{dialogueText}"
            {isTyping && <span style={{
              animation: 'blink 1s infinite',
              marginLeft: '2px'
            }}>|</span>}
          </div>

          {!isTyping && !hasChosen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="click-hint"
              style={{
                textAlign: 'center',
                color: '#FF69B4',
                fontSize: '12px',
                marginTop: '15px',
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1
              }}
            >
              ✿ Click to continue ✿
            </motion.div>
          )}
        </motion.div>

        {/* Decision options */}
        <AnimatePresence>
          {showOptions && !hasChosen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="galgame-decision-options"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Stay option */}
              <motion.button
                onClick={handleStay}
                disabled={hasChosen}
                whileHover={hasChosen ? {} : { scale: 1.03, x: -5 }}
                whileTap={hasChosen ? {} : { scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '18px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: hasChosen ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 30px rgba(255, 105, 180, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  opacity: hasChosen ? 0.7 : 1
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Stay with {selected?.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Continue the vow and cherish this moment</div>
                </div>
                <motion.div
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                  }}
                />
              </motion.button>

              {/* End anyway option */}
              <motion.button
                onClick={handleEndAnyway}
                disabled={hasChosen}
                whileHover={hasChosen ? {} : { scale: 1.03, x: 5 }}
                whileTap={hasChosen ? {} : { scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 44, 44, 0.9), rgba(58, 34, 34, 0.9))',
                  color: '#ffccd5',
                  border: '2px solid rgba(255, 182, 193, 0.5)',
                  borderRadius: '25px',
                  padding: '18px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: hasChosen ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  opacity: hasChosen ? 0.7 : 1
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>End the Vow Anyway</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Break the promise and return to selection</div>
                </div>

                {/* Crack effect on hover */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(255, 182, 193, 0.1) 10px,
                      rgba(255, 182, 193, 0.1) 20px
                    )`,
                    pointerEvents: 'none'
                  }}
                />
              </motion.button>

              {/* Cancel option */}
              <motion.button
                onClick={handleCancelOption}
                disabled={hasChosen}
                whileHover={hasChosen ? {} : { scale: 1.02 }}
                whileTap={hasChosen ? {} : { scale: 0.98 }}
                style={{
                  background: 'transparent',
                  color: '#FF69B4',
                  border: '2px dashed rgba(255, 182, 193, 0.6)',
                  borderRadius: '25px',
                  padding: '15px 30px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: hasChosen ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  opacity: hasChosen ? 0.7 : 1
                }}
              >
                Not sure yet... Let me think
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background decorative elements */}
        <div className="galgame-decorations">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`deco-${i}`}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                position: 'absolute',
                top: `${10 + i * 10}%`,
                left: i % 2 === 0 ? '5%' : '85%',
                fontSize: '20px',
                color: 'rgba(255, 182, 193, 0.4)',
                pointerEvents: 'none'
              }}
            >
              ✿
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ambient audio hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '11px',
          fontStyle: 'italic',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '5px 10px',
          borderRadius: '10px',
          backdropFilter: 'blur(5px)'
        }}
      >
        ✦ Gentle rain sound playing in the background ✦
      </div>

      {/* Add CSS for blinking cursor */}
      <style >{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default GalgameEndConfirmation;