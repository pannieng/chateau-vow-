import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANIONS } from '../constants/companions';
import type { Companion } from '../types';
import '../App.css';
interface SelectionStageProps {
  selectedCharacter: number | null;
  onSelect: (id: number | null) => void;
  onConfirm: () => void;
  onSecretDialogue: (dialogue: string) => void;
  characterClickCounts: Record<number, number>;
}

const SelectionStage = ({
  selectedCharacter,
  onSelect,
  onConfirm,
  onSecretDialogue,
  characterClickCounts
}: {
  selectedCharacter: number | null;
  onSelect: (id: number | null) => void;
  onConfirm: () => void;
  onSecretDialogue: (dialogue: string) => void;
  characterClickCounts: Record<number, number>;
}) => {
  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const [dialogueText, setDialogueText] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [showDialogue, setShowDialogue] = useState(true);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null);
  const [characterMood, setCharacterMood] = useState<'neutral' | 'curious' | 'happy'>('happy'); // Always happy

  // Dialogue sequences for different states
  const generalDialogues = [
    "I'm so excited to help you choose a companion!",
    "Each companion has a unique gift for your focus journey.",
    "Who makes your heart flutter with anticipation?",
    "I can't wait to see who you'll choose!"
  ];


  const WITNESS_DIALOGUES = {
    1: {
      happy: [
        "Caleb provides wisdom in silence. An excellent choice!",
        "Caleb's calm presence will guide your focus beautifully!",
        "With Caleb, you'll find strength in quiet determination. Wonderful!"
      ]
    },
    2: {
      happy: [
        "Zayne brings elegant focus. A refined selection!",
        "Zayne's grace will elevate your work magnificently!",
        "With Zayne, your focus will be both beautiful and powerful. Delightful!"
      ]
    },
    3: {
      happy: [
        "Rafayel protects from distractions. A wise choice!",
        "Rafayel's vigilance will keep you on track perfectly!",
        "With Rafayel, your vow is in safe hands. Excellent!"
      ]
    },
    4: {
      happy: [
        "Xavier stirs gentle momentum. A creative choice!",
        "Xavier's inspiration will fuel your progress wonderfully!",
        "With Xavier, you'll create something beautiful. Lovely!"
      ]
    },
    5: {
      happy: [
        "Sylus offers steady patience. A reliable choice!",
        "Sylus's endurance will support your journey splendidly!",
        "With Sylus, you'll build lasting focus. Perfect!"
      ]
    }
  };

  // Get dialogue based on current state
  const getCurrentDialogue = useCallback(() => {
    if (selectedCharacter && selected) {
      const dialogues = WITNESS_DIALOGUES[selected.id as keyof typeof WITNESS_DIALOGUES];
      if (dialogues) {
        const happyDialogues = dialogues.happy;
        const index = currentDialogueIndex % happyDialogues.length;
        return happyDialogues[index];
      }
      return "I'm delighted with your choice!";
    }
    if (hoveredCharacter) {
      const character = COMPANIONS.find(c => c.id === hoveredCharacter);
      return `${character?.name} - What a wonderful companion!`;
    }
    return generalDialogues[currentDialogueIndex];
  }, [selectedCharacter, selected, hoveredCharacter, currentDialogueIndex]);

  // Handle character selection with dialogue
  const handleSelectCharacter = useCallback((id: number) => {
    const character = COMPANIONS.find(c => c.id === id);
    if (!character) return;

    // If clicking the same character, advance dialogue
    if (selectedCharacter === id) {
      const clickCount = characterClickCounts[id] || 0;
      if (clickCount >= 3) {
        setDialogueText(character.secretDialogue);
        onSecretDialogue(character.secretDialogue);
      } else {
        const dialogues = WITNESS_DIALOGUES[id as keyof typeof WITNESS_DIALOGUES];
        if (dialogues) {
          const happyDialogues = dialogues.happy;
          setDialogueText(happyDialogues[clickCount % happyDialogues.length]);
        }
      }
      setIsTyping(true);
    } else {
      // New character selected
      onSelect(id);
      const dialogues = WITNESS_DIALOGUES[id as keyof typeof WITNESS_DIALOGUES];
      if (dialogues) {
        const happyDialogues = dialogues.happy;
        setDialogueText(happyDialogues[0]);
      } else {
        setDialogueText("I'm absolutely delighted with your choice!");
      }
      setIsTyping(true);
    }
  }, [selectedCharacter, characterClickCounts, onSelect, onSecretDialogue]);

  // Handle character hover
  const handleCharacterHover = useCallback((id: number | null) => {
    setHoveredCharacter(id);
    if (id && selectedCharacter !== id) {
      const character = COMPANIONS.find(c => c.id === id);
      if (character) {
        setDialogueText(`${character.name} - I'm excited you're considering them!`);
        setIsTyping(true);
      }
    }
  }, [selectedCharacter]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    onSelect(null);
    setDialogueText("I'm excited to see who you'll choose next!");
    setIsTyping(true);
  }, [onSelect]);

  // Advance dialogue on click
  const advanceDialogue = useCallback(() => {
    if (isTyping) {
      // Skip typing animation
      setIsTyping(false);
      setDialogueText(getCurrentDialogue());
    } else {
      // Cycle through general dialogues
      if (!selectedCharacter && !hoveredCharacter) {
        setCurrentDialogueIndex((prev) => (prev + 1) % generalDialogues.length);
        setDialogueText(generalDialogues[(currentDialogueIndex + 1) % generalDialogues.length]);
        setIsTyping(true);
      }
    }
  }, [isTyping, selectedCharacter, hoveredCharacter, currentDialogueIndex, getCurrentDialogue]);

  // Initialize dialogue
  useEffect(() => {
    setDialogueText(generalDialogues[0]);
    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    let i = 0;
    const targetText = getCurrentDialogue();
    const typingInterval = setInterval(() => {
      if (i < targetText.length) {
        setDialogueText(targetText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [isTyping, getCurrentDialogue]);

  return (
    <motion.div
      key="selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="galgame-selection-stage"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f7 30%, #ffeef2 100%)',
        fontFamily: "'Cormorant Garamond', 'Georgia', serif"
      }}
    >
      {/* White-Pink Background Effects */}
      <div className="galgame-bg-effects">
        {/* Soft pink glowing orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="bg-glow"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8 + i * 2,
              delay: i * 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: '150px',
              height: '150px',
              background: `radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              borderRadius: '50%'
            }}
          />
        ))}

        {/* Subtle floating hearts */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="floating-heart"
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
              fontSize: '16px',
              opacity: 0.3,
              filter: 'blur(0.5px)'
            }}
          >
            ♡
          </motion.div>
        ))}
      </div>

      {/* WITNESS CHARACTER SPRITE */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="witness-character-sprite"
        style={{
          position: 'absolute',
          left: '80px',
          bottom: '200px',
          width: '300px',
          height: '500px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}
      >
        {/* Character Container */}
        <div style={{
          position: 'relative',
          width: '250px',
          height: '400px'
        }}>
          {/* Character Frame with Glow */}
          <motion.div
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.02, 1] // Always animated
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 252, 0.9))',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `
                0 20px 60px rgba(255, 105, 180, 0.3),
                inset 0 0 40px rgba(255, 255, 255, 0.4)
              `,
              border: '3px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 20px'
            }}
          >
            {/* Circle Frame for Character Image */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1], // Always animated
                boxShadow: [
                  '0 0 30px rgba(255, 105, 180, 0.4)',
                  '0 0 50px rgba(255, 105, 180, 0.6)',
                  '0 0 30px rgba(255, 105, 180, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '4px solid rgba(255, 182, 193, 0.8)',
                background: 'linear-gradient(135deg, #FFF5F5, #FFECEC)',
                marginBottom: '25px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 15px 40px rgba(255, 182, 193, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Character Image */}
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.5)'
              }}>
                <img
                  src="/images/witness-character.png"
                  alt="Witness Character"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(1.1) saturate(1.2)' // Always happy filter
                  }}
                />

                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 30%, transparent 50%, rgba(255, 182, 193, 0.2) 100%)',
                  mixBlendMode: 'overlay'
                }} />
              </div>

              {/* Animated Ring Around Image */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  border: '2px dashed rgba(255, 182, 193, 0.4)',
                  borderRadius: '50%',
                  filter: 'blur(1px)'
                }}
              />
            </motion.div>

            {/* Character Info */}
            <div style={{
              textAlign: 'center',
              marginTop: '10px'
            }}>
              {/* Character Name */}
              <div style={{
                fontSize: '22px',
                color: '#FF69B4',
                fontWeight: 'bold',
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(255, 105, 180, 0.2)',
                letterSpacing: '1px'
              }}>
                WITNESS
              </div>

              {/* Status Indicator */}
              <div style={{
                fontSize: '14px',
                color: '#FFB6C1',
                fontStyle: 'italic',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4CAF50' // Always green
                  }}
                />
                <span>
                  Absolutely Delighted
                </span>
              </div>

              {/* Mood Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '13px',
                  color: '#7A5A6A',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  padding: '10px 15px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 182, 193, 0.3)',
                  maxWidth: '200px',
                  margin: '0 auto'
                }}
              >
                {selectedCharacter
                  ? `So happy you're considering ${selected?.name}!`
                  : "I'm absolutely delighted to help you choose your companion!"}
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              opacity: 0.3
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: '24px', color: '#FFB6C1' }}
              >
                ✿
              </motion.div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              opacity: 0.3
            }}>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: '24px', color: '#FFB6C1' }}
              >
                ✿
              </motion.div>
            </div>
          </motion.div>

          {/* Character Name Plate */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
            color: 'white',
            padding: '10px 30px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            boxShadow: '0 10px 30px rgba(255, 105, 180, 0.4)',
            whiteSpace: 'nowrap',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>✦</span>
            THE WITNESS
            <span style={{ fontSize: '18px' }}>✦</span>
          </div>

          {/* Sparkle Effects Around Character */}
          <div style={{
            position: 'absolute',
            inset: '-20px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`character-sparkle-${i}`}
                initial={{ scale: 0, opacity: 0, x: '50%', y: '50%' }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.8, 0],
                  x: ['50%', `${Math.cos(i * 45) * 100 + 50}%`],
                  y: ['50%', `${Math.sin(i * 45) * 100 + 50}%`]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '15px',
                  height: '15px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>

          {/* Glow Effect - Always happy glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 0.6, // Always visible
              scale: 1.2
            }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: '-15px',
              background: 'radial-gradient(circle, rgba(255, 105, 180, 0.6), transparent 70%)',
              filter: 'blur(15px)',
              zIndex: -1,
              borderRadius: '30px'
            }}
          />
        </div>
      </motion.div>

      {/* GALGAME DIALOGUE BOX  */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="galgame-dialogue-overlay"
        onClick={advanceDialogue}
        style={{
          position: 'absolute',
          top: '40px',
          left: 'calc(300px + 100px)', // Adjusted for witness character on left
          right: '40px', // Added right padding
          transform: 'none', // Removed translateX since we're not centering
          width: 'calc(100vw - 400px - 80px)', // Adjusted width for witness character
          minWidth: '400px',
          height: '180px',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 250, 252, 0.98))',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '3px solid rgba(255, 182, 193, 0.5)',
          boxShadow: `
            0 25px 60px rgba(255, 182, 193, 0.25),
            0 0 40px rgba(255, 255, 255, 0.4) inset,
            0 0 0 1px rgba(255, 255, 255, 0.9) inset
          `,
          cursor: 'pointer',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px'
        }}
      >
        {/* Left side: Character portrait (if selected) */}
        {selectedCharacter && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="dialogue-character-portrait"
            style={{
              flex: '0 0 120px',
              marginRight: '30px'
            }}
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '4px solid rgba(255, 105, 180, 0.7)',
              boxShadow: `
                0 15px 40px rgba(255, 105, 180, 0.25),
                0 0 30px rgba(255, 255, 255, 0.4) inset
              `,
              position: 'relative',
              background: 'white'
            }}>
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
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              color: '#FF69B4',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              {selected?.name}
            </div>
          </motion.div>
        )}

        {/* Right side: Dialogue text */}
        <div style={{
          flex: 1,
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Character name or witness */}
          <div style={{
            color: selectedCharacter ? '#FF1493' : '#FF69B4',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: selectedCharacter ? '#FF1493' : '#FF69B4',
              animation: 'pulse 2s infinite'
            }} />
            {selectedCharacter ? selected?.name.toUpperCase() : 'THE WITNESS'}
          </div>

          {/* Dialogue text */}
          <div style={{
            color: '#4A2C3A',
            fontSize: '20px',
            lineHeight: '1.6',
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            letterSpacing: '0.5px',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            minHeight: '60px'
          }}>
            "{dialogueText}"
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  marginLeft: '5px',
                  color: '#FF69B4',
                  fontWeight: 'bold'
                }}
              >
                ▌
              </motion.span>
            )}
          </div>

          {/* Hint text */}
          {!isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="dialogue-hint"
              style={{
                marginTop: '15px',
                fontSize: '12px',
                color: '#FFB6C1',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Cormorant Garamond', serif"
              }}
            >
              <div style={{ fontSize: '16px', color: '#FF69B4' }}>▶</div>
              Click to continue
            </motion.div>
          )}
        </div>

        {/* Decorative corner elements */}
        <div className="dialogue-corners">
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '30px',
            height: '30px',
            borderTop: '2px solid rgba(255, 182, 193, 0.6)',
            borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
            borderRadius: '8px 0 0 0'
          }} />
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '30px',
            height: '30px',
            borderTop: '2px solid rgba(255, 182, 193, 0.6)',
            borderRight: '2px solid rgba(255, 182, 193, 0.6)',
            borderRadius: '0 8px 0 0'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            width: '30px',
            height: '30px',
            borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
            borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
            borderRadius: '0 0 0 8px'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            width: '30px',
            height: '30px',
            borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
            borderRight: '2px solid rgba(255, 182, 193, 0.6)',
            borderRadius: '0 0 8px 0'
          }} />
        </div>
      </motion.div>

      {/* CHARACTER CARDS*/}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="character-cards-container"
        style={{
          position: 'absolute',
          top: '280px',
          left: 'calc(300px + 100px)',
          right: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          padding: '0 20px',
          flexWrap: 'wrap',
          zIndex: 30,
          overflowY: 'visible',
          maxHeight: 'calc(100vh - 300px)'
        }}
      >
        {COMPANIONS.map((companion) => (
          <motion.div
            key={companion.id}
            layoutId={`character-card-${companion.id}`}
            className={`galgame-character-card ${selectedCharacter === companion.id ? 'selected' : ''}`}
            onMouseEnter={() => handleCharacterHover(companion.id)}
            onMouseLeave={() => handleCharacterHover(null)}
            onClick={() => handleSelectCharacter(companion.id)}
            whileHover={{
              y: -15,
              scale: 1.08,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              cursor: 'pointer',
              position: 'relative',
              width: '200px',
              height: '350px',
              background: selectedCharacter === companion.id
                ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 252, 0.98))'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 245, 247, 0.95))',
              borderRadius: '20px',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: selectedCharacter === companion.id
                ? '3px solid rgba(255, 105, 180, 0.7)'
                : '2px solid rgba(255, 182, 193, 0.4)',
              boxShadow: selectedCharacter === companion.id
                ? `
                  0 25px 50px rgba(255, 105, 180, 0.25),
                  0 0 40px rgba(255, 255, 255, 0.4) inset,
                  0 0 30px rgba(255, 182, 193, 0.2)
                `
                : `
                  0 15px 35px rgba(255, 182, 193, 0.2),
                  0 0 30px rgba(255, 255, 255, 0.3) inset
                `,
              backdropFilter: 'blur(10px)',
              opacity: selectedCharacter && selectedCharacter !== companion.id ? 0.6 : 1,
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
          >
            {/* Background glow effect */}
            {selectedCharacter === companion.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="selection-glow"
                style={{
                  position: 'absolute',
                  inset: '-25px',
                  background: 'radial-gradient(circle at 50% 0%, rgba(255, 105, 180, 0.15), transparent 70%)',
                  zIndex: -1,
                  filter: 'blur(30px)'
                }}
              />
            )}

            {/* Character image with galgame-style frame */}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '25px',
              border: selectedCharacter === companion.id
                ? '4px solid rgba(255, 105, 180, 0.8)'
                : '3px solid rgba(255, 182, 193, 0.5)',
              boxShadow: selectedCharacter === companion.id
                ? '0 20px 50px rgba(255, 105, 180, 0.3), 0 0 40px rgba(255, 255, 255, 0.4) inset'
                : '0 10px 30px rgba(255, 182, 193, 0.3), 0 0 20px rgba(255, 255, 255, 0.3) inset',
              position: 'relative',
              zIndex: 2,
              background: 'white'
            }}>
              <img
                src={companion.imageUrl}
                alt={companion.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: selectedCharacter === companion.id ? 'brightness(1.05) saturate(1.1)' : 'brightness(1.02)'
                }}
              />

              {/* Galgame-style shine effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4), transparent 70%)',
                transform: 'rotate(45deg)',
                animation: 'shine 3s infinite'
              }} />
            </div>

            {/* Character info */}
            <div style={{
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%'
            }}>
              <h3 style={{
                fontSize: '22px',
                color: selectedCharacter === companion.id ? '#FF1493' : '#FF69B4',
                marginBottom: '10px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                {companion.name}
              </h3>

              <div style={{
                fontSize: '12px',
                color: selectedCharacter === companion.id ? '#FF69B4' : '#FFB6C1',
                background: 'linear-gradient(135deg, rgba(255, 250, 252, 0.9), rgba(255, 240, 245, 0.9))',
                padding: '6px 14px',
                borderRadius: '15px',
                marginBottom: '18px',
                letterSpacing: '1px',
                border: '1px solid rgba(255, 182, 193, 0.3)',
                fontStyle: 'italic',
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                {companion.epithet}
              </div>

              <div style={{
                fontSize: '11px',
                color: '#A05252',
                lineHeight: '1.4',
                marginBottom: '18px',
                fontStyle: 'italic',
                height: '45px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                padding: '0 5px',
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                {companion.focusPower}
              </div>

              {/* Hearts indicator */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                marginTop: 'auto'
              }}>
                {[...Array(companion.vibeHearts)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={selectedCharacter === companion.id ? {
                      scale: [1, 1.4, 1],
                      y: [0, -5, 0]
                    } : {}}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                    style={{
                      color: selectedCharacter === companion.id ? '#FF1493' : '#FF69B4',
                      fontSize: '18px',
                      filter: selectedCharacter === companion.id ? 'drop-shadow(0 0 5px rgba(255, 105, 180, 0.4))' : 'none'
                    }}
                  >
                    ♡
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selection indicator */}
            {selectedCharacter === companion.id && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="selection-indicator"
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '50px',
                  height: '50px',
                  zIndex: 3
                }}
              >
                {/* Outer wax ring */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 105, 180, 0.4)',
                      '0 0 30px rgba(255, 105, 180, 0.6)',
                      '0 0 20px rgba(255, 105, 180, 0.4)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #FF6B93, #FF1493)',
                    borderRadius: '50%',
                    boxShadow: '0 0 25px rgba(255, 105, 180, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)'
                  }}
                />

                {/* Inner wax texture */}
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  background: 'linear-gradient(135deg, #FF8FAB, #FF6B93)',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Wax seal symbol */}
                  <div style={{
                    width: '30px',
                    height: '30px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 'bold'
                      }}
                    >
                      ✦
                    </motion.div>
                  </div>
                </div>

                {/* Dripping wax effect */}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '15px',
                    height: '10px',
                    background: 'linear-gradient(to bottom, #FF1493, #FF6B93)',
                    borderRadius: '0 0 8px 8px',
                    filter: 'blur(1px)'
                  }}
                />
              </motion.div>
            )}

            {/* Hover effect border */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="hover-border"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                border: '2px solid rgba(255, 105, 180, 0.4)',
                pointerEvents: 'none',
                zIndex: 1,
                boxShadow: 'inset 0 0 30px rgba(255, 182, 193, 0.1)'
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons - adjusted position for witness character */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="selection-actions"
        style={{
          position: 'absolute',
          bottom: '60px',
          left: 'calc(300px + 100px)',
          right: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          zIndex: 40
        }}
      >
        {/* Clear selection button */}
        {selectedCharacter && (
          <motion.button
            onClick={handleClearSelection}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 252, 0.95))',
              color: '#FF69B4',
              border: '2px solid rgba(255, 182, 193, 0.6)',
              borderRadius: '25px',
              padding: '14px 35px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '180px',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(255, 182, 193, 0.25)',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            <span style={{ fontSize: '18px' }}>←</span>
            Change Companion
          </motion.button>
        )}

        {/* Confirm selection button */}
        <motion.button
          onClick={() => selectedCharacter && onConfirm()}
          disabled={!selectedCharacter}
          whileHover={selectedCharacter ? { scale: 1.05, y: -2 } : {}}
          whileTap={selectedCharacter ? { scale: 0.95 } : {}}
          style={{
            background: selectedCharacter
              ? 'linear-gradient(145deg, #FF69B4, #FF1493)'
              : 'linear-gradient(145deg, #E0C8D1, #D4B7C9)',
            color: selectedCharacter ? 'white' : '#CC99AA',
            border: 'none',
            borderRadius: '25px',
            padding: '16px 45px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: selectedCharacter ? 'pointer' : 'not-allowed',
            backdropFilter: 'blur(10px)',
            boxShadow: selectedCharacter
              ? '0 20px 50px rgba(255, 105, 180, 0.35), 0 0 40px rgba(255, 182, 193, 0.3) inset'
              : '0 10px 30px rgba(204, 153, 170, 0.2)',
            minWidth: '220px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Cormorant Garamond', serif"
          }}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>
            {selectedCharacter ? (
              <>
                Begin Vow with <span style={{ color: '#FFD1DC' }}>{selected?.name}</span>
              </>
            ) : (
              'Choose Your Witness'
            )}
          </span>

          {selectedCharacter && (
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
          )}
        </motion.button>
      </motion.div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default SelectionStage;