import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingSound } from '../hooks/useTypingSound';
import '../App.css';

interface NameEntryStageProps {
  onNameSubmitted: (name: string) => void;
}

const characterResponses = [
  "I see...",
  "That's a lovely name.",
  "I'll remember it forever.",
  "It sounds wonderful.",
  "Perfect."
];

const NameEntryStage = ({
  onNameSubmitted
}: {
  onNameSubmitted: (name: string) => void;
}) => {
  // Add the typing sound hook
  const { playTypingSound } = useTypingSound();

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: name input, 2: confirmation
  const [dialogueText, setDialogueText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterMood, setCharacterMood] = useState('neutral'); // neutral, curious, happy
  const [showCharacter, setShowCharacter] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vowSoundPlaying, setVowSoundPlaying] = useState(false);

  // Dialogue lines with different moods
  const dialogues = {
    neutral: [
      "In the garden where sakura petals dance...",
      "A new vow is about to begin.",
      "Before we seal this promise...",
      "Please, tell me your name.",
      "What should I call you?"
    ],
    curious: [
      "Hmm... I don't think I've heard that name before.",
      "That's an interesting name.",
      "I'll remember it well.",
      "Now, let me see...",
      "Your name sounds like a gentle breeze."
    ],
    happy: [
      "What a beautiful name!",
      "It suits you perfectly.",
      "I'm happy to meet you.",
      "Now our vow can truly begin.",
      "Your name will be whispered in the wind."
    ]
  };

  // Character expressions
  const characterExpressions = {
    neutral: "#FFB6C1",
    curious: "#FF69B4",
    happy: "#FF1493"
  };

  // Play vow ceremony sound
  const playVowSound = () => {
    if (vowSoundPlaying) return;
    
    setVowSoundPlaying(true);
    
    // Create audio context for sound synthesis
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Main chime sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.start();
      oscillator2.start();
      
      oscillator1.stop(audioContext.currentTime + 2);
      oscillator2.stop(audioContext.currentTime + 2);
      
      // Wind-like background sound
      setTimeout(() => {
        const noiseNode = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, 2 * audioContext.sampleRate, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
        
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, audioContext.currentTime);
        noiseFilter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.05, audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 4);
        
        noiseNode.buffer = noiseBuffer;
        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseNode.start();
        noiseNode.stop(audioContext.currentTime + 4);
      }, 500);
      
      // Bell-like overtone
      setTimeout(() => {
        const overtone = audioContext.createOscillator();
        const overtoneGain = audioContext.createGain();
        
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(1046.50, audioContext.currentTime); // C6
        
        overtoneGain.gain.setValueAtTime(0, audioContext.currentTime);
        overtoneGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.2);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
        
        overtone.connect(overtoneGain);
        overtoneGain.connect(audioContext.destination);
        
        overtone.start();
        overtone.stop(audioContext.currentTime + 1.5);
      }, 300);
      
    } catch (error) {
      console.log('Audio synthesis not supported, using fallback:', error);
      
      // Fallback to audio file if Web Audio API fails
      const vowSound = new Audio('/audio/seal.mp3');
      vowSound.volume = 0.4;
      vowSound.play().catch(console.error);
    }
  };

  // Play button click sound
  const playButtonSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(784.00, audioContext.currentTime); // G5
      oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      const buttonSound = new Audio('/audio/button-click.mp3');
      buttonSound.volume = 0.3;
      buttonSound.play().catch(console.error);
    }
  };

  // Initialize with opening sequence
  useEffect(() => {
    startOpeningSequence();
  }, []);

  const startOpeningSequence = () => {
    setDialogueText('');
    setIsTyping(true);
    setCharacterMood('neutral');

    let dialogueIndex = 0;
    const currentDialogues = dialogues.neutral;

    const typeNextDialogue = () => {
      if (dialogueIndex < currentDialogues.length) {
        setDialogueText('');
        let charIndex = 0;
        const currentLine = currentDialogues[dialogueIndex];

        // Word tracking for typing sounds
        let currentWord = '';
        let charInWordIndex = 0;

        const typingInterval = setInterval(() => {
          if (charIndex < currentLine.length) {
            const char = currentLine[charIndex];

            // Update word tracking
            if (char === ' ') {
              // End of word
              currentWord = '';
              charInWordIndex = 0;
            } else {
              currentWord += char;
              charInWordIndex++;
            }

            // Play typing sound
            playTypingSound(char, currentWord.length, charInWordIndex);

            setDialogueText(currentLine.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typingInterval);

            // Pause before next dialogue
            setTimeout(() => {
              dialogueIndex++;
              if (dialogueIndex === 3) { // When asking for name
                setShowInput(true);
              }
              if (dialogueIndex < currentDialogues.length) {
                typeNextDialogue();
              } else {
                setIsTyping(false);
              }
            }, 1200);
          }
        }, 35);
      }
    };

    typeNextDialogue();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      // Play button click sound
      playButtonSound();
      
      // Play vow ceremony sound
      playVowSound();
      
      // Character reaction based on name length
      if (inputValue.trim().length <= 3) {
        setCharacterMood('curious');
      } else {
        setCharacterMood('happy');
      }

      // Show confirmation sequence after a brief delay
      setTimeout(() => {
        setCurrentStep(2);
        setIsTyping(true);

        const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];
        const confirmationText = `"${inputValue.trim()}"... ${randomResponse}`;

        setDialogueText('');
        let i = 0;

        // Word tracking for typing sounds
        let currentWord = '';
        let charInWordIndex = 0;

        const typingInterval = setInterval(() => {
          if (i < confirmationText.length) {
            const char = confirmationText[i];

            // Update word tracking
            if (char === ' ' || /[.,!?;:]/.test(char)) {
              // Word boundary
              currentWord = '';
              charInWordIndex = 0;
            } else {
              currentWord += char;
              charInWordIndex++;
            }

            // Play typing sound
            playTypingSound(char, currentWord.length, charInWordIndex);

            setDialogueText(confirmationText.substring(0, i + 1));
            i++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);

            // Submit after brief moment
            setTimeout(() => {
              onNameSubmitted(inputValue.trim());
              setIsSubmitting(false);
              setVowSoundPlaying(false);
            }, 1500);
          }
        }, 40);
      }, 800); // Delay for sound to play
    }
  };

  const handleSkipTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      const currentDialogues = dialogues[characterMood as keyof typeof dialogues];
      setDialogueText(currentDialogues[currentDialogues.length - 1]);
    }
  };

  const handleRandomName = () => {
    const englishNames = [
      // Romantic/Soft Names
      'Lily', 'Rose', 'Violet', 'Iris', 'Dahlia', 'Jasmine', 'Hazel', 'Willow',

      // Classic Names
      'Elara', 'Serena', 'Aurora', 'Celine', 'Luna', 'Stella', 'Nova', 'Celeste',

      // Nature-Inspired
      'River', 'Skye', 'Brook', 'Ash', 'Rowan', 'Sage', 'Reed', 'Flora',

      // Mystical/Ethereal
      'Lyra', 'Aria', 'Elara', 'Nyx', 'Phoebe', 'Selene', 'Thalia', 'Calliope',

      // Gender-Neutral Options
      'Riley', 'Jordan', 'Alex', 'Taylor', 'Casey', 'Morgan', 'Jamie', 'Quinn',

      // Short & Sweet
      'Kai', 'Leo', 'Max', 'Sam', 'Eve', 'Ava', 'Ian', 'Roy'
    ];

    const randomName = englishNames[Math.floor(Math.random() * englishNames.length)];
    setInputValue(randomName);

    // Play a gentle sound effect
    const sound = new Audio('/audio/light-bell.mp3');
    sound.volume = 0.3;
    sound.play().catch(console.error);

    // Character reaction based on name type
    const romanticNames = ['Lily', 'Rose', 'Violet', 'Aurora', 'Serena', 'Celeste'];
    const natureNames = ['River', 'Skye', 'Willow', 'Sage', 'Rowan', 'Flora'];

    if (romanticNames.includes(randomName)) {
      setCharacterMood('happy');
    } else if (natureNames.includes(randomName)) {
      setCharacterMood('curious');
    } else {
      setCharacterMood('neutral');
    }

    // Optional: Show a brief tooltip with name meaning
    setTimeout(() => {
      const nameMeanings: Record<string, string> = {
        'Lily': 'Purity and beauty',
        'Rose': 'Love and passion',
        'Violet': 'Modesty and faithfulness',
        'Aurora': 'Dawn, new beginnings',
        'Serena': 'Calm and peaceful',
        'Celeste': 'Heavenly',
        'River': 'Flow and change',
        'Skye': 'Freedom and openness',
        'Willow': 'Grace and flexibility',
        'Sage': 'Wisdom and healing',
        'Lyra': 'Harmony and music',
        'Aria': 'Melody and air',
        'Elara': 'Bright and shining',
        'Phoebe': 'Radiant and pure',
        'Kai': 'Ocean and sea',
        'Leo': 'Lion, strength',
        'Luna': 'Moon, night',
        'Stella': 'Star, light'
      };

      if (nameMeanings[randomName]) {
        console.log(`${randomName}: ${nameMeanings[randomName]}`);
      }
    }, 100);
  };

  return (
    <motion.div
      key="name-entry"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="galgame-name-entry-stage"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #FFFAFA 0%, #FFF0F5 100%)',
        overflow: 'hidden',
        fontFamily: "'Noto Sans JP', 'Segoe UI', sans-serif"
      }}
    >
      {/* Enhanced Background with Depth */}
      <div className="galgame-background" style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #FFF8F8 0%, #FFECEC 100%)'
      }}>
        {/* Layered Sakura Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 182, 193, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 182, 193, 0.03) 0%, transparent 50%)
          `,
          filter: 'blur(20px)'
        }} />

        {/* Animated Sakura Petals */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`petal-${i}`}
            className="sakura-petal"
            initial={{
              y: -50,
              x: Math.random() * window.innerWidth,
              opacity: 0,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: window.innerHeight + 100,
              x: `calc(${Math.random() * 100}% - 50px)`,
              rotate: 360 + Math.random() * 180,
              opacity: [0, 0.6, 0.3, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
              borderRadius: '50% 0 50% 50%',
              filter: 'blur(1px)',
              opacity: 0.7,
              boxShadow: '0 2px 8px rgba(255, 182, 193, 0.4)'
            }}
          />
        ))}

        {/* Gentle Bokeh Lights */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bokeh-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0.7, 1.3, 0.7],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 8 + i * 3,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(255, 182, 193, 0.25) 0%, transparent 70%)',
              filter: 'blur(15px)',
              borderRadius: '50%'
            }}
          />
        ))}

        {/* Subtle Grid Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255, 182, 193, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 182, 193, 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.3
        }} />
      </div>

      {/* Vow Sound Wave Animation */}
      <AnimatePresence>
        {vowSoundPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            {/* Sound Waves emanating from button */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`vow-wave-${i}`}
                initial={{
                  scale: 0,
                  opacity: 0.8,
                  x: showCharacter ? 'calc(50% + 200px)' : '50%',
                  y: '50%'
                }}
                animate={{
                  scale: [0, 3, 5],
                  opacity: [0.8, 0.4, 0],
                  x: [
                    showCharacter ? 'calc(50% + 200px)' : '50%',
                    `calc(${50 + (Math.cos(i * 36) * 50)}% + ${Math.sin(i * 36) * 100}px)`
                  ],
                  y: [
                    '50%',
                    `calc(${50 + (Math.sin(i * 36) * 50)}% + ${Math.cos(i * 36) * 100}px)`
                  ]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 107, 147, 0.6)',
                  background: 'radial-gradient(circle, rgba(255, 107, 147, 0.2), transparent 70%)',
                  filter: 'blur(2px)',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Sprite (Left Side) */}
      {showCharacter && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="character-sprite"
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
                scale: characterMood === 'happy' ? [1, 1.02, 1] : 1
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
                animate={characterMood === 'happy' ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 30px rgba(255, 105, 180, 0.4)',
                    '0 0 50px rgba(255, 105, 180, 0.6)',
                    '0 0 30px rgba(255, 105, 180, 0.4)'
                  ]
                } : {}}
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
                      filter: characterMood === 'happy' ? 'brightness(1.1) saturate(1.2)' :
                        characterMood === 'curious' ? 'brightness(1.05)' : 'none'
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
                      scale: characterMood === 'happy' ? [1, 1.2, 1] : 1,
                      opacity: characterMood === 'happy' ? [0.7, 1, 0.7] : 0.7
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: characterMood === 'happy' ? '#4CAF50' :
                        characterMood === 'curious' ? '#FFC107' : '#9E9E9E'
                    }}
                  />
                  <span>
                    {characterMood === 'happy' ? 'Delighted' :
                      characterMood === 'curious' ? 'Curious' : 'Waiting'}
                  </span>
                </div>

                {/* Mood Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={characterMood}
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
                  {characterMood === 'happy' && "I'm glad to meet you!"}
                  {characterMood === 'curious' && "That's an interesting name..."}
                  {characterMood === 'neutral' && "Waiting for your response."}
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
            {characterMood === 'happy' && (
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
            )}

            {/* Glow Effect Based on Mood */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: characterMood === 'happy' ? 0.6 :
                  characterMood === 'curious' ? 0.3 : 0.1,
                scale: 1.2
              }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                inset: '-15px',
                background: `radial-gradient(circle, ${characterMood === 'happy' ? 'rgba(255, 105, 180, 0.6)' :
                  characterMood === 'curious' ? 'rgba(255, 182, 193, 0.4)' :
                    'rgba(255, 182, 193, 0.2)'
                  }, transparent 70%)`,
                filter: 'blur(15px)',
                zIndex: -1,
                borderRadius: '30px'
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Main Galgame Dialogue Box */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="galgame-dialogue-box"
        onClick={handleSkipTyping}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: showCharacter ? 'calc(300px + 100px)' : '50%',
          transform: showCharacter ? 'none' : 'translateX(-50%)',
          width: showCharacter ? 'calc(100vw - 400px - 80px)' : 'min(800px, 95vw)',
          minWidth: '400px',
          height: '200px',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 250, 252, 0.98))',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '3px solid rgba(255, 182, 193, 0.5)',
          boxShadow: `
            0 25px 60px rgba(255, 182, 193, 0.25),
            0 0 40px rgba(255, 255, 255, 0.4) inset,
            0 0 0 1px rgba(255, 255, 255, 0.9) inset
          `,
          cursor: isTyping ? 'pointer' : 'default',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px'
        }}
      >
        {/* Dialogue Content */}
        <div style={{
          flex: 1,
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Character Name */}
          <div style={{
            color: '#FF69B4',
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            marginBottom: '15px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#FF69B4',
              animation: 'pulse 2s infinite'
            }} />
            THE WITNESS
          </div>

          {/* Dialogue Text */}
          <div style={{
            color: '#4A2C3A',
            fontSize: '20px',
            lineHeight: '1.6',
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 400,
            letterSpacing: '0.5px',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            minHeight: '80px'
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

          {/* Hint Text */}
          {isTyping && (
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
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '16px', color: '#FF69B4' }}>▶</div>
              Click to skip
            </motion.div>
          )}
        </div>

        {/* Decorative Corners */}
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

      {/* Name Input Section */}
      <AnimatePresence>
        {showInput && currentStep < 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="galgame-name-input-container"
            style={{
              position: 'absolute',
              top: '80px',
              left: showCharacter ? 'calc(300px + 100px)' : '50%',
              transform: showCharacter ? 'none' : 'translateX(-50%)',
              width: showCharacter ? 'calc(100vw - 400px - 80px)' : 'min(600px, 90vw)',
              minWidth: '400px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 252, 0.95))',
              borderRadius: '20px',
              padding: '30px',
              border: '3px solid rgba(255, 182, 193, 0.5)',
              boxShadow: '0 20px 50px rgba(255, 182, 193, 0.25)',
              zIndex: 40,
              backdropFilter: 'blur(10px)'
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Title with Japanese Text */}
              <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#FF69B4',
                  fontWeight: 'bold',
                  letterSpacing: '3px',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  ENTER YOUR NAME
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  color: '#4A2C3A',
                  letterSpacing: '1px',
                  marginBottom: '15px',
                  fontStyle: 'italic'
                }}>
                  What shall I call you, wanderer?
                </div>

                {/* Animated Line */}
                <motion.div
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    height: '2px',
                    width: '150px',
                    background: 'linear-gradient(90deg, transparent, #FF69B4, transparent)',
                    margin: '0 auto',
                    borderRadius: '1px'
                  }}
                />
              </div>

              {/* Elegant Name Input */}
              <div style={{ position: 'relative', marginBottom: '30px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#FF69B4',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    NAME:
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#FFB6C1',
                    fontStyle: 'italic',
                    fontFamily: "'Cormorant Garamond', serif"
                  }}>
                    (Maximum 16 characters)
                  </div>
                </div>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter your name here..."
                  style={{
                    width: '100%',
                    padding: '20px 25px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: `2px solid ${isFocused ? '#FF69B4' : 'rgba(255, 182, 193, 0.4)'}`,
                    borderRadius: '12px',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '18px',
                    color: '#4A2C3A',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: isFocused
                      ? '0 10px 30px rgba(255, 105, 180, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.4)'
                      : '0 5px 20px rgba(255, 182, 193, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                    letterSpacing: '1px'
                  }}
                  maxLength={16}
                  autoFocus
                />

                {/* Input Decoration */}
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: isFocused ? '#FF69B4' : 'rgba(255, 182, 193, 0.5)',
                  pointerEvents: 'none',
                  marginTop: '15px'
                }}>
                  ✎
                </div>

                {/* Character Counter */}
                <div style={{
                  position: 'absolute',
                  bottom: '-25px',
                  right: '10px',
                  fontSize: '12px',
                  color: inputValue.length >= 14 ? '#FF4757' : '#FFB6C1',
                  fontFamily: "'Cormorant Garamond', serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span>{inputValue.length}/16</span>
                  {inputValue.length >= 14 && (
                    <span style={{ fontSize: '14px' }}>⚠</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: '40px'
              }}>
                {/* Random Name Button */}
                <motion.button
                  type="button"
                  onClick={handleRandomName}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 252, 0.9))',
                    color: '#FF69B4',
                    border: '2px solid rgba(255, 182, 193, 0.6)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 25px rgba(255, 182, 193, 0.2)',
                    fontFamily: "'Noto Sans JP', sans-serif"
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🎲</span>
                  Random Name
                </motion.button>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={inputValue.trim() && !isSubmitting ? { scale: 1.05, y: -2 } : {}}
                  whileTap={inputValue.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                  disabled={!inputValue.trim() || isSubmitting}
                  style={{
                    flex: 2,
                    padding: '18px',
                    background: inputValue.trim() && !isSubmitting
                      ? 'linear-gradient(145deg, #FF69B4, #FF1493)'
                      : 'linear-gradient(145deg, #E0C8D1, #D4B7C9)',
                    color: inputValue.trim() && !isSubmitting ? 'white' : '#CC99AA',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: inputValue.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                    boxShadow: inputValue.trim() && !isSubmitting
                      ? '0 15px 35px rgba(255, 105, 180, 0.35)'
                      : '0 5px 15px rgba(204, 153, 170, 0.2)',
                    fontFamily: "'Noto Sans JP', sans-serif",
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ fontSize: '18px' }}
                        >
                        
                        </motion.div>
                        BEGINNING VOW...
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={inputValue.trim() ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ fontSize: '20px' }}
                        >
                         
                        </motion.div>
                        {inputValue.trim() ? 'BEGIN THE VOW' : 'ENTER NAME FIRST'}
                      </>
                    )}
                  </span>

                  {/* Button Effects */}
                  {inputValue.trim() && !isSubmitting && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.2), transparent)',
                          pointerEvents: 'none'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                        animation: 'shimmer 2s infinite'
                      }} />
                      
                      {/* Sound wave preview */}
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          position: 'absolute',
                          inset: '-5px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '16px',
                          pointerEvents: 'none'
                        }}
                      />
                    </>
                  )}
                  
                  {/* Loading indicator for submitting */}
                  {isSubmitting && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      display: 'flex',
                      gap: '3px'
                    }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                          style={{
                            width: '6px',
                            height: '6px',
                            background: 'white',
                            borderRadius: '50%'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              </div>

              {/* Hint Text */}
              {!inputValue.trim() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    textAlign: 'center',
                    marginTop: '25px',
                    fontSize: '13px',
                    color: '#FFB6C1',
                    fontStyle: 'italic',
                    fontFamily: "'Noto Sans JP', sans-serif",
                    lineHeight: '1.5'
                  }}
                >
                  Your name will be remembered throughout this journey.
                  <br />
                  Choose one that resonates with your heart.
                </motion.div>
              )}
              
              {/* Sound hint when hovering over submit button */}
              <AnimatePresence>
                {inputValue.trim() && !isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      textAlign: 'center',
                      marginTop: '20px',
                      fontSize: '12px',
                      color: '#FF69B4',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>♪</span>
                    A ceremonial sound will play when you begin the vow
                    <span style={{ fontSize: '14px' }}>♪</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Overlay */}
      <AnimatePresence>
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="confirmation-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 240, 245, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25 }}
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
                  0 0 50px rgba(255, 255, 255, 0.4) inset
                `
              }}
            >
              {/* Confetti Effect */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
                  animate={{ y: 50, x: (Math.random() - 0.5) * 150, opacity: [0, 1, 0], rotate: 360 }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: `${(i % 5) * 20 + 10}%`,
                    width: '12px',
                    height: '12px',
                    background: ['#FF69B4', '#FFB6C1', '#FFD1DC'][i % 3],
                    borderRadius: i % 2 === 0 ? '50%' : '2px',
                    opacity: 0.7
                  }}
                />
              ))}

              {/* Heart Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: '60px',
                  color: '#FF69B4',
                  marginBottom: '25px',
                  filter: 'drop-shadow(0 5px 20px rgba(255, 105, 180, 0.4))'
                }}
              >
                ❤
              </motion.div>

              {/* Confirmation Text */}
              <div style={{
                fontSize: '20px',
                color: '#4A2C3A',
                lineHeight: '1.6',
                marginBottom: '30px',
                fontFamily: "'Noto Sans JP', sans-serif"
              }}>
                Welcome, <span style={{
                  color: '#FF1493',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(255, 105, 180, 0.2)'
                }}>{inputValue}</span>
                <br />
                <span style={{
                  fontSize: '16px',
                  color: '#FF69B4',
                  fontStyle: 'italic',
                  marginTop: '10px',
                  display: 'block'
                }}>
                  Your journey in the garden begins now...
                </span>
              </div>

              {/* Sound Waves during confirmation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '40px',
                marginBottom: '20px',
                gap: '4px'
              }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: ['10px', '30px', '10px'],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    style={{
                      width: '5px',
                      background: 'linear-gradient(to top, #FF69B4, #FFB6C1)',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>

              {/* Loading Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '30px' }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    style={{
                      width: '12px',
                      height: '12px',
                      background: '#FF69B4',
                      borderRadius: '50%',
                      boxShadow: '0 0 15px rgba(255, 105, 180, 0.5)'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambient Elements */}
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '30px',
        opacity: 0.4,
        zIndex: 1
      }}>
        {['✿', '✦', '✿', '✦', '✿'].map((icon, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              rotate: i % 2 === 0 ? [0, 5, 0] : [0, -5, 0]
            }}
            transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
            style={{
              fontSize: '24px',
              color: '#FFB6C1'
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      {/* Add CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .galgame-name-entry-stage {
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        
        input::placeholder {
          color: rgba(255, 182, 193, 0.7);
          font-style: italic;
          transition: opacity 0.3s ease;
        }
        
        input:focus::placeholder {
          opacity: 0.4;
        }
        
        /* Character breathing animation */
        @keyframes characterBreathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.01); }
        }
        
        /* Vow sound wave animation */
        @keyframes vowWave {
          0% { transform: scale(0); opacity: 0.8; }
          50% { opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default NameEntryStage;