import React from 'react';
import { motion } from 'framer-motion';
import type { ImmersiveTimerProps } from '../types';

const ImmersiveTimer = React.memo(({ timeLeft, isImmersive, onToggleImmersive, isMobile = false }: ImmersiveTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="immersive-timer-container-mobile"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 25
        }}
      >
        <motion.button
          className="pocket-watch-mobile"
          onClick={onToggleImmersive}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            border: '2px solid rgba(255, 182, 193, 0.6)',
            boxShadow: '0 8px 32px rgba(255, 182, 193, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            className="pocket-watch-face-mobile"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: '18px',
              fontWeight: '300',
              color: '#4a2c3a',
              letterSpacing: '1px'
            }}
            animate={isImmersive ? { opacity: 0.3 } : { opacity: 1 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
        </motion.button>
      </motion.div>
    );
  }

  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="immersive-timer-container"
      style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 25
      }}
    >
      <motion.button
        className="pocket-watch"
        onClick={onToggleImmersive}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '50%',
          border: '2px solid rgba(255, 182, 193, 0.6)',
          boxShadow: '0 8px 32px rgba(255, 182, 193, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="roman-numerals" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          fontFamily: "'Times New Roman', serif",
          fontSize: '14px',
          color: 'rgba(74, 44, 58, 0.7)'
        }}>
          {romanNumerals.map((numeral, index) => (
            <span
              key={index}
              className="roman-numeral"
              style={{
                position: 'absolute',
                left: '50%',
                top: '10%',
                transform: `rotate(${index * 30}deg) translateY(-30px)`,
                transformOrigin: '40px 40px'
              }}
            >
              {numeral}
            </span>
          ))}
        </div>
        <motion.div
          className="pocket-watch-face"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: '24px',
            fontWeight: '300',
            color: '#4a2c3a',
            letterSpacing: '1px'
          }}
          animate={isImmersive ? { opacity: 0.3 } : { opacity: 1 }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </motion.button>
    </motion.div>
  );
});

ImmersiveTimer.displayName = 'ImmersiveTimer';

export default ImmersiveTimer;