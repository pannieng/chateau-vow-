import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, EyeOff } from 'lucide-react';

interface FloatingTimerNotificationProps {
  selectedCharacter: number;
  selectedTime: number;
  playerName: string;
  remainingTime: number; // in seconds
  isTimerRunning: boolean;
  onRestore: () => void;
  onMinimize: () => void;
}

const FloatingTimerNotification = ({
  selectedCharacter,
  selectedTime,
  playerName,
  remainingTime,
  isTimerRunning,
  onRestore,
  onMinimize
}: FloatingTimerNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragStart = React.useRef({ x: 0, y: 0 });

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  // Show notification after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle drag
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Keep within viewport bounds
    const boundedX = Math.max(10, Math.min(window.innerWidth - 300, newX));
    const boundedY = Math.max(10, Math.min(window.innerHeight - 150, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="floating-timer-notification"
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 999999,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleDragStart}
        >
          {/* Glowing border effect */}
          <div className="floating-timer-glow" />
          
          {/* Main container */}
          <div className="floating-timer-container">
            {/* Header with drag handle */}
            <div className="floating-timer-header">
              <div className="floating-timer-drag-handle">
                <Clock size={14} />
                <span className="floating-timer-title">Focus Timer</span>
                {!isTimerRunning && (
                  <span className="floating-timer-paused">⏸️ Paused</span>
                )}
              </div>
              
              <div className="floating-timer-controls">
                <button
                  onClick={onRestore}
                  className="floating-timer-btn floating-timer-btn-restore"
                  title="Restore full screen"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={onMinimize}
                  className="floating-timer-btn floating-timer-btn-close"
                  title="Minimize notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {/* Timer display */}
            <div className="floating-timer-display">
              <div className="floating-timer-time">
                {formatTime(minutes)}:{formatTime(seconds)}
              </div>
              <div className="floating-timer-progress">
                <div 
                  className="floating-timer-progress-bar"
                  style={{
                    width: `${((selectedTime * 60 - remainingTime) / (selectedTime * 60)) * 100}%`
                  }}
                />
              </div>
            </div>
            
            {/* Character info */}
            <div className="floating-timer-character">
              <div className="floating-timer-character-name">
                {playerName}'s Vow with Companion
              </div>
              <div className="floating-timer-character-desc">
                Focus session in progress
              </div>
            </div>
            
            {/* Quick action buttons */}
            <div className="floating-timer-actions">
              <button
                onClick={onRestore}
                className="floating-timer-action-btn floating-timer-action-primary"
              >
                Return to Focus
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingTimerNotification;