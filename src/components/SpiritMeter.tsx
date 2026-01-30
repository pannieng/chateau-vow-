import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SpiritMeterProps } from '../types';

const SpiritMeter = React.memo(({ progress, isCompleted, isMobile = false }: SpiritMeterProps) => {
  const [flowerProgress, setFlowerProgress] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setFlowerProgress(100);
    } else {
      setFlowerProgress(progress);
    }
  }, [progress, isCompleted]);

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="spirit-meter-container-mobile"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '60px',
          height: '180px',
          zIndex: 20
        }}
      >
        <div className="sakura-branch-mobile" style={{
          position: 'relative',
          width: '3px',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(74, 44, 58, 0.8), rgba(255, 182, 193, 0.6))',
          margin: '0 auto',
          borderRadius: '2px'
        }}>
          {/* Leaves */}
          {[20, 40, 60, 80].map((position) => (
            <motion.div
              key={position}
              className="branch-leaves"
              style={{ 
                position: 'absolute',
                top: `${position}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '5px',
                background: 'linear-gradient(to right, rgba(120, 180, 120, 0.8), rgba(160, 200, 140, 0.8))',
                borderRadius: '3px'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: position * 0.01 }}
            />
          ))}

          {/* Flower Bud */}
          <motion.div
            className={`flower-bud ${flowerProgress > 80 || isCompleted ? 'blooming' : ''}`}
            style={{
              position: 'absolute',
              top: `${100 - flowerProgress}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '14px',
              height: '14px',
              background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.9), rgba(255, 107, 147, 0.8))',
              borderRadius: '50% 50% 50% 0',
              boxShadow: '0 2px 8px rgba(255, 107, 147, 0.4)',
              transition: 'all 0.8s ease'
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
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.9), rgba(255, 255, 255, 0.8))',
                  borderRadius: '50% 0',
                  transformOrigin: 'center'
                }}
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
          className="spirit-progress-label-mobile"
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ff6b93',
            fontSize: '10px',
            fontFamily: "'Georgia', serif",
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
          animate={isCompleted ? {
            scale: [1, 1.1, 1]
          } : {}}
          transition={isCompleted ? {
            duration: 1,
            repeat: Infinity
          } : {}}
        >
          {isCompleted ? '🌸' : `${Math.round(flowerProgress)}%`}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="spirit-meter-container"
      style={{
        position: 'fixed',
        right: '40px',
        top: '120px',
        width: '120px',
        height: '400px',
        zIndex: 20
      }}
    >
      <div className="sakura-branch" style={{
        position: 'relative',
        width: '4px',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(74, 44, 58, 0.8), rgba(255, 182, 193, 0.6))',
        margin: '0 auto',
        borderRadius: '2px'
      }}>
        {/* Leaves */}
        {[20, 40, 60, 80].map((position) => (
          <motion.div
            key={position}
            className="branch-leaves"
            style={{ 
              position: 'absolute',
              top: `${position}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '8px',
              background: 'linear-gradient(to right, rgba(120, 180, 120, 0.8), rgba(160, 200, 140, 0.8))',
              borderRadius: '4px'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: position * 0.01 }}
          />
        ))}

        {/* Flower Bud */}
        <motion.div
          className={`flower-bud ${flowerProgress > 80 || isCompleted ? 'blooming' : ''}`}
          style={{
            position: 'absolute',
            top: `${100 - flowerProgress}%`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.9), rgba(255, 107, 147, 0.8))',
            borderRadius: '50% 50% 50% 0',
            boxShadow: '0 4px 16px rgba(255, 107, 147, 0.4)',
            transition: 'all 0.8s ease'
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
              style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.9), rgba(255, 255, 255, 0.8))',
                borderRadius: '50% 0',
                transformOrigin: 'center'
              }}
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
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#ff6b93',
          fontSize: '12px',
          fontFamily: "'Georgia', serif",
          textAlign: 'center'
        }}
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

export default SpiritMeter;