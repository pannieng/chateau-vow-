import React from 'react';
import { motion } from 'framer-motion';
import type { TimerDialogueProps } from '../types';

const TimerDialogueComponent = React.memo(({ dialogue, onHoverCharacter, isMobile = false }: TimerDialogueProps) => {
  return (
    <motion.div
      key={dialogue.text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: dialogue.shouldShow ? 1 : 0, y: dialogue.shouldShow ? 0 : 20 }}
      exit={{ opacity: 0 }}
      className="live-dialogue-container"
      onClick={onHoverCharacter}
      style={{
        position: 'absolute',
        top: isMobile ? '60px' : '140px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: isMobile ? '90vw' : 'min(400px, 90%)'
      }}
    >
      <div className={`speech-bubble-timer dialogue-state-${dialogue.stage}`} style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: isMobile ? '12px 16px' : '18px 24px',
        border: '2px solid rgba(255, 182, 193, 0.4)',
        boxShadow: '0 15px 40px rgba(255, 182, 193, 0.3)',
        position: 'relative',
        marginBottom: '12px'
      }}>
        <div className="dialogue-character-name" style={{
          color: '#ff6b93',
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: '700',
          letterSpacing: '2px',
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>WITNESS</div>
        <div className="dialogue-text" style={{
          color: '#4a2c3a',
          fontSize: isMobile ? '12px' : '14px',
          lineHeight: '1.5',
          fontStyle: 'italic',
          fontFamily: "'Georgia', serif"
        }}>"{dialogue.text}"</div>
      </div>
      <div className="dialogue-hint" style={{
        position: 'absolute',
        bottom: isMobile ? '-35px' : '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(74, 44, 58, 0.6)',
        fontSize: isMobile ? '10px' : '11px',
        fontStyle: 'italic',
        textAlign: 'center',
        width: '100%',
        opacity: 0.7
      }}>Click character to trigger special dialogue</div>
    </motion.div>
  );
});


TimerDialogueComponent.displayName = 'TimerDialogueComponent';

export default TimerDialogueComponent;