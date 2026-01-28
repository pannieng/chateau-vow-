import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { motion, AnimatePresence, type Variants, useMotionValue, useSpring } from "framer-motion";
import { Hourglass, User, Key, Coffee as Tea, ChevronLeft } from 'lucide-react';
import './App.css';


// --- TYPES ---
type AppStage = 'landing' | 'name_entry' | 'video_transition' | 'selection' | 'vow_setup' | 'timer';

interface Companion {
  id: number;
  name: string;
  epithet: string;
  focusPower: string;
  dialogue: string;
  secretDialogue: string;
  vowConfirmation: string;
  completionDialogue: string;
  timeDialogue: string;
  videoUrl: string;
  videoSmilingUrl: string;
  vibeHearts: 1 | 2 | 3;
  imageUrl: string;
  affinity: number;
  // New dialogue stages for timer
  startDialogue: string[];
  middleDialogue: string[];
  endDialogue: string[];
  distractionDialogue: string[];
}

// Add this missing interface
interface BackgroundVideoProps {
  src: string;
  brightness?: string;
  blur?: boolean;
}
// Add interface for timer dialogue
interface TimerDialogue {
  text: string;
  stage: 'start' | 'middle' | 'end' | 'distraction';
  shouldShow: boolean;
}

// --- UPDATED COMPANIONS WITH DIALOGUE STAGES ---
const COMPANIONS: Companion[] = [
  {
    id: 1,
    name: "Caleb",
    epithet: "CALEB",
    focusPower: "Caleb provides the wisdom of silence.",
    dialogue: "I'll make sure you don't get distracted, okay?",
    secretDialogue: "Are you quite finished staring? We have work to do.",
    vowConfirmation: "{playerName}, you've chosen me to witness your vow? I won't let you down.",
    completionDialogue: "I knew you could do it. I'm proud of us, {playerName}.",
    timeDialogue: "A wise commitment. Let's begin.",
    videoUrl: "/videos/characters/caleb_live.mp4",
    videoSmilingUrl: "/videos/characters/caleb_smiling.mp4",
    vibeHearts: 1,
    affinity: 0,
    imageUrl: "/images/characters/1.png",
    startDialogue: [
      "Let us begin. I shall keep watch.",
      "Focus your mind. I will be your witness.",
      "The journey starts with a single moment of resolve."
    ],
    middleDialogue: [
      "You are doing well. Do not overexert yourself.",
      "Steady progress is better than rushed perfection.",
      "Your dedication is showing. Keep going."
    ],
    endDialogue: [
      "Almost there. I can feel the finish line.",
      "The final stretch requires your strongest resolve.",
      "You've come so far. Just a little more."
    ],
    distractionDialogue: [
      "Focus on your work, not on me!",
      "Eyes on the goal, not the witness.",
      "Your attention should be elsewhere..."
    ]
  },
  {
    id: 2,
    name: "Zayne",
    epithet: "ZAYNE",
    focusPower: "Zayne grants calm command over wandering thoughts.",
    dialogue: "A refined mind deserves a refined vow.",
    secretDialogue: "My appearance captivates you, doesn't it? Focus, please.",
    vowConfirmation: "{playerName}, an elegant choice. I shall be your steadfast witness.",
    completionDialogue: "Your dedication is admirable. Well done, {playerName}.",
    timeDialogue: "Refined minds choose refined durations.",
    videoUrl: "/videos/characters/zayne_live.mp4",
    videoSmilingUrl: "/videos/characters/zayne_smiling.mp4",
    vibeHearts: 1,
    affinity: 0,
    imageUrl: "/images/characters/2.png",
    startDialogue: [
      "Let us begin. I shall keep watch.",
      "Focus your mind. I will be your witness.",
      "The journey starts with a single moment of resolve."
    ],
    middleDialogue: [
      "You are doing well. Do not overexert yourself.",
      "Steady progress is better than rushed perfection.",
      "Your dedication is showing. Keep going."
    ],
    endDialogue: [
      "Almost there. I can feel the finish line.",
      "The final stretch requires your strongest resolve.",
      "You've come so far. Just a little more."
    ],
    distractionDialogue: [
      "Focus on your work, not on me!",
      "Eyes on the goal, not the witness.",
      "Your attention should be elsewhere..."
    ]
  },
  {
    id: 3,
    name: "Rafayel",
    epithet: "RAFAYEL",
    focusPower: "Rafayel protects your vow from distraction's pull.",
    dialogue: "Your focus is safe with me.",
    secretDialogue: "I can feel your gaze. Don't worry, I'm not going anywhere.",
    vowConfirmation: "{playerName}, your vow is now under my protection. Shall we begin?",
    completionDialogue: "You were amazing. Let's do this again sometime, {playerName}.",
    timeDialogue: "A brave commitment. I'll guard it well.",
    videoUrl: "/videos/characters/rafayel_live.mp4",
    videoSmilingUrl: "/videos/characters/rafayel_smiling.mp4",
    vibeHearts: 1,
    affinity: 0,
    imageUrl: "/images/characters/4.png",
    startDialogue: [
      "Let us begin. I shall keep watch.",
      "Focus your mind. I will be your witness.",
      "The journey starts with a single moment of resolve."
    ],
    middleDialogue: [
      "You are doing well. Do not overexert yourself.",
      "Steady progress is better than rushed perfection.",
      "Your dedication is showing. Keep going."
    ],
    endDialogue: [
      "Almost there. I can feel the finish line.",
      "The final stretch requires your strongest resolve.",
      "You've come so far. Just a little more."
    ],
    distractionDialogue: [
      "Focus on your work, not on me!",
      "Eyes on the goal, not the witness.",
      "Your attention should be elsewhere..."
    ]
  },
  {
    id: 4,
    name: "Xavier",
    epithet: "XAVIER",
    focusPower: "Xavier stirs gentle momentum when focus feels distant.",
    dialogue: "Shall we turn your quiet into something beautiful?",
    secretDialogue: "You seem to enjoy looking at me. That's... sweet.",
    vowConfirmation: "{playerName}, a beautiful choice. Let's create something meaningful together.",
    completionDialogue: "We created something wonderful together, didn't we, {playerName}?",
    timeDialogue: "The longer the vow, the more beautiful the outcome.",
    videoUrl: "/videos/characters/xavier_live.mp4",
    videoSmilingUrl: "/videos/characters/xavier_smiling.mp4",
    vibeHearts: 1,
    affinity: 0,
    imageUrl: "/images/characters/3.png",
    startDialogue: [
      "Let us begin. I shall keep watch.",
      "Focus your mind. I will be your witness.",
      "The journey starts with a single moment of resolve."
    ],
    middleDialogue: [
      "You are doing well. Do not overexert yourself.",
      "Steady progress is better than rushed perfection.",
      "Your dedication is showing. Keep going."
    ],
    endDialogue: [
      "Almost there. I can feel the finish line.",
      "The final stretch requires your strongest resolve.",
      "You've come so far. Just a little more."
    ],
    distractionDialogue: [
      "Focus on your work, not on me!",
      "Eyes on the goal, not the witness.",
      "Your attention should be elsewhere..."
    ]
  },
  {
    id: 5,
    name: "Sylus",
    epithet: "SYLUS",
    focusPower: "Sylus steadies you—unchanging, faithful, unhurried.",
    dialogue: "Stay with me. We'll outlast the noise.",
    secretDialogue: "Your attention is appreciated, but let's focus on the task.",
    vowConfirmation: "{playerName}, patience is our virtue. I'll stand with you till the end.",
    completionDialogue: "You showed great perseverance. I'm impressed, {playerName}.",
    timeDialogue: "Steady hands choose steady hours.",
    videoUrl: "/videos/characters/sylus_live.mp4",
    videoSmilingUrl: "/videos/characters/sylus_smiling.mp4",
    vibeHearts: 1,
    affinity: 0,
    imageUrl: "/images/characters/5.png",
    startDialogue: [
      "Let us begin. I shall keep watch.",
      "Focus your mind. I will be your witness.",
      "The journey starts with a single moment of resolve."
    ],
    middleDialogue: [
      "You are doing well. Do not overexert yourself.",
      "Steady progress is better than rushed perfection.",
      "Your dedication is showing. Keep going."
    ],
    endDialogue: [
      "Almost there. I can feel the finish line.",
      "The final stretch requires your strongest resolve.",
      "You've come so far. Just a little more."
    ],
    distractionDialogue: [
      "Focus on your work, not on me!",
      "Eyes on the goal, not the witness.",
      "Your attention should be elsewhere..."
    ]
  },
];

const TIME_OPTIONS = [
  { id: 25, label: "The Spark Vow", description: "25 minutes of quick focus", color: "#ff9ec0" },
  { id: 50, label: "The Deep Vow", description: "50 minutes of standard study", color: "#ff6b93" },
  { id: 90, label: "The Eternal Vow", description: "90 minutes of deep work", color: "#ff3d6a" },
];

// --- GALGAME TIMER TYPES ---
interface SpiritMeterProps {
  progress: number;
  isCompleted: boolean;
}

interface TimerDialogueProps {
  dialogue: TimerDialogue;
  onHoverCharacter: () => void;
}

interface ImmersiveTimerProps {
  timeLeft: number;
  isImmersive: boolean;
  onToggleImmersive: () => void;
}

const SpiritMeter = React.memo(({ progress, isCompleted }: SpiritMeterProps) => {
  const [flowerProgress, setFlowerProgress] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setFlowerProgress(100);
    } else {
      setFlowerProgress(progress);
    }
  }, [progress, isCompleted]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="spirit-meter-container"
    >
      <div className="sakura-branch">
        {/* Leaves */}
        {[20, 40, 60, 80].map((position) => (
          <motion.div
            key={position}
            className="branch-leaves"
            style={{ top: `${position}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: position * 0.01 }}
          />
        ))}

        {/* Flower Bud */}
        <motion.div
          className={`flower-bud ${flowerProgress > 80 || isCompleted ? 'blooming' : ''}`}
          style={{
            top: `${100 - flowerProgress}%`,
          }}
          animate={isCompleted ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={isCompleted ? {
            duration: 2,
            repeat: Infinity
          } : {}}
        >
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((rotation, index) => (
            <motion.div
              key={index}
              className="flower-petal"
              initial={{ opacity: 0, scale: 0 }}
              animate={flowerProgress > 80 ? {
                opacity: 1,
                scale: 1,
                rotate: rotation
              } : {}}
              transition={{
                delay: index * 0.1,
                duration: 0.5
              }}
            />
          ))}
        </motion.div>
      </div>
      <motion.div
        className="spirit-progress-label"
        animate={isCompleted ? {
          scale: [1, 1.1, 1]
        } : {}}
        transition={isCompleted ? {
          duration: 1,
          repeat: Infinity
        } : {}}
      >
        {isCompleted ? '🌸 Fully Bloomed 🌸' : `Spirit: ${Math.round(flowerProgress)}%`}
      </motion.div>
    </motion.div>
  );
});

SpiritMeter.displayName = 'SpiritMeter';

const TimerDialogueComponent = React.memo(({ dialogue, onHoverCharacter }: TimerDialogueProps) => {
  return (
    <motion.div
      key={dialogue.text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: dialogue.shouldShow ? 1 : 0, y: dialogue.shouldShow ? 0 : 20 }}
      exit={{ opacity: 0 }}
      className="live-dialogue-container"
      onClick={onHoverCharacter}
    >
      <div className={`speech-bubble-timer dialogue-state-${dialogue.stage}`}>
        <div className="dialogue-character-name">WITNESS</div>
        <div className="dialogue-text">"{dialogue.text}"</div>
      </div>
      <div className="dialogue-hint">Click character to trigger special dialogue</div>
    </motion.div>
  );
});

TimerDialogueComponent.displayName = 'TimerDialogueComponent';

const ImmersiveTimer = React.memo(({ timeLeft, isImmersive, onToggleImmersive }: {
  timeLeft: number;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  // Remove characterName prop from here since it's now above the timer
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="immersive-timer-container"
    >
      {/* REMOVE character name from here - it's now above the timer container */}

      <motion.button
        className="pocket-watch"
        onClick={onToggleImmersive}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="roman-numerals">
          {romanNumerals.map((numeral, index) => (
            <span
              key={index}
              className="roman-numeral"
              style={{ transform: `rotate(${index * 30}deg) translateY(-30px)` }}
            >
              {numeral}
            </span>
          ))}
        </div>
        <motion.div
          className="pocket-watch-face"
          animate={isImmersive ? { opacity: 0.3 } : { opacity: 1 }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </motion.button>
    </motion.div>
  );
});

ImmersiveTimer.displayName = 'ImmersiveTimer';


const BreakCeremony = ({
  breakTimeLeft,
  onResume
}: {
  breakTimeLeft: number;
  onResume: () => void;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalBreakTime = 5 * 60; // 5 minutes in seconds
  const progress = ((totalBreakTime - breakTimeLeft) / totalBreakTime) * 100;
  const elapsedMinutes = Math.round((totalBreakTime - breakTimeLeft) / 60);
  const remainingMinutes = Math.ceil(breakTimeLeft / 60);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="break-ceremony"
      style={{
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 50%, #FFF8FA 100%)',
        backdropFilter: 'blur(25px)',
        overflow: 'hidden',
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      {/* Delicate Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(255, 105, 180, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 209, 220, 0.1) 0%, transparent 50%)
        `,
        zIndex: 1
      }} />

      {/* Rose Gold Sheen Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(45deg, transparent, rgba(255, 223, 230, 0.1), transparent)',
        zIndex: 2
      }} />

      {/* Main Container */}
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
          width: '450px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: '30px',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 182, 193, 0.4)',
          boxShadow: `
            0 20px 50px rgba(255, 182, 193, 0.25),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6),
            inset 0 0 30px rgba(255, 255, 255, 0.3)
          `,
          overflow: 'hidden'
        }}
      >
        {/* Decorative Corner Accents */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          width: '30px',
          height: '30px',
          borderTop: '2px solid rgba(255, 182, 193, 0.6)',
          borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '10px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          width: '30px',
          height: '30px',
          borderTop: '2px solid rgba(255, 182, 193, 0.6)',
          borderRight: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 10px 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          width: '30px',
          height: '30px',
          borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
          borderLeft: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 0 0 10px'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          width: '30px',
          height: '30px',
          borderBottom: '2px solid rgba(255, 182, 193, 0.6)',
          borderRight: '2px solid rgba(255, 182, 193, 0.6)',
          borderRadius: '0 0 10px 0'
        }} />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative',
            textAlign: 'center',
            marginBottom: '25px'
          }}
        >
          <div style={{
            fontSize: '0.85rem',
            color: '#FFB6C1',
            fontWeight: 'normal',
            letterSpacing: '4px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            A VOW'S INTERLUDE
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.4rem',
            color: '#FF69B4',
            fontWeight: 'bold',
            lineHeight: 1.2,
            textShadow: '0 2px 10px rgba(255, 182, 193, 0.3)'
          }}>
            Rose Tea Ceremony
          </div>
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #FFB6C1, transparent)'
            }}
          />
        </motion.div>

        {/* Elegant Tea Set Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '35px',
            margin: '25px 0 35px',
            position: 'relative'
          }}
        >
          {/* Delicate Tea Cup */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'relative',
              width: '85px',
              height: '95px'
            }}
          >
            {/* Cup Body */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #FFF, #F8F8FF, #FFF)',
              borderRadius: '40px 40px 25px 25px',
              boxShadow: `
                0 10px 25px rgba(255, 182, 193, 0.3),
                inset 0 0 30px rgba(255, 255, 255, 0.8),
                inset 0 5px 0 rgba(255, 255, 255, 0.9)
              `,
              border: '3px solid #FFD1DC',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Tea Liquid */}
              <motion.div
                animate={{
                  height: ['48px', '51px', '48px'],
                  background: [
                    'linear-gradient(to bottom, #FFB6C1, #FF69B4)',
                    'linear-gradient(to bottom, #FFC0CB, #FF6B93)',
                    'linear-gradient(to bottom, #FFB6C1, #FF69B4)'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '8px',
                  right: '8px',
                  height: '48px',
                  borderRadius: '30px 30px 18px 18px',
                  boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  opacity: 0.9
                }}
              >
                {/* Tea Surface Ripples */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '50%',
                    filter: 'blur(1px)'
                  }}
                />
              </motion.div>

              {/* Gold Rim */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '-3px',
                right: '-3px',
                height: '5px',
                background: 'linear-gradient(90deg, #FFD700, #FFEC8B, #FFD700)',
                borderRadius: '5px',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
              }} />
            </div>

            {/* Handle */}
            <div style={{
              position: 'absolute',
              right: '-14px',
              top: '30px',
              width: '18px',
              height: '40px',
              background: 'linear-gradient(to right, #FFD1DC, #FFB6C1)',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              borderLeft: 'none',
              borderRadius: '0 15px 15px 0',
              boxShadow: '3px 3px 10px rgba(255, 182, 193, 0.3)'
            }} />

            {/* Steam Animation */}
            <motion.div
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -40, opacity: [0, 0.8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '30px',
                background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.7) 0%, transparent 70%)',
                filter: 'blur(4px)',
                borderRadius: '50%'
              }}
            />
          </motion.div>

          {/* Beautiful Strawberry Shortcake */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              position: 'relative',
              width: '75px',
              height: '90px'
            }}
          >
            {/* Cake Plate */}
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              left: '0',
              right: '0',
              height: '6px',
              background: 'linear-gradient(135deg, #FFF5F5, #FFE4E9, #FFF5F5)',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(255, 182, 193, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }} />

            {/* Cake Base Layer */}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              left: '5px',
              right: '5px',
              height: '25px',
              background: 'linear-gradient(135deg, #FFE4B5, #FFDAB9, #FFE4B5)',
              borderRadius: '12px 12px 8px 8px',
              boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.6)'
            }}>
              {/* Sponge Texture */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '1px'
              }} />
            </div>

            {/* Whipped Cream Layer */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '0px',
              right: '0px',
              height: '25px',
              background: 'linear-gradient(135deg, #FFF, #FFF5F5, #FFF)',
              borderRadius: '15px',
              boxShadow: '0 3px 10px rgba(255, 255, 255, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              overflow: 'hidden'
            }}>
              {/* Cream Swirls */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    left: `${10 + i * 20}%`,
                    top: '5px',
                    width: '15px',
                    height: '15px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(1px)'
                  }}
                />
              ))}
            </div>

            {/* Top Cake Layer */}
            <div style={{
              position: 'absolute',
              bottom: '55px',
              left: '5px',
              right: '5px',
              height: '25px',
              background: 'linear-gradient(135deg, #FFE4B5, #FFDAB9, #FFE4B5)',
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.6)'
            }} />

            {/* Fresh Strawberries */}
            {[
              { top: '15px', left: '15px' },
              { top: '5px', left: '50%', transform: 'translateX(-50%)' },
              { top: '25px', right: '15px' }
            ].map((pos, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  transform: pos.transform,
                  width: '12px',
                  height: '12px',
                  background: 'radial-gradient(circle at 30% 30%, #FF4757, #FF6B81, #FF4757)',
                  borderRadius: '50% 50% 50% 20%',
                  boxShadow: '0 2px 8px rgba(255, 107, 129, 0.4)',
                  zIndex: 3
                }}
              >
                {/* Strawberry Seeds */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, seedIndex) => (
                  <div
                    key={seedIndex}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(4px)`,
                      width: '1px',
                      height: '1px',
                      background: '#FFD700',
                      borderRadius: '50%'
                    }}
                  />
                ))}
                {/* Strawberry Leaf */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '6px',
                  height: '4px',
                  background: 'linear-gradient(to bottom, #90EE90, #32CD32)',
                  borderRadius: '50% 50% 0 0',
                  clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)'
                }} />
              </motion.div>
            ))}

            {/* Powdered Sugar Dusting */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sugar-${i}`}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Infinity
                }}
                style={{
                  position: 'absolute',
                  top: `${10 + (i % 4) * 15}px`,
                  left: `${10 + Math.floor(i / 4) * 30}px`,
                  width: '3px',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  filter: 'blur(0.5px)',
                  zIndex: 2
                }}
              />
            ))}
          </motion.div>

          {/* Rose Book */}
          <motion.div
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              position: 'relative',
              width: '55px',
              height: '70px'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #FFE4E9, #FFD1DC, #FFE4E9)',
              borderRadius: '5px 10px 10px 5px',
              boxShadow: `
                3px 3px 12px rgba(255, 182, 193, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.6)
              `,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              position: 'relative'
            }}>
              {/* Book Spine */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '8px',
                height: '100%',
                background: 'linear-gradient(to bottom, #FF69B4, #FF1493, #FF69B4)',
                borderRadius: '5px 0 0 5px',
                boxShadow: '2px 0 5px rgba(255, 105, 180, 0.3)'
              }} />

              {/* Book Pages */}
              <div style={{
                position: 'absolute',
                right: '5px',
                top: '10px',
                bottom: '10px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '3px',
                border: '1px solid rgba(255, 182, 193, 0.2)'
              }}>
                {/* Page Lines */}
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: '8px',
                    right: '8px',
                    top: `${15 + i * 12}px`,
                    height: '1px',
                    background: 'rgba(255, 182, 193, 0.15)',
                    borderRadius: '1px'
                  }} />
                ))}
              </div>

              {/* Rose Emblem */}
              <div style={{
                position: 'absolute',
                top: '25px',
                right: '12px',
                width: '12px',
                height: '12px',
                background: 'radial-gradient(circle, #FF69B4, #FF1493)',
                borderRadius: '50%',
                filter: 'blur(0.5px)',
                opacity: 0.8
              }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Timer Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: '25px 35px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            border: '2px solid #FFD1DC',
            margin: '25px 0',
            boxShadow: `
              0 15px 35px rgba(255, 182, 193, 0.25),
              inset 0 0 25px rgba(255, 255, 255, 0.5)
            `,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Floating Rose Petals Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255, 105, 180, 0.1) 0%, transparent 50%)`,
            zIndex: 0
          }} />

          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '3.2rem',
              color: '#FF69B4',
              letterSpacing: '3px',
              fontWeight: 300,
              marginBottom: '8px',
              textShadow: '0 2px 8px rgba(255, 182, 193, 0.3)'
            }}>
              {formatTime(breakTimeLeft)}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#FFB6C1',
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
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            border: '2px solid #FFD1DC',
            marginBottom: '25px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Progress Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{
              fontSize: '0.95rem',
              color: '#FF69B4',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              Break Progress
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#FF69B4',
              fontWeight: 'bold',
              background: 'rgba(255, 209, 220, 0.2)',
              padding: '5px 12px',
              borderRadius: '15px'
            }}>
              {Math.round(progress)}%
            </div>
          </div>

          {/* Progress Bar Container */}
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 182, 193, 0.2)',
            borderRadius: '5px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            {/* Animated Progress Fill */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #FFB6C1, #FF69B4, #FF1493)',
                borderRadius: '5px',
                position: 'relative',
                boxShadow: '0 0 10px rgba(255, 105, 180, 0.3)'
              }}
            >
              {/* Shimmer Effect */}
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
                  borderRadius: '5px'
                }}
              />
            </motion.div>

            {/* Minute Markers */}
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
                  background: minute === 0 || minute === 5 ? 'rgba(255, 182, 193, 0.5)' : 'rgba(255, 182, 193, 0.3)',
                  borderRadius: '1px'
                }}>
                  {minute > 0 && minute < 5 && (
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.7rem',
                      color: '#FFB6C1',
                      fontWeight: 'bold'
                    }}>
                      {minute}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#FFB6C1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#FF69B4',
                borderRadius: '50%',
                boxShadow: '0 0 5px rgba(255, 105, 180, 0.5)'
              }} />
              <span>Elapsed: {elapsedMinutes} min</span>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#FF69B4',
              fontWeight: 'bold'
            }}>
              {Math.floor(breakTimeLeft / 60)}:{String(breakTimeLeft % 60).padStart(2, '0')} left
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Remaining: {remainingMinutes} min</span>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#FFD1DC',
                borderRadius: '50%',
                boxShadow: '0 0 5px rgba(255, 209, 220, 0.5)'
              }} />
            </div>
          </div>
        </motion.div>

        {/* Poetic Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            color: '#FF69B4',
            fontSize: '1rem',
            textAlign: 'center',
            lineHeight: '1.7',
            padding: '20px',
            background: 'rgba(255, 248, 250, 0.9)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 182, 193, 0.4)',
            marginBottom: '25px',
            fontStyle: 'italic',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Quotation Marks */}
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
            fontSize: '1.1rem',
            color: '#FF1493',
            marginBottom: '10px',
            fontWeight: 'bold',
            fontStyle: 'normal',
            letterSpacing: '0.5px'
          }}>
            A Moment of Grace
          </div>
          Sip slowly... Let each breath be a petal falling in the garden of time.
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: '15px',
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
              background: 'linear-gradient(135deg, #FF69B4 0%, #FF8FAB 50%, #FF69B4 100%)',
              backgroundSize: '200% 100%',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '14px 50px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 105, 180, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '1px'
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
            <span style={{ position: 'relative', zIndex: 1 }}>
              Return to Vows
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Delicate Floating Rose Petals */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          initial={{
            y: -50,
            x: `${10 + i * 8}%`,
            rotate: 0,
            opacity: 0
          }}
          animate={{
            y: '120vh',
            x: `${10 + i * 8 + (Math.sin(i) * 20)}%`,
            rotate: 360 + (i * 45),
            opacity: [0, 0.6, 0.2, 0]
          }}
          transition={{
            duration: 25 + (i * 2),
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
            borderRadius: '50% 0 50% 50%',
            filter: 'blur(0.8px)',
            opacity: 0.7,
            zIndex: 2,
            boxShadow: '0 2px 6px rgba(255, 182, 193, 0.4)'
          }}
        />
      ))}

      {/* Subtle Sparkle Effects */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
            rotate: 360
          }}
          transition={{
            duration: 3,
            delay: i * 0.4,
            repeat: Infinity
          }}
          style={{
            position: 'absolute',
            top: `${20 + i * 10}%`,
            left: `${5 + i * 12}%`,
            width: '6px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            filter: 'blur(0.5px)',
            zIndex: 1
          }}
        />
      ))}
    </motion.div>
  );
};

const GalgameEndConfirmation = ({
  selectedCharacter,
  playerName,
  onConfirmEnd,
  onCancel,
  onContinueVow
}: {
  selectedCharacter: number;
  playerName: string;
  onConfirmEnd: () => void;
  onCancel: () => void;
  onContinueVow: () => void;
}) => {
  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [dialogueText, setDialogueText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);

  const emotionalDialogues = [
    `Are you leaving already, ${playerName}? Our vow hasn't finished...`,
    "I was enjoying our time together. Must you break our promise?",
    "The gates are still sealed. Stay a little longer with me...",
    "I don't want you to go. Can't we continue our focus together?",
    "Please... don't abandon our vow. I believe in your strength."
  ];

  useEffect(() => {
    if (!selected || hasChosen) return;

    // Random emotional dialogue from character-specific lines + generic ones
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
    setHasChosen(true);
    // Brief pause for dramatic effect
    setTimeout(() => {
      onConfirmEnd();
    }, 800);
  };

  const handleStay = () => {
    setHasChosen(true);
    // Emotional response before continuing
    setDialogueText("Thank you for staying... I won't let you down.");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => {
        onContinueVow();
      }, 1000);
    }, 1500);
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
      {/* Animated heartbreak effect */}
      <div className="absolute inset-0 overflow-hidden">
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
          boxShadow: '0 25px 60px rgba(255, 105, 180, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.3)'
        }}
      >
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
              src={selected?.imageUrl}
              alt={selected?.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9) contrast(1.1)'
              }}
            />
            {/* Tear effect */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: [0, 1, 0], y: [0, 30, 60] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3px',
                height: '15px',
                background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.8), transparent)',
                borderRadius: '3px',
                filter: 'blur(1px)'
              }}
            />
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
            position: 'relative'
          }}
          onClick={handleSkipTyping}
        >
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
              letterSpacing: '1px'
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
              paddingTop: '10px'
            }}
          >
            "{dialogueText}"
            {isTyping && <span className="typing-cursor">|</span>}
          </div>

          {!isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="click-hint"
              style={{
                textAlign: 'center',
                color: '#FF69B4',
                fontSize: '12px',
                marginTop: '15px',
                fontStyle: 'italic'
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
                gap: '20px'
              }}
            >
              {/* Stay option */}
              <motion.button
                onClick={handleStay}
                whileHover={{ scale: 1.03, x: -5 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '18px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(255, 105, 180, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ fontSize: '24px' }}>💝</div>
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
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 44, 44, 0.9), rgba(58, 34, 34, 0.9))',
                  color: '#ffccd5',
                  border: '2px solid rgba(255, 182, 193, 0.5)',
                  borderRadius: '25px',
                  padding: '18px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ fontSize: '24px' }}>💔</div>
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
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'transparent',
                  color: '#FF69B4',
                  border: '2px dashed rgba(255, 182, 193, 0.6)',
                  borderRadius: '25px',
                  padding: '15px 30px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
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
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '11px',
          fontStyle: 'italic'
        }}
      >
        ✦ Emotional soundtrack plays softly in the background ✦
      </div>
    </motion.div>
  );
};

// --- OPTIMIZED ANIMATION VARIANTS ---
const landingContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// --- SUB-COMPONENTS ---

const BackgroundVideo = ({ src, brightness = "brightness-[0.6]", blur = false }: BackgroundVideoProps) => (
  <div className={`fixed inset-0 z-[0] w-screen h-screen ${blur ? "blur-md scale-105" : ""}`}>
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata" // Changed from auto to metadata
      className={`absolute top-0 left-0 w-screen h-screen min-w-full min-h-full object-cover ${brightness}`}
      style={{
        width: '100vw',
        height: '100vh',
        transform: 'translate3d(0, 0, 0)' // Hardware acceleration
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/20" />
  </div>
);

const BackgroundAudio = ({
  src,
  volume = 0.5,
  isPlaying = true
}: {
  src: string;
  volume?: number;
  isPlaying?: boolean;
}) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

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
// In Atmosphere component
const Atmosphere = ({ seed = 0 }: { seed?: number }) => {
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const particleCount = isMobile ? 2 : 4;
  const petalCount = isMobile ? 3 : 5;

  const bokeh = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({  // Reduced from 6 to 4
        key: `b-${seed}-${i}`,
        left: `${(i * 20 + seed * 7) % 100}%`,
        top: `${(i * 25 + seed * 11) % 80}%`,
        size: 20 + ((i * 9) % 20), // Reduced max size
        delay: (i * 0.8) % 2.5,
        dur: 8 + (i % 3) * 1.8, // Reduced duration
      })),
    [seed]
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({  // Reduced from 8 to 5
        key: `p-${seed}-${i}`,
        left: `${(i * 20 + seed * 13) % 100}%`,
        delay: (i * 0.6) % 2.5,
        dur: 10 + (i % 4) * 1.5,
        size: 6 + ((i * 3) % 4),
        drift: -20 + ((i * 17) % 40), // Reduced drift
      })),
    [seed]
  );

  return (
    <div className="particles atmosphere" aria-hidden="true">
      {bokeh.map((b) => (
        <span
          key={b.key}
          className="bokeh"
          style={{
            left: b.left,
            top: b.top,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            // Add will-change for better performance
            willChange: 'transform, opacity'
          }}
        />
      ))}
      {petals.map((p) => (
        <span
          key={p.key}
          className="petal"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ['--petal-drift' as any]: `${p.drift}px`,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

const RegistryItem = ({
  icon: Icon,
  title,
  label,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  label: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className="registry-item"
  >
    <div className="registry-icon">
      <Icon size={18} className="text-[#ff6b93]" />
    </div>
    <div>
      <div className="registry-kicker">{title}</div>
      <div className="registry-label">{label}</div>
      <div className="registry-desc">{description}</div>
    </div>
  </motion.div>
);

const WaxSealButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{
      scale: 1.05,
      boxShadow: "0 0 25px rgba(255, 105, 180, 0.4)"
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    className="wax-button"
    aria-label="Enter through the gates"
  >
    <div className="wax-layer" />
    <div className="wax-ring" />
    <div className="wax-ring-inner" />
    <div className="wax-icon">
      <Key size={34} strokeWidth={1.5} />
    </div>
  </motion.button>
);

const TiltCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const rX = useSpring(rotateX, { stiffness: 300, damping: 25, mass: 0.3 });
  const rY = useSpring(rotateY, { stiffness: 300, damping: 25, mass: 0.3 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const max = 6;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set(-(py - 0.5) * max * 2);
  }, []);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, []);

  return (
    <motion.div
      className={className}
      style={{
        rotateX: rX,
        rotateY: rY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

const LandingStage = ({
  isOpening,
  onBegin
}: {
  isOpening: boolean;
  onBegin: () => void;
}) => (
  <motion.div
    key="landing"
    className="landing-stage"
  >
    <div className="landing-bg">
      <BackgroundVideo src="/videos/landing.mp4" />
    </div>
    <div className="landing-vignette bg-gradient-radial" />
    <div className="landing-veil" />
    <Atmosphere seed={1} />

    {!isOpening && (
      <>
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          className="landing-titleWrap"
        >
          <div className="landing-title">The Château Vow</div>
          <div className="landing-subtitle">~ Our Promise in the Garden of Focus ~</div>
        </motion.div>

        <motion.aside
          variants={landingContentVariants}
          initial="initial"
          animate="animate"
          className="registry-panel"
        >
          <div className="registry-panel-inner">
            <div className="registry-title">Royal Registry</div>
            <div className="registry-divider" />
            <RegistryItem
              icon={Hourglass}
              title="Requirement I"
              label="Select Your Sacred Time"
              description="A commitment to deep silence. Choose how long you will remain within the sanctuary."
            />
            <RegistryItem
              icon={User}
              title="Requirement II"
              label="Invite Your Companion"
              description="Every journey needs a witness. Select the guardian who will stand by you at the altar of focus."
            />
            <RegistryItem
              icon={Key}
              title="Requirement III"
              label="Seal the Gates"
              description="Once you begin, the world outside fades. Stay true to your vow until the ceremony concludes."
            />
          </div>
        </motion.aside>

        <motion.div
          variants={landingContentVariants}
          initial="initial"
          animate="animate"
          className="landing-content"
        >
          <div className="landing-card">
            <p className="landing-proclamation">
              Your presence is requested for a ceremony of focus. Please review the Registry of Vows before stepping through the gates.
            </p>

            <WaxSealButton onClick={onBegin} />

            <p className="landing-subhint landing-subhint--pulse">Tap to Enter</p>
          </div>
        </motion.div>
      </>
    )}
  </motion.div>
);

const VideoTransitionStage = ({ onEnded }: { onEnded: () => void }) => (
  <motion.div
    key="video"
    variants={fadeVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 w-screen h-screen"
    onClick={onEnded}
  >
    <video
      autoPlay
      muted
      preload="auto"
      className="absolute top-0 left-0 w-full h-full min-w-full min-h-full object-cover"
      onEnded={onEnded}
      onError={onEnded}
    >
      <source src="/videos/landing.mp4" type="video/mp4" />
    </video>
    <div
      className="fixed inset-0"
      style={{
        pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
      }}
    />
    <div
      className="fixed left-0 right-0 bottom-8"
      style={{
        zIndex: 2,
        textAlign: "center",
        color: "rgba(255,255,255,0.85)",
        fontFamily: 'Georgia, "Times New Roman", serif',
        letterSpacing: "0.22em",
        fontSize: 12,
        textTransform: "uppercase",
        pointerEvents: "none",
        textShadow: "0 2px 10px rgba(0,0,0,0.85)",
      }}
    >
      Tap to continue
    </div>
  </motion.div>
);

const StatRow = ({ label, value }: { label: string, value: number }) => (
  <div className="stat-container">
    <span className="stat-label">{label}</span>
    <div className="stat-bar-outer">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          delay: 0.2,
          duration: 0.8,
          ease: "easeOut"
        }}
        className="stat-bar-inner"
      />
    </div>
  </div>
);

interface CharacterCardProps {
  companion: Companion;
  isSelected: boolean;
  onSelect: () => void;
  onSecretDialogue: (dialogue: string) => void;
  isDimmed: boolean;
  isPanelOpen: boolean;
  clickCount: number;
}

const CharacterCard = React.memo(({
  companion,
  isSelected,
  onSelect,
  onSecretDialogue,
  isDimmed,
  isPanelOpen,
  clickCount
}: CharacterCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Use a ref to track clicks without causing re-renders
  const clickRef = useRef(0);

  // Memoize the hearts array to prevent re-creation on every render
  const hearts = useMemo(() =>
    Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isFilled: index < companion.vibeHearts
    })),
    [companion.vibeHearts]
  );

  // Handle click with optimized performance
  const handleClick = useCallback(() => {
    if (isPanelOpen && !isSelected) return;

    onSelect();
    clickRef.current += 1;

    if (clickRef.current >= 3 && !showSecret) {
      setShowSecret(true);
      onSecretDialogue(companion.secretDialogue);

      // Clear secret dialogue after delay
      const timer = setTimeout(() => {
        setShowSecret(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPanelOpen, isSelected, onSelect, onSecretDialogue, companion.secretDialogue, showSecret]);

  // Memoize hover handlers
  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

  // Memoize the image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/fallback-character.png";
  }, []);

  // Memoize animation variants for better performance
  const heartAnimation = useMemo(() => ({
    scale: isHovered ? [1, 1.2, 1] : 1,
    y: isHovered ? [0, -3, 0] : 0
  }), [isHovered]);

  const selectedAnimation = useMemo(() => ({
    scale: isSelected ? 1.03 : 1,
    y: isSelected ? -3 : 0
  }), [isSelected]);

  const secretVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 10 }
  }), []);

  const speechVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9, y: 5 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 5 }
  }), []);

  const badgeVariants = useMemo(() => ({
    hidden: { scale: 0 },
    visible: { scale: 1 }
  }), []);

  // Determine if component is interactive
  const isInteractive = !(isPanelOpen && !isSelected);
  const cursorStyle = isInteractive ? 'pointer' : 'not-allowed';

  return (
    <motion.div
      layout
      layoutId={`card-${companion.id}`}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5
      }}
      className={`carousel-item ${isDimmed ? 'invitation-card--dim' : ''}`}
      style={{ cursor: cursorStyle }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      <TiltCard
        className={`invitation-card ${isSelected ? 'invitation-card--selected' : ''} ${isPanelOpen && isSelected ? 'panel-open' : ''}`}
      >
        <button
          className="invitation-hit"
          onClick={handleClick}
          disabled={!isInteractive}
          aria-label={`Select ${companion.name}`}
          aria-pressed={isSelected}
        >
          {/* ANIMATED HEARTS */}
          <div className="vibe-hearts-container">
            {hearts.map((heart, index) => (
              <motion.div
                key={heart.id}
                className={`heart-icon ${heart.isFilled ? 'heart-filled' : 'heart-empty'}`}
                animate={heart.isFilled ? heartAnimation : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1
                }}
              >
                ❤
                {/* Sparkle effect only for filled hearts on hover */}
                {isHovered && heart.isFilled && (
                  <motion.div
                    className="heart-sparkle"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* SECRET DIALOGUE */}
          <AnimatePresence mode="wait">
            {showSecret && (
              <motion.div
                variants={secretVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="secret-dialogue"
              >
                <div className="secret-text">{companion.secretDialogue}</div>
                <div className="secret-arrow">▼</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHARACTER IMAGE */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              animate={selectedAnimation}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              className={`invitation-image ${isSelected ? 'invitation-image--selected' : ''}`}
            >
              <img
                src={companion.imageUrl}
                alt={`Character portrait of ${companion.name}`}
                className="w-full h-48 object-contain"
                loading="lazy"
                width={192}
                height={192}
                onError={handleImageError}
                decoding="async"
              />
            </motion.div>

            {/* SPEECH BUBBLE */}
            <AnimatePresence>
              {(isSelected || isPanelOpen) && (
                <motion.div
                  variants={speechVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="speech-bubble"
                  transition={{ duration: 0.2 }}
                >
                  {companion.dialogue}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CHARACTER INFO */}
          <div className="invitation-meta">
            <div className="invitation-name" title={companion.name}>
              {companion.name}
            </div>
            <div className="invitation-epithet" title={companion.epithet}>
              {companion.epithet}
            </div>
          </div>

          {/* SELECTION BADGE */}
          {isSelected && (
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25
              }}
              className="wax-badge"
              aria-hidden="true"
            >
              <div className="wax-badge__layer" />
              <div className="wax-badge__ring" />
            </motion.div>
          )}
        </button>
      </TiltCard>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.companion.id === nextProps.companion.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDimmed === nextProps.isDimmed &&
    prevProps.isPanelOpen === nextProps.isPanelOpen &&
    prevProps.clickCount === nextProps.clickCount &&
    // Also compare companion properties that affect rendering
    prevProps.companion.vibeHearts === nextProps.companion.vibeHearts &&
    prevProps.companion.dialogue === nextProps.companion.dialogue &&
    prevProps.companion.secretDialogue === nextProps.companion.secretDialogue &&
    prevProps.companion.imageUrl === nextProps.companion.imageUrl
  );
});

CharacterCard.displayName = 'CharacterCard';

const CharacterCutIn = ({ character, onComplete }: {
  character: Companion | null;
  onComplete: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="character-cutin"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe6eb 100%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
      onAnimationComplete={onComplete}
    >
      {/* Background Sakura Petals */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              x: Math.random() * 200 - 100,
              rotate: 360,
              opacity: [0, 0.7, 0.2, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              background: 'linear-gradient(135deg, #ffb6c1, #ff6b93)',
              borderRadius: '50% 10% 50% 30%',
              filter: 'blur(0.5px)',
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Pink Glow Effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.5 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%'
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Character Portrait with Ring Effect */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          style={{
            position: 'relative',
            width: '220px',
            height: '220px'
          }}
        >
          {/* Expanding Rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                inset: 0,
                border: '3px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '50%',
                borderTopColor: '#ff6b93',
                borderRightColor: '#ffb6c1'
              }}
            />
          ))}

          {/* Character Image */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid rgba(255, 255, 255, 0.9)',
              boxShadow: `
                0 0 60px rgba(255, 105, 180, 0.5),
                0 0 100px rgba(255, 182, 193, 0.3),
                inset 0 0 40px rgba(255, 255, 255, 0.4)
              `,
              background: 'linear-gradient(135deg, #ffccd5, #ffb6c1)'
            }}
          >
            <img
              src={character?.imageUrl}
              alt={character?.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(1.1) saturate(1.2)',
                mixBlendMode: 'multiply'
              }}
            />
          </div>

          {/* Sparkle Effects */}
          {[0, 90, 180, 270].map((angle, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: angle + 360
              }}
              transition={{
                duration: 1.5,
                delay: 0.5 + index * 0.1,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                background: 'linear-gradient(135deg, #ffb6c1, #ff6b93)',
                borderRadius: '50%',
                filter: 'blur(1px)',
                transform: `rotate(${angle}deg) translateX(130px)`,
                boxShadow: '0 0 15px rgba(255, 107, 147, 0.8)'
              }}
            />
          ))}
        </motion.div>

        {/* Vow Sealed Text */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <motion.div
            initial={{ letterSpacing: '0.1em' }}
            animate={{
              letterSpacing: ['0.1em', '0.5em', '0.1em'],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: '28px',
              color: '#ff6b93',
              fontWeight: 'bold',
              textShadow: '0 2px 10px rgba(255, 182, 193, 0.5)',
              textAlign: 'center',
              letterSpacing: '0.5em'
            }}
          >
            ✦ VOW SEALED ✦
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: '18px',
              color: '#4a2c3a',
              opacity: 0.8,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '10px 25px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 182, 193, 0.3)',
              boxShadow: '0 10px 30px rgba(255, 182, 193, 0.2)'
            }}
          >
            With {character?.name}
          </motion.div>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px'
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{
                width: '10px',
                height: '10px',
                background: '#ff6b93',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(255, 107, 147, 0.5)'
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Silhouette Effect (Optional) */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{
          x: ['100%', '0%', '-100%'],
          opacity: [0, 0.3, 0]
        }}
        transition={{
          duration: 0.6,
          times: [0, 0.5, 1]
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right, 
            transparent 0%, 
            rgba(255, 182, 193, 0.2) 50%, 
            transparent 100%)`,
          filter: 'blur(10px)'
        }}
      />
    </motion.div>
  );
};

const NameEntryStage = ({
  onNameSubmitted
}: {
  onNameSubmitted: (name: string) => void;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNameSubmitted(inputValue.trim());
    }
  };

  return (
    <motion.div
      key="name-entry"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="name-entry-stage"
    >
      <BackgroundVideo src="/videos/landing.mp4" brightness="brightness-[0.7]" />
      <div className="name-entry-overlay" />
      <Atmosphere seed={2} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="name-entry-container"
      >
        <div className="name-entry-title">
          ✦ To Whom Shall The Vow Be Dedicated? ✦
        </div>

        <form onSubmit={handleSubmit} className="name-entry-form">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your name, wanderer..."
              className={`name-input ${isFocused ? 'name-input--focused' : ''}`}
              maxLength={20}
              autoFocus
            />
            <div className={`name-input-glow ${isFocused ? 'name-input-glow--active' : ''}`} />
            <div className="name-input-underline" />
          </div>

          <motion.button
            type="submit"
            className="name-submit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputValue.trim()}
          >
            <span className="name-submit-text">Enter The Garden</span>
            <span className="name-submit-arrow">→</span>
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="name-entry-hint"
        >
          Your name will be remembered throughout this ceremony
        </motion.div>
      </motion.div>

      {/* Sakura petals falling specifically */}
      <div className="name-entry-petals">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="sakura-petal"
            initial={{ y: -50, x: Math.random() * 100, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              x: Math.random() * 100 - 50 + (i % 3) * 50,
              opacity: [0, 1, 1, 0],
              rotate: 360
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

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

  // Dialogue sequences for different states
  const generalDialogues = [
    "Who will be your companion in this journey of focus?",
    "Each guardian has a unique vow to offer...",
    "Click on a character to hear their promise.",
    "Choose wisely, for this bond will guide your focus."
  ];

  // Get dialogue based on current state
  const getCurrentDialogue = useCallback(() => {
    if (selectedCharacter && selected) {
      return selected.dialogue;
    }
    if (hoveredCharacter) {
      const character = COMPANIONS.find(c => c.id === hoveredCharacter);
      return `${character?.name}: "${character?.epithet}"`;
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
        // Cycle through different dialogues
        const dialogues = [
          character.dialogue,
          character.focusPower,
          `My vow to you: ${character.dialogue}`
        ];
        setDialogueText(dialogues[clickCount % dialogues.length]);
      }
      setIsTyping(true);
    } else {
      // New character selected
      onSelect(id);
      setDialogueText(character.dialogue);
      setIsTyping(true);
    }
  }, [selectedCharacter, characterClickCounts, onSelect, onSecretDialogue]);

  // Handle character hover
  const handleCharacterHover = useCallback((id: number | null) => {
    setHoveredCharacter(id);
    if (id && selectedCharacter !== id) {
      const character = COMPANIONS.find(c => c.id === id);
      if (character) {
        setDialogueText(`${character.name} - ${character.epithet}`);
        setIsTyping(true);
      }
    }
  }, [selectedCharacter]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    onSelect(null);
    setDialogueText("Selection cleared. Who calls to your heart?");
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
        fontFamily: "'Noto Sans JP', 'Segoe UI', sans-serif"
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

      {/* GALGAME DIALOGUE BOX - ON TOP */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="galgame-dialogue-overlay"
        onClick={advanceDialogue}
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, 95vw)',
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
              letterSpacing: '1px'
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
          {/* Character name or narrator */}
          <div style={{
            color: selectedCharacter ? '#FF1493' : '#FF69B4',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: selectedCharacter ? '#FF1493' : '#FF69B4',
              animation: 'pulse 2s infinite'
            }} />
            {selectedCharacter ? selected?.name.toUpperCase() : 'NARRATOR'}
          </div>

          {/* Dialogue text */}
          <div style={{
            color: '#4A2C3A',
            fontSize: '20px',
            lineHeight: '1.6',
            fontFamily: "'Noto Sans JP', sans-serif",
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
                gap: '8px'
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

      {/* CHARACTER CARDS - BELOW DIALOGUE - BIGGER SPACING */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="character-cards-container"
        style={{
          position: 'absolute',
          top: '240px', // Moved up slightly to make room for bigger spacing
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '40px', // INCREASED from 25px to 40px
          padding: '0 50px', // INCREASED from 0 40px to 0 50px
          flexWrap: 'wrap',
          zIndex: 30
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
              width: '200px', // INCREASED from 180px to 200px (wider spacing)
              height: '350px', // INCREASED from 320px to 350px (taller spacing)
              background: selectedCharacter === companion.id
                ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 252, 0.98))'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 245, 247, 0.95))',
              borderRadius: '20px',
              padding: '25px', // INCREASED from 20px to 25px (more internal padding)
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
            {/* Background glow effect - bigger for larger card */}
            {selectedCharacter === companion.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="selection-glow"
                style={{
                  position: 'absolute',
                  inset: '-25px', // INCREASED from -20px to -25px
                  background: 'radial-gradient(circle at 50% 0%, rgba(255, 105, 180, 0.15), transparent 70%)',
                  zIndex: -1,
                  filter: 'blur(30px)' // INCREASED from 25px to 30px
                }}
              />
            )}

            {/* Character image with galgame-style frame - SAME SIZE */}
            <div style={{
              width: '140px', // KEPT SAME SIZE
              height: '140px', // KEPT SAME SIZE
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '25px', // INCREASED from 20px to 25px
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

            {/* Character info - SAME TEXT SIZES */}
            <div style={{
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%'
            }}>
              <h3 style={{
                fontSize: '22px', // KEPT SAME SIZE
                color: selectedCharacter === companion.id ? '#FF1493' : '#FF69B4',
                marginBottom: '10px', // INCREASED from 8px to 10px
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}>
                {companion.name}
              </h3>

              <div style={{
                fontSize: '12px', // KEPT SAME SIZE
                color: selectedCharacter === companion.id ? '#FF69B4' : '#FFB6C1',
                background: 'linear-gradient(135deg, rgba(255, 250, 252, 0.9), rgba(255, 240, 245, 0.9))',
                padding: '6px 14px', // INCREASED from 5px 12px
                borderRadius: '15px',
                marginBottom: '18px', // INCREASED from 15px to 18px
                letterSpacing: '1px',
                border: '1px solid rgba(255, 182, 193, 0.3)',
                fontStyle: 'italic'
              }}>
                {companion.epithet}
              </div>

              <div style={{
                fontSize: '11px', // KEPT SAME SIZE
                color: '#A05252',
                lineHeight: '1.4',
                marginBottom: '18px', // INCREASED from 15px to 18px
                fontStyle: 'italic',
                height: '45px', // INCREASED from 40px to 45px
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                padding: '0 5px'
              }}>
                {companion.focusPower}
              </div>

              {/* Hearts indicator - SAME SIZE */}
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
                      fontSize: '18px', // KEPT SAME SIZE
                      filter: selectedCharacter === companion.id ? 'drop-shadow(0 0 5px rgba(255, 105, 180, 0.4))' : 'none'
                    }}
                  >
                    ♡
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selection indicator - SAME SIZE */}
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
                boxShadow: 'inset 0 0 30px rgba(255, 182, 193, 0.1)' // Increased glow
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons - adjusted position for bigger cards */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="selection-actions"
        style={{
          position: 'absolute',
          bottom: '60px', // INCREASED from 50px to 60px
          left: 0,
          right: 0,
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
              boxShadow: '0 10px 30px rgba(255, 182, 193, 0.25)'
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
            overflow: 'hidden'
          }}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>
            {selectedCharacter ? (
              <>
                Seal Vow with <span style={{ color: '#FFD1DC' }}>{selected?.name}</span>
              </>
            ) : (
              'Select a Companion'
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
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false); // Add this state

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

// --- TIMER STAGE ---
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
  const videoRef = useRef<HTMLVideoElement>(null);
  // In TimerStage
  const [deferredTimeLeft, setDeferredTimeLeft] = useState(timeLeft);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredTimeLeft(timeLeft);
    }, 100); // 100ms delay for less critical updates

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const selected = useMemo(
    () => COMPANIONS.find((c) => c.id === selectedCharacter) ?? null,
    [selectedCharacter]
  );

  const progress = ((selectedTime * 60 - timeLeft) / (selectedTime * 60)) * 100;

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

  // Timer logic
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
  // In TimerStage gaze effect
  useEffect(() => {
    if (!videoRef.current || isBreakMode || showCompletionPage) return;

    let animationFrameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 1000; // Update every second instead of continuously

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

  // Replace the Zen mode useEffect with a throttled version
  useEffect(() => {
    if (showCompletionPage) return;

    let timeoutId: number;

    const handleInteraction = () => {
      setLastInteraction(Date.now());
      setIsZenMode(false);

      // Clear any pending timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set new timeout with debouncing
      timeoutId = window.setTimeout(() => {
        if (Date.now() - lastInteraction > 10000 && !isCompleted && !isBreakMode) {
          setIsZenMode(true);
        }
      }, 1000);
    };

    // Throttle mousemove events
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

  // Add throttle utility
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

    // Show distraction dialogue
    showCharacterDialogue("distraction");
  };

  const handleStartBreak = () => {
    if (showCompletionPage) return;
    setIsBreakMode(true);
    setIsActive(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      key="timer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="timer-stage"
    >
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
              {/* Tea Ceremony Button - Minimal Sakura */}
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
                {/* Sakura pattern background */}
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

              {/* End Vow Button - Minimal Sakura */}
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
                {/* Falling sakura animation */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`minimal-petal-${i}`}
                      initial={{ y: -10, x: i * 25, opacity: 0 }}
                      animate={{ y: 50, opacity: [0, 1, 0] }}
                      transition={{ duration: 3, delay: i * 0.6, repeat: Infinity }}
                      style={{
                        position: 'absolute',
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                        borderRadius: '50% 0 50% 50%',
                        filter: 'blur(0.5px)',
                        transform: `rotate(${i * 72}deg)`
                      }}
                    />
                  ))}
                </div>

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
            onConfirmEnd={() => {
              setShowEndConfirmation(false);
              onEndVow();
            }}
            onCancel={() => {
              setShowEndConfirmation(false);
              // Play relieved sound
              const reliefSound = new Audio('/audio/relief.mp3');
              reliefSound.volume = 0.3;
              reliefSound.play().catch(console.error);
            }}
            onContinueVow={() => {
              setShowEndConfirmation(false);
              // Play happy sound
              const happySound = new Audio('/audio/happy.mp3');
              happySound.volume = 0.3;
              happySound.play().catch(console.error);
              // Show encouragement dialogue
              showCharacterDialogue("middle");
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>



  );
};


export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [stage, setStage] = useState<AppStage>('landing');
  const [isOpening, setIsOpening] = useState(false);
  const [playerName, setPlayerName] = useState<string>('Stranger');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [isDiscordReady, setIsDiscordReady] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [showCutIn, setShowCutIn] = useState(false);
  const [characterClickCounts, setCharacterClickCounts] = useState<Record<number, number>>({});
  const [secretDialogue, setSecretDialogue] = useState<string | null>(null);

  // Handle name submission
  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    setStage('selection');
  }, []);

  // Track character clicks for secret dialogue
  const handleCharacterClick = useCallback((id: number) => {
    setCharacterClickCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  }, []);

  // Show secret dialogue
  const handleSecretDialogue = useCallback((dialogue: string) => {
    setSecretDialogue(dialogue);
    setTimeout(() => setSecretDialogue(null), 3000);
  }, []);

  // Update vow setup to include cut-in
  const handleConfirmSelection = useCallback(() => {
    if (selectedCharacter) {
      setShowCutIn(true);
      setTimeout(() => {
        setShowCutIn(false);
        setStage('vow_setup');
      }, 1500);
    }
  }, [selectedCharacter]);

  const handleConfirmVow = useCallback(() => {
    if (selectedCharacter && selectedTime) {
      setIsSealing(true);

      const sealSound = new Audio('/audio/seal.mp3');
      sealSound.volume = 0.3;
      sealSound.play().catch(console.error);

      // Remove the old body transform animations that cause greyish effect
      // and use a cleaner pink transition
      setTimeout(() => {
        setIsSealing(false);
        // Brief pause before timer starts
        setTimeout(() => {
          setStage('timer');
        }, 300);
      }, 1200); // Match animation duration
    }
  }, [selectedCharacter, selectedTime]);


  const shouldPlayAudio = stage !== 'landing' && stage !== 'name_entry';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initializeDiscord = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const frameId = urlParams.get('frame_id');
      const instanceId = urlParams.get('instance_id');

      if (frameId || instanceId || window.location.hostname.includes('discord')) {
        try {
          const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
          await discordSdk.ready();
          console.log('✅ Discord SDK initialized successfully');
          setIsDiscordReady(true);
        } catch (error) {
          console.warn('⚠️ Discord SDK initialization failed:', error);
        }
      } else {
        console.log('ℹ️ Running in standalone mode (not in Discord)');
      }
    };

    initializeDiscord();
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black text-[#fffff0] font-serif">
      <BackgroundAudio
        src="/audio/landing.mp3"
        volume={0.4}
        isPlaying={shouldPlayAudio}
      />

      <AnimatePresence>
        {isSealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="seal-overlay"
          >
            <div className="white-flash" />
            <div className="petal-burst">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="petal"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    rotate: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    opacity: 0,
                    rotate: 360
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECRET DIALOGUE OVERLAY */}
      <AnimatePresence>
        {secretDialogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="secret-dialogue-global"
          >
            <div className="secret-bubble">{secretDialogue}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHARACTER CUT-IN */}
      <AnimatePresence>
        {showCutIn && selectedCharacter && (
          <CharacterCutIn
            character={COMPANIONS.find(c => c.id === selectedCharacter) || null}
            onComplete={() => setShowCutIn(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === 'landing' && (
          <LandingStage
            isOpening={isOpening}
            onBegin={() => setStage('name_entry')}
          />
        )}

        {stage === 'name_entry' && (
          <NameEntryStage onNameSubmitted={handleNameSubmit} />
        )}

        {stage === 'selection' && (
          <SelectionStage
            selectedCharacter={selectedCharacter}
            onSelect={(id) => {
              if (id) handleCharacterClick(id);
              setSelectedCharacter(id);
            }}
            onConfirm={handleConfirmSelection}
            characterClickCounts={characterClickCounts}
            onSecretDialogue={handleSecretDialogue}
          />
        )}

        {stage === 'vow_setup' && selectedCharacter && (
          <VowSetupStage
            selectedCharacter={selectedCharacter}
            selectedTime={selectedTime}
            playerName={playerName}
            onSelectTime={setSelectedTime}
            onConfirmVow={handleConfirmVow}
            onGoBack={() => {
              // Clear the selected time and go back to selection
              setSelectedTime(null);
              setStage('selection');
            }}
          />
        )}

        {stage === 'timer' && selectedCharacter && selectedTime && (
          <TimerStage
            selectedCharacter={selectedCharacter}
            selectedTime={selectedTime}
            playerName={playerName}
            onEndVow={() => {
              setStage('selection');
              setSelectedTime(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}