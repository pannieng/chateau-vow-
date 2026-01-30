import React from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';
import { useMagicSound } from '../hooks/useMagicSound';

interface WaxSealButtonProps {
  onClick: () => void;
  compact?: boolean;

}

const WaxSealButton = ({ onClick }: WaxSealButtonProps) => {
  const { playMagicSound } = useMagicSound();

  const handleClick = () => {
    playMagicSound();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
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
};

export default WaxSealButton;