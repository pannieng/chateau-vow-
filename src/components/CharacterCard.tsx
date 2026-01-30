import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterCardProps } from '../types/index';
import TiltCard from '../components/TiltCard';

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
  const clickRef = useRef(0);

  const hearts = useMemo(() =>
    Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isFilled: index < companion.vibeHearts
    })),
    [companion.vibeHearts]
  );

  const handleClick = useCallback(() => {
    if (isPanelOpen && !isSelected) return;

    onSelect();
    clickRef.current += 1;

    if (clickRef.current >= 3 && !showSecret) {
      setShowSecret(true);
      onSecretDialogue(companion.secretDialogue);

      const timer = setTimeout(() => {
        setShowSecret(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPanelOpen, isSelected, onSelect, onSecretDialogue, companion.secretDialogue, showSecret]);

  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/fallback-character.png";
  }, []);

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
  return (
    prevProps.companion.id === nextProps.companion.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDimmed === nextProps.isDimmed &&
    prevProps.isPanelOpen === nextProps.isPanelOpen &&
    prevProps.clickCount === nextProps.clickCount &&
    prevProps.companion.vibeHearts === nextProps.companion.vibeHearts &&
    prevProps.companion.dialogue === nextProps.companion.dialogue &&
    prevProps.companion.secretDialogue === nextProps.companion.secretDialogue &&
    prevProps.companion.imageUrl === nextProps.companion.imageUrl
  );
});

CharacterCard.displayName = 'CharacterCard';

export default CharacterCard;