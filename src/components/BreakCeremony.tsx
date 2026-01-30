import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COMPANIONS } from '../constants/companions';
import { Flower2, Heart, Sparkles, Coffee, Moon } from 'lucide-react';

interface BreakCeremonyProps {
  breakTimeLeft: number;
  onResume: () => void;
  selectedCharacter?: number;
}

interface BreakCeremonyTheme {
  id: number;
  name: string;
  backgroundColor: string;
  backgroundGradient: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  characterDialogue: string;
  progressBarStyle: {
    background: string;
    fillGradient: string[];
    markerColor: string;
  };
  characterImage: string;
  icon: React.ReactNode;
  pattern: 'hearts' | 'flowers' | 'stars' | 'music' | 'dragon';
}

const BreakCeremony = ({
  breakTimeLeft,
  onResume,
  selectedCharacter = 1
}: BreakCeremonyProps) => {
  const [theme, setTheme] = useState<BreakCeremonyTheme>(getTheme(selectedCharacter));
  
  useEffect(() => {
    setTheme(getTheme(selectedCharacter));
  }, [selectedCharacter]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalBreakTime = 5 * 60;
  const progress = ((totalBreakTime - breakTimeLeft) / totalBreakTime) * 100;
  const elapsedMinutes = Math.round((totalBreakTime - breakTimeLeft) / 60);
  const remainingMinutes = Math.ceil(breakTimeLeft / 60);

  const character = COMPANIONS.find(c => c.id === selectedCharacter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="break-ceremony"
      style={{
        background: theme.backgroundGradient.join(', '),
        backdropFilter: 'blur(25px)',
        overflow: 'hidden',
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.fontFamily
      }}
    >
      {/* Decorative Background Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 20% 30%, ${theme.primaryColor}08 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, ${theme.secondaryColor}06 0%, transparent 50%)`,
        zIndex: 1
      }} />
      
      {/* Pattern Background */}
      {renderPatternBackground(theme)}
      
      {/* Main container with theme-specific styling */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '480px',
          padding: '35px',
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: '28px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 182, 193, 0.4)',
          boxShadow: `
            0 25px 60px rgba(255, 182, 193, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.8),
            inset 0 0 40px rgba(255, 255, 255, 0.4)
          `,
          overflow: 'hidden'
        }}
      >
        {/* Decorative Corner Accents */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '25px',
          height: '25px',
          borderTop: '2px solid rgba(255, 182, 193, 0.6)',
          borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '8px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '25px',
          height: '25px',
          borderTop: '2px solid rgba(255, 182, 193, 0.6)',
          borderRight: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 8px 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          width: '25px',
          height: '25px',
          borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
          borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 0 0 8px'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          width: '25px',
          height: '25px',
          borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
          borderRight: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 0 8px 0'
        }} />
        
        {/* Title Section with Icon */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative',
            textAlign: 'center',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {theme.icon}
            <div style={{
              fontSize: '0.85rem',
              color: theme.accentColor,
              fontWeight: 'bold',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '6px 15px',
              borderRadius: '20px',
              border: `1px solid ${theme.secondaryColor}40`
            }}>
              {character?.epithet}'S BREAK
            </div>
            {theme.icon}
          </div>
          
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.2rem',
            color: theme.primaryColor,
            fontWeight: 'bold',
            lineHeight: 1.2,
            textShadow: '0 2px 10px rgba(255, 182, 193, 0.3)',
            position: 'relative'
          }}>
            {theme.name}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
                borderRadius: '1px'
              }}
            />
          </div>
        </motion.div>

        {/* Character Image Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '18px',
            margin: '15px 0 25px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `
              0 15px 35px ${theme.primaryColor}30,
              0 0 40px ${theme.secondaryColor}20
            `,
            border: `3px solid ${theme.secondaryColor}`,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.9))'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 30% 40%, ${theme.primaryColor}10, transparent 70%)`,
            zIndex: 1
          }} />
          
          <motion.img
            src={theme.characterImage}
            alt={character?.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '15px',
              position: 'relative',
              zIndex: 2
            }}
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating sparkles around image */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              animate={{
                scale: [0, 1, 0],
                rotate: 360,
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity
              }}
              style={{
                position: 'absolute',
                top: `${15 + (i % 3) * 25}%`,
                left: `${15 + Math.floor(i / 3) * 35}%`,
                width: '8px',
                height: '8px',
                background: theme.accentColor,
                borderRadius: '50%',
                filter: 'blur(1px)',
                zIndex: 3,
                boxShadow: `0 0 10px ${theme.accentColor}`
              }}
            />
          ))}
        </motion.div>
        
        {/* Timer Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: '20px 30px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            border: '2px solid #FFD1DC',
            margin: '15px 0',
            boxShadow: '0 12px 30px rgba(255, 182, 193, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          {/* Pattern overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 30% 30%, ${theme.primaryColor}20 0%, transparent 50%)`,
            zIndex: 0
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2.8rem',
              color: theme.primaryColor,
              letterSpacing: '2px',
              fontWeight: 300,
              marginBottom: '8px',
              textShadow: '0 2px 8px rgba(255, 182, 193, 0.3)'
            }}>
              {formatTime(breakTimeLeft)}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.accentColor,
              letterSpacing: '3px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              BREAK REMAINING
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            width: '100%',
            padding: '18px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '18px',
            border: '2px solid #FFD1DC',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Pattern overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 40% 50%, ${theme.primaryColor}30 0%, transparent 70%)`,
            zIndex: 0
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: theme.primaryColor,
              fontWeight: 'bold',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={14} color={theme.accentColor} />
              Break Progress
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.primaryColor,
              fontWeight: 'bold',
              background: `${theme.secondaryColor}20`,
              padding: '4px 12px',
              borderRadius: '15px',
              border: `1px solid ${theme.secondaryColor}40`
            }}>
              {Math.round(progress)}%
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 182, 193, 0.2)',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${theme.progressBarStyle.fillGradient.join(', ')})`,
                borderRadius: '4px',
                position: 'relative',
                boxShadow: `0 0 10px ${theme.primaryColor}30`
              }}
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  borderRadius: '4px'
                }}
              />
            </motion.div>
            
            {/* Time markers */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 5px'
            }}>
              {[0, 1, 2, 3, 4, 5].map((minute) => (
                <div key={minute} style={{
                  position: 'relative',
                  width: '2px',
                  height: '100%',
                  background: minute === 0 || minute === 5 ? theme.primaryColor : 'rgba(255, 182, 193, 0.3)',
                  borderRadius: '1px'
                }} />
              ))}
            </div>
          </div>
          
          {/* Time indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: theme.accentColor,
            fontWeight: 'bold'
          }}>
            <div>Start</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: theme.primaryColor,
                borderRadius: '50%',
                boxShadow: `0 0 5px ${theme.primaryColor}`
              }} />
              <span>{Math.floor(breakTimeLeft / 60)}:{String(breakTimeLeft % 60).padStart(2, '0')} left</span>
            </div>
            <div>End</div>
          </div>
        </motion.div>

        {/* Character-specific message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            color: theme.primaryColor,
            fontSize: '0.95rem',
            textAlign: 'center',
            lineHeight: '1.6',
            padding: '18px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 182, 193, 0.4)',
            marginBottom: '20px',
            fontStyle: 'italic',
            position: 'relative'
          }}
        >
          {/* Decorative quotation marks */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '15px',
            fontSize: '2rem',
            color: 'rgba(255, 182, 193, 0.3)',
            fontFamily: 'Georgia, serif'
          }}>
            "
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '15px',
            fontSize: '2rem',
            color: 'rgba(255, 182, 193, 0.3)',
            fontFamily: 'Georgia, serif'
          }}>
            "
          </div>
          
          <div style={{
            fontSize: '1rem',
            color: theme.accentColor,
            marginBottom: '8px',
            fontWeight: 'bold',
            fontStyle: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Heart size={16} color={theme.accentColor} />
            {character?.name}'s Whisper
            <Heart size={16} color={theme.accentColor} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {getCharacterBreakDialogue(selectedCharacter)}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: '5px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <motion.button
            onClick={onResume}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 50%, ${theme.primaryColor} 100%)`,
              backgroundSize: '200% 100%',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '14px 45px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `0 10px 25px ${theme.primaryColor}40`,
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <motion.div
              animate={{ x: '-100%', rotate: 45 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
              }}
            />
            <Sparkles size={18} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              Return to {character?.name}
            </span>
            <Sparkles size={18} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      {renderFloatingElements(theme)}
    </motion.div>
  );
};

// Theme definitions for each character with cute pink/white aesthetic
const getTheme = (characterId: number): BreakCeremonyTheme => {
  const baseGradient = 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 50%, #FFF8FA 100%)';
  
  switch(characterId) {
    case 1: // Caleb - Gentle Guardian
      return {
        id: 1,
        name: "Warm Embrace",
        backgroundColor: '#FFF0F5',
        backgroundGradient: [baseGradient],
        primaryColor: '#FF8E8E', // Soft coral pink
        secondaryColor: '#FFC8C8', // Light pink
        accentColor: '#FF6B93', // Romantic pink
        fontFamily: "'Quicksand', sans-serif",
        characterDialogue: "Rest here in my warmth. I'll keep you safe until you're ready to continue.",
        progressBarStyle: {
          background: '#FFC8C8',
          fillGradient: ['#FF8E8E', '#FFC8C8', '#FF8E8E'],
          markerColor: '#FF8E8E'
        },
        characterImage: "/images/break/1.png",
        icon: <Heart size={20} color="#FF6B93" />,
        pattern: 'hearts'
      };
      
    case 2: // Zayne - Precise Doctor
      return {
        id: 2,
        name: "Gentle Care",
        backgroundColor: '#FFF0F5',
        backgroundGradient: [baseGradient],
        primaryColor: '#94D8FF', // Soft baby blue
        secondaryColor: '#B8E6FF', // Light blue
        accentColor: '#69BFFF', // Sky blue
        fontFamily: "'Quicksand', sans-serif",
        characterDialogue: "Precisely 5 minutes of rest. Your heart rate suggests optimal recovery time.",
        progressBarStyle: {
          background: '#B8E6FF',
          fillGradient: ['#94D8FF', '#B8E6FF', '#94D8FF'],
          markerColor: '#94D8FF'
        },
        characterImage: "/images/break/2.png",
        icon: <Sparkles size={20} color="#69BFFF" />,
        pattern: 'stars'
      };
      
    case 3: // Rafayel - Artistic Muse
      return {
        id: 3,
        name: "Creative Pause",
        backgroundColor: '#FFF0F5',
        backgroundGradient: [baseGradient],
        primaryColor: '#FFB6C1', // Classic pink
        secondaryColor: '#FFD1DC', // Light pink
        accentColor: '#FF69B4', // Hot pink
        fontFamily: "'Dancing Script', cursive",
        characterDialogue: "Let this moment inspire you. Even masterpieces need moments to breathe.",
        progressBarStyle: {
          background: '#FFD1DC',
          fillGradient: ['#FFB6C1', '#FFD1DC', '#FFB6C1'],
          markerColor: '#FFB6C1'
        },
        characterImage: "/images/break/3.png",
        icon: <Flower2 size={20} color="#FF69B4" />,
        pattern: 'flowers'
      };
      
    case 4: // Xavier - Silent Knight
      return {
        id: 4,
        name: "Quiet Watch",
        backgroundColor: '#FFF0F5',
        backgroundGradient: [baseGradient],
        primaryColor: '#C9A8FF', // Lavender
        secondaryColor: '#E0D1FF', // Light lavender
        accentColor: '#A685FF', // Deep lavender
        fontFamily: "'Quicksand', sans-serif",
        characterDialogue: "The silence is my promise. Rest peacefully, I'll guard your dreams.",
        progressBarStyle: {
          background: '#E0D1FF',
          fillGradient: ['#C9A8FF', '#E0D1FF', '#C9A8FF'],
          markerColor: '#C9A8FF'
        },
        characterImage: "/images/break/4.png",
        icon: <Moon size={20} color="#A685FF" />,
        pattern: 'music'
      };
      
    case 5: // Sylus - Protective Dragon
      return {
        id: 5,
        name: "Safe Haven",
        backgroundColor: '#FFF0F5',
        backgroundGradient: [baseGradient],
        primaryColor: '#FFA07A', // Light salmon
        secondaryColor: '#FFC9B8', // Peach
        accentColor: '#FF7F50', // Coral
        fontFamily: "'Quicksand', sans-serif",
        characterDialogue: "Stay within my sight. This break is my gift to you - don't waste it.",
        progressBarStyle: {
          background: '#FFC9B8',
          fillGradient: ['#FFA07A', '#FFC9B8', '#FFA07A'],
          markerColor: '#FFA07A'
        },
        characterImage: "/images/break/5.png",
        icon: <Coffee size={20} color="#FF7F50" />,
        pattern: 'dragon'
      };
      
    default:
      return getTheme(1);
  }
};

// Helper functions
const renderPatternBackground = (theme: BreakCeremonyTheme) => {
  switch(theme.pattern) {
    case 'hearts':
      return (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                position: 'absolute',
                left: `${10 + (i % 5) * 20}%`,
                top: `${10 + Math.floor(i / 5) * 25}%`,
                width: '20px',
                height: '20px',
                background: theme.primaryColor,
                clipPath: 'polygon(50% 0%, 100% 35%, 82% 100%, 50% 75%, 18% 100%, 0% 35%)',
                opacity: 0.1,
                zIndex: 1
              }}
            />
          ))}
        </>
      );
      
    case 'flowers':
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`flower-${i}`}
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20 + i * 2, 
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
              style={{
                position: 'absolute',
                left: `${15 + (i % 4) * 25}%`,
                top: `${15 + Math.floor(i / 4) * 30}%`,
                width: '25px',
                height: '25px',
                background: `radial-gradient(circle, ${theme.secondaryColor}30, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(2px)',
                opacity: 0.15,
                zIndex: 1
              }}
            >
              {/* Flower petals */}
              {[0, 1, 2, 3, 4].map((petal) => (
                <div
                  key={petal}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '15px',
                    height: '15px',
                    background: theme.accentColor,
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) rotate(${petal * 72}deg) translateX(20px)`,
                    opacity: 0.1
                  }}
                />
              ))}
            </motion.div>
          ))}
        </>
      );
      
    case 'stars':
      return (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{
                position: 'absolute',
                left: `${5 + (i % 5) * 20}%`,
                top: `${10 + Math.floor(i / 5) * 20}%`,
                width: '8px',
                height: '8px',
                background: theme.primaryColor,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                opacity: 0.1,
                zIndex: 1
              }}
            />
          ))}
        </>
      );
      
    case 'music':
      return (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`note-${i}`}
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 2 + i * 0.5, 
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                position: 'absolute',
                left: `${20 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 30}%`,
                display: 'flex',
                alignItems: 'center',
                opacity: 0.1,
                zIndex: 1
              }}
            >
              <div style={{
                width: '12px',
                height: '20px',
                background: theme.primaryColor,
                borderRadius: '4px 4px 0 0'
              }} />
              <div style={{
                width: '18px',
                height: '8px',
                background: theme.primaryColor,
                borderRadius: '4px',
                marginLeft: '-4px'
              }} />
            </motion.div>
          ))}
        </>
      );
      
    case 'dragon':
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`scale-${i}`}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                delay: i * 0.4
              }}
              style={{
                position: 'absolute',
                left: `${10 + (i % 4) * 25}%`,
                top: `${15 + Math.floor(i / 4) * 25}%`,
                width: '20px',
                height: '20px',
                background: theme.primaryColor,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                opacity: 0.1,
                zIndex: 1,
                transform: 'rotate(45deg)'
              }}
            />
          ))}
        </>
      );
      
    default:
      return null;
  }
};

const renderFloatingElements = (theme: BreakCeremonyTheme) => {
  const count = 15;
  const elements = [];
  
  for (let i = 0; i < count; i++) {
    let shape = '50%';
    let size = '12px';
    let element = null;
    
    // Different floating elements for each theme
    switch(theme.pattern) {
      case 'hearts':
        element = (
          <motion.div
            key={`float-heart-${i}`}
            initial={{
              y: -50,
              x: `${5 + i * 7}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: '120vh',
              x: `${5 + i * 7 + (Math.sin(i) * 15)}%`,
              rotate: 360 + (i * 45),
              opacity: [0, 0.4, 0.2, 0]
            }}
            transition={{
              duration: 20 + (i * 2),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '18px',
              height: '18px',
              background: theme.primaryColor,
              clipPath: 'polygon(50% 0%, 100% 35%, 82% 100%, 50% 75%, 18% 100%, 0% 35%)',
              opacity: 0.3,
              zIndex: 2,
              filter: 'blur(0.5px)'
            }}
          />
        );
        break;
        
      case 'flowers':
        element = (
          <motion.div
            key={`float-flower-${i}`}
            initial={{
              y: -50,
              x: `${5 + i * 7}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: '120vh',
              x: `${5 + i * 7 + (Math.cos(i) * 15)}%`,
              rotate: 360 + (i * 60),
              opacity: [0, 0.4, 0.2, 0]
            }}
            transition={{
              duration: 25 + (i * 2),
              repeat: Infinity,
              delay: i * 0.6,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              background: `radial-gradient(circle, ${theme.secondaryColor}, ${theme.primaryColor})`,
              borderRadius: '50%',
              opacity: 0.3,
              zIndex: 2,
              filter: 'blur(1px)'
            }}
          />
        );
        break;
        
      case 'stars':
        element = (
          <motion.div
            key={`float-star-${i}`}
            initial={{
              y: -50,
              x: `${5 + i * 7}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: '120vh',
              x: `${5 + i * 7 + (Math.sin(i) * 12)}%`,
              rotate: 360 + (i * 30),
              opacity: [0, 0.5, 0.2, 0]
            }}
            transition={{
              duration: 18 + (i * 1.5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: theme.primaryColor,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              opacity: 0.4,
              zIndex: 2,
              filter: 'blur(0.5px)'
            }}
          />
        );
        break;
        
      case 'music':
        element = (
          <motion.div
            key={`float-note-${i}`}
            initial={{
              y: -50,
              x: `${5 + i * 7}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: '120vh',
              x: `${5 + i * 7 + (Math.cos(i) * 10)}%`,
              rotate: [0, 10, -10, 0],
              opacity: [0, 0.3, 0.1, 0]
            }}
            transition={{
              duration: 22 + (i * 2),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.3,
              zIndex: 2
            }}
          >
            <div style={{
              width: '8px',
              height: '14px',
              background: theme.primaryColor,
              borderRadius: '3px 3px 0 0'
            }} />
            <div style={{
              width: '12px',
              height: '6px',
              background: theme.primaryColor,
              borderRadius: '3px',
              marginLeft: '-3px'
            }} />
          </motion.div>
        );
        break;
        
      case 'dragon':
        element = (
          <motion.div
            key={`float-scale-${i}`}
            initial={{
              y: -50,
              x: `${5 + i * 7}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: '120vh',
              x: `${5 + i * 7 + (Math.sin(i) * 20)}%`,
              rotate: 360 + (i * 90),
              opacity: [0, 0.3, 0.1, 0]
            }}
            transition={{
              duration: 30 + (i * 3),
              repeat: Infinity,
              delay: i * 1,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '14px',
              height: '14px',
              background: theme.primaryColor,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              opacity: 0.3,
              zIndex: 2,
              filter: 'blur(0.5px)',
              transform: 'rotate(45deg)'
            }}
          />
        );
        break;
    }
    
    if (element) {
      elements.push(element);
    }
  }
  
  return elements;
};

const getCharacterBreakDialogue = (characterId: number): string => {
  const dialogues = {
    1: "My warmth surrounds you like a gentle blanket. Rest easy, I won't let anything disturb your peace.",
    2: "Every moment of rest is calculated for maximum efficiency. Your body will thank you for this pause.",
    3: "Let the colors of your thoughts blend softly. Even creativity needs moments to settle and shine.",
    4: "The quiet speaks volumes. Listen to its whispers while I keep watch over your dreams.",
    5: "Consider this break a sanctuary I've created just for you. Stay close, and find your strength here."
  };
  
  return dialogues[characterId as keyof typeof dialogues] || dialogues[1];
};

export default BreakCeremony;