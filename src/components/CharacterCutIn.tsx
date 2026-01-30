import React from 'react';
import { motion } from 'framer-motion';
import type { Companion } from '../types';

interface CharacterCutInProps {
  character: Companion | null;
  onComplete: () => void;
}

const CharacterCutIn = ({ character, onComplete }: {
  character: Companion | null;
  onComplete: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
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

export default CharacterCutIn;