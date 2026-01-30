import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { COMPANIONS } from '../constants/companions';
import { TIME_OPTIONS } from '../constants/timeOptions';
import type{ Companion } from '../types';

interface VowSetupStageProps {
  selectedCharacter: number;
  selectedTime: number | null;
  playerName: string;
  onSelectTime: (time: number) => void;
  onConfirmVow: () => void;
  onGoBack: () => void;
}

const VowSetupStage = ({
  selectedCharacter,
  selectedTime,
  playerName,
  onSelectTime,
  onConfirmVow,
  onGoBack
}: {
  selectedCharacter: number;
  selectedTime: number | null;
  playerName: string;
  onSelectTime: (time: number) => void;
  onConfirmVow: () => void;
  onGoBack: () => void;
}) => {
  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const [dialogueText, setDialogueText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!selected) return;

    const fullText = selected.vowConfirmation.replace('{playerName}', playerName);
    setDialogueText('');
    setIsTyping(true);
    setShowContinue(false);

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDialogueText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTimeout(() => setShowContinue(true), 500);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [selected, playerName]);

  const handleDialogueClick = () => {
    if (isTyping) {
      // Skip typing
      const fullText = selected?.vowConfirmation.replace('{playerName}', playerName) || '';
      setDialogueText(fullText);
      setIsTyping(false);
      setShowContinue(true);
    } else {
      // Continue if typing is done
      setShowContinue(false);
    }
  };

  // Function to handle going back to selection
  const handleGoBack = () => {
    setShowChangeConfirmation(true);
  };

  // Function to confirm going back
  const confirmGoBack = () => {
    setShowChangeConfirmation(false);
    // Call the onGoBack callback to navigate back
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <motion.div
      key="vow-setup"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="vow-setup-stage"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '40% 60%',
        gap: '40px',
        padding: '40px',
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe6eb 100%)',
        overflow: 'hidden'
      }}
    >
      {/* CHANGE VOW BUTTON - Galgame style */}
      <motion.button
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleGoBack}
        whileHover={{ scale: 1.05, x: -3 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '25px',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#4a2c3a',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 15px 40px rgba(255, 182, 193, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.4)',
          transition: 'all 0.3s ease',
          fontFamily: "'Noto Sans JP', 'Segoe UI', sans-serif"
        }}
      >
        <ChevronLeft size={18} style={{ color: '#ff6b93' }} />
        <span>Change Vow</span>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '8px',
            height: '8px',
            background: '#ff6b93',
            borderRadius: '50%',
            marginLeft: '4px'
          }}
        />
      </motion.button>

      <div className="character-video-container">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="character-video-wrapper"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="character-live-video"
          >
            <source src={selected?.videoUrl || "/videos/default_live.mp4"} type="video/mp4" />
          </video>
          <div className="video-overlay-gradient" />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="vn-dialogue-box"
        onClick={handleDialogueClick}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          right: 'calc(60% + 80px)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px 28px',
          border: '2px solid rgba(255, 182, 193, 0.4)',
          boxShadow: '0 15px 40px rgba(255, 105, 180, 0.2)',
          zIndex: 20,
          cursor: 'pointer'
        }}
      >
        <div className="vn-character-name" style={{
          color: '#ff6b93',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '2px',
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}>{selected?.name}</div>
        <div className="vn-dialogue-text" style={{
          color: '#4a2c3a',
          fontSize: '16px',
          lineHeight: '1.5',
          fontStyle: 'italic'
        }}>
          "{dialogueText}"
          {isTyping && <span className="typing-cursor">|</span>}
        </div>

        {/* Continue indicator */}
        <AnimatePresence>
          {showContinue && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="dialogue-continue"
              style={{
                position: 'absolute',
                right: '20px',
                bottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="continue-petal"
                style={{
                  color: '#ff6b93',
                  fontSize: '16px',
                  transform: 'rotate(45deg)'
                }}
              >
                ✿
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="time-orbs-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}
      >
        <div className="time-selection-title" style={{
          fontSize: '24px',
          color: '#4a2c3a',
          marginBottom: '40px',
          fontWeight: 300,
          letterSpacing: '2px'
        }}>Choose Your Sacred Time</div>
        <div className="time-orbs-grid" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%',
          maxWidth: '400px'
        }}>
          {TIME_OPTIONS.map((time) => (
            <motion.button
              key={time.id}
              className={`time-orb ${selectedTime === time.id ? 'time-orb--selected' : ''}`}
              onClick={() => onSelectTime(time.id)}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.9)',
                border: `2px solid ${selectedTime === time.id ? time.color : 'rgba(255, 182, 193, 0.3)'}`,
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                '--orb-color': time.color
              } as any}
            >
              <div className="time-orb-glow" style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '22px',
                background: 'var(--orb-color)',
                opacity: selectedTime === time.id ? 0.2 : 0,
                transition: 'opacity 0.3s ease',
                zIndex: -1
              }} />
              <div className="time-orb-content" style={{ position: 'relative', zIndex: 1 }}>
                <div className="time-duration" style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--orb-color)',
                  marginBottom: '8px'
                }}>{time.id}</div>
                <div className="time-label" style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#4a2c3a',
                  marginBottom: '4px'
                }}>{time.label}</div>
                <div className="time-description" style={{
                  fontSize: '12px',
                  color: '#7a5a6a',
                  opacity: 0.8
                }}>{time.description}</div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          className={`begin-ceremony-btn ${selectedTime ? 'begin-ceremony-btn--active' : ''}`}
          onClick={onConfirmVow}
          disabled={!selectedTime}
          whileHover={selectedTime ? { scale: 1.05 } : {}}
          whileTap={selectedTime ? { scale: 0.95 } : {}}
          style={{
            marginTop: '40px',
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #ff6b93, #ffb6c1)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: selectedTime ? 'pointer' : 'not-allowed',
            opacity: selectedTime ? 1 : 0.5,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: selectedTime ? '0 10px 30px rgba(255, 105, 180, 0.4)' : 'none'
          }}
        >
          <span className="btn-sparkle">✨</span>
          Begin Ceremony
          <span className="btn-sparkle">✨</span>
        </motion.button>
      </motion.div>

      <div className="character-hint" style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        color: '#4a2c3a',
        fontStyle: 'italic',
        fontSize: '14px',
        opacity: 0.7,
        maxWidth: '300px',
        textAlign: 'right'
      }}>
        {selected?.timeDialogue}
      </div>

      {/* GALGAME-STYLE CHANGE VOW CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showChangeConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="change-vow-confirmation-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(255, 240, 245, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            {/* Background decorative hearts */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none'
            }}>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0, rotate: 0 }}
                  animate={{
                    y: window.innerHeight + 100,
                    x: Math.random() * 200 - 100,
                    rotate: 360,
                    opacity: [0, 0.4, 0.2, 0]
                  }}
                  transition={{
                    duration: 15 + Math.random() * 10,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    color: '#FFB6C1',
                    fontSize: '18px',
                    opacity: 0.3,
                    filter: 'blur(0.5px)'
                  }}
                >
                  ♡
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="change-vow-dialog"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 250, 252, 0.98))',
                borderRadius: '30px',
                padding: '50px',
                maxWidth: '500px',
                width: '90%',
                textAlign: 'center',
                border: '3px solid rgba(255, 182, 193, 0.5)',
                boxShadow: `
                  0 30px 70px rgba(255, 182, 193, 0.35),
                  0 0 50px rgba(255, 255, 255, 0.4) inset,
                  0 0 0 1px rgba(255, 255, 255, 0.9) inset
                `,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative corners */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '30px',
                height: '30px',
                borderTop: '2px solid rgba(255, 182, 193, 0.6)',
                borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '8px 0 0 0'
              }} />
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '30px',
                height: '30px',
                borderTop: '2px solid rgba(255, 182, 193, 0.6)',
                borderRight: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '0 8px 0 0'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '30px',
                height: '30px',
                borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
                borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '0 0 0 8px'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '30px',
                height: '30px',
                borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
                borderRight: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '0 0 8px 0'
              }} />

              {/* Character image */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid rgba(255, 105, 180, 0.7)',
                  boxShadow: '0 20px 50px rgba(255, 105, 180, 0.25)',
                  margin: '0 auto 30px',
                  position: 'relative',
                  background: 'white'
                }}
              >
                <img
                  src={selected?.imageUrl}
                  alt={selected?.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 182, 193, 0.1))'
                }} />
              </motion.div>

              {/* Title */}
              <div style={{
                fontSize: '24px',
                color: '#FF1493',
                marginBottom: '15px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)'
              }}>
                Change Your Vow?
              </div>

              {/* Message */}
              <div style={{
                fontSize: '16px',
                color: '#4A2C3A',
                marginBottom: '35px',
                lineHeight: 1.6,
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 400
              }}>
                Are you sure you want to choose a different companion?<br />
                This will cancel your current vow with <span style={{ color: '#FF69B4', fontWeight: 'bold' }}>{selected?.name}</span>.
              </div>

              {/* Decision buttons */}
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center'
              }}>
                {/* Cancel button */}
                <motion.button
                  onClick={() => setShowChangeConfirmation(false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 252, 0.95))',
                    color: '#4A2C3A',
                    border: '2px solid rgba(255, 182, 193, 0.6)',
                    borderRadius: '25px',
                    padding: '16px 35px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: '160px',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(255, 182, 193, 0.25)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>←</span>
                  Stay Here
                </motion.button>

                {/* Confirm change button */}
                <motion.button
                  onClick={confirmGoBack}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(145deg, #FF69B4, #FF1493)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '16px 35px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 15px 40px rgba(255, 105, 180, 0.35)',
                    minWidth: '160px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    Change Vow
                  </span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.3), transparent)',
                      pointerEvents: 'none'
                    }}
                  />
                </motion.button>
              </div>

              {/* Hint text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '25px',
                  fontSize: '12px',
                  color: '#FFB6C1',
                  fontStyle: 'italic'
                }}
              >
                Your choice will lead you down a different path...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VowSetupStage;