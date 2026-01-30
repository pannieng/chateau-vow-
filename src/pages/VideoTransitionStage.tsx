import React from 'react';
import { motion } from 'framer-motion';
import '../App.css';
const fadeVariants = {
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

interface VideoTransitionStageProps {
  onEnded: () => void;
}

const VideoTransitionStage = ({ onEnded }: VideoTransitionStageProps) => (
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

export default VideoTransitionStage;