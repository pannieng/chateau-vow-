import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Hourglass, User, Key, ChevronDown, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import BackgroundVideo from '../components/BackgroundVideo';
import Atmosphere from '../components/Atmosphere';
import WaxSealButton from '../components/WaxSealButton';
import BackgroundAudio from '../components/BackgroundAudio';
import '../App.css';

// Animation variants
const landingContentVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const popupVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Breakpoint constants
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

// Registry data
const REGISTRY_ITEMS = [
  {
    icon: Hourglass,
    kicker: 'Requirement I',
    label: 'Select Your Sacred Time',
    desc: 'A commitment to deep silence. Choose how long you will remain within the sanctuary.'
  },
  {
    icon: User,
    kicker: 'Requirement II',
    label: 'Invite Your Companion',
    desc: 'Every journey needs a witness. Select the guardian who will stand by you at the altar of focus.'
  },
  {
    icon: Key,
    kicker: 'Requirement III',
    label: 'Seal the Gates',
    desc: 'Once you begin, the world outside fades. Stay true to your vow until the ceremony concludes.'
  }
];

interface LandingStageProps {
  isOpening: boolean;
  onBegin: () => void;
}

const LandingStage = ({ isOpening, onBegin }: LandingStageProps) => {
  // Responsive state
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [showRegistry, setShowRegistry] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.3);
  const [hasUserStartedAudio, setHasUserStartedAudio] = useState(false);

  // Determine device type with iPad detection
  const deviceType = useMemo(() => {
    const width = viewportWidth;
    const height = viewportHeight;
    const aspectRatio = width / height;
    
    // Enhanced iPad detection
    const detectIPad = () => {
      if (typeof navigator === 'undefined') return false;
      
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipod|ipad/.test(userAgent);
      const isMacLike = /macintosh/.test(userAgent);
      const hasTouch = 'ontouchend' in document;
      
      // Standard iPad detection
      if (isIOS && /ipad/.test(userAgent)) return true;
      
      // Detect iPads on macOS Safari
      if (isMacLike && hasTouch) return true;
      
      // Check screen characteristics (iPad has 4:3 aspect ratio)
      const is4by3 = Math.abs(aspectRatio - 4/3) < 0.2;
      const isIPadPro = Math.abs(aspectRatio - 4/3) < 0.15 && width >= 1024;
      
      // iPad typically has minimum width of 768px in portrait
      return (is4by3 || isIPadPro) && width >= 768;
    };
    
    const isIPad = detectIPad();
    
    if (isIPad) {
      // iPads always use desktop layout
      return 'desktop';
    }
    
    // Standard responsive detection for other devices
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }, [viewportWidth, viewportHeight]);

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Handle clicking anywhere to start audio
  const handleStartAudio = useCallback(() => {
    if (!hasUserStartedAudio) {
      setHasUserStartedAudio(true);
      setIsAudioPlaying(true);
      setIsMuted(false);
      setAudioVolume(0.3);
    }
  }, [hasUserStartedAudio]);

  // Handle speaker button click (mute/unmute toggle)
  const handleSpeakerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleStartAudio
    
    if (!hasUserStartedAudio) {
      // First time clicking speaker - start audio
      setHasUserStartedAudio(true);
      setIsAudioPlaying(true);
      setIsMuted(false);
      setAudioVolume(0.3);
    } else if (isAudioPlaying) {
      // Toggle mute if audio is playing
      if (isMuted) {
        // Unmute
        setAudioVolume(0.3);
        setIsMuted(false);
      } else {
        // Mute
        setAudioVolume(0);
        setIsMuted(true);
      }
    }
  }, [hasUserStartedAudio, isAudioPlaying, isMuted]);

  // Handle begin click with audio stop
  const handleBeginClick = useCallback(() => {
    // Stop audio before proceeding
    setIsAudioPlaying(false);
    // Small delay to ensure audio stops before navigation
    setTimeout(() => {
      onBegin();
    }, 100);
  }, [onBegin]);

  // Responsive handler with debouncing
  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setViewportWidth(window.innerWidth);
        setViewportHeight(window.innerHeight);
        
        // Auto-close mobile registry when switching to desktop (including iPad)
        if (window.innerWidth > BREAKPOINTS.MOBILE && showRegistry) {
          setShowRegistry(false);
        }
      }, 150);
    };

    // Initial check
    handleResize();

    // Listen to resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [showRegistry]);

  // Toggle registry with animation
  const toggleRegistry = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent triggering handleStartAudio
    }
    
    if (showRegistry) {
      setIsClosing(true);
      setTimeout(() => {
        setShowRegistry(false);
        setIsClosing(false);
      }, 300);
    } else {
      setShowRegistry(true);
    }
  }, [showRegistry]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleRegistry(e);
    }
  }, [toggleRegistry]);

  // Render desktop layout (used for desktop AND iPads)
  const renderDesktopLayout = () => (
    <>
      {/* Background Audio */}
      <BackgroundAudio 
        src="/audio/landing-ambience.mp3"
        volume={audioVolume}
        isPlaying={isAudioPlaying}
      />
      
      {/* Audio Control Button */}
      <motion.button
        className={`galgame-audio-control-btn ${isAudioPlaying && !isMuted ? 'audio-playing' : ''}`}
        onClick={handleSpeakerClick}
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.95, rotate: -2 }}
        initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.5, 
          duration: 0.5,
          rotate: { type: "spring", stiffness: 200, damping: 15 }
        }}
        aria-label={hasUserStartedAudio ? (isMuted ? "Click to unmute audio" : "Audio playing - click to mute") : "Click to play audio"}
      >
        {!hasUserStartedAudio ? (
          <Volume2 size={24} className="galgame-audio-icon" />
        ) : isMuted ? (
          <VolumeX size={24} className="galgame-audio-icon" />
        ) : (
          <Volume2 size={24} className="galgame-audio-icon" />
        )}
        
        {/* Visual indicator when audio is playing */}
        {hasUserStartedAudio && isAudioPlaying && !isMuted && (
          <div className="galgame-audio-indicator">
            <motion.span 
              className="galgame-audio-wave"
              animate={{ height: ['4px', '14px', '4px'] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.span 
              className="galgame-audio-wave"
              animate={{ height: ['4px', '18px', '4px'] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.span 
              className="galgame-audio-wave"
              animate={{ height: ['4px', '10px', '4px'] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        )}
      </motion.button>
      
      {/* Desktop Title with Galgame Style */}
      <motion.div
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        className="landing-titleWrap"
        onClick={handleStartAudio}
      >
        <div className="landing-title">
          The Château Vow
        </div>
        <div className="landing-subtitle">
          ~ Our Promise in the Garden of Focus ~
        </div>
        {!hasUserStartedAudio && (
          <div className="landing-audio-hint" style={{ marginTop: '10px' }}>
            🔊 Click anywhere to enable audio
          </div>
        )}
        {hasUserStartedAudio && isMuted && (
          <div className="landing-audio-hint" style={{ marginTop: '10px' }}>
            🔊 Audio muted - Click speaker to unmute
          </div>
        )}
      </motion.div>

      {/* Desktop Registry Sidebar */}
      <motion.aside
        variants={landingContentVariants}
        initial="initial"
        animate="animate"
        className="registry-panel"
        onClick={handleStartAudio}
      >
        <div className="registry-panel-inner">
          <div className="registry-title">Royal Registry</div>
          <div className="registry-divider" />
          {REGISTRY_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="registry-item" onClick={handleStartAudio}>
                <div className="registry-icon">
                  <Icon size={18} className="text-[#ff6b93]" />
                </div>
                <div className="registry-content">
                  <div className="registry-kicker">{item.kicker}</div>
                  <div className="registry-label">{item.label}</div>
                  <div className="registry-desc">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.aside>

      {/* Desktop Content Card */}
      <motion.div
        variants={landingContentVariants}
        initial="initial"
        animate="animate"
        className="landing-content"
        onClick={handleStartAudio}
      >
        <div className="landing-card">
          <p className="landing-proclamation">
            Your presence is requested for a ceremony of focus. 
            Please review the Registry of Vows before stepping through the gates.
          </p>

          <div onClick={handleStartAudio}>
            <WaxSealButton onClick={handleBeginClick} />
          </div>

          <p className="landing-subhint landing-subhint--pulse">
            Tap to Enter
          </p>
        </div>
      </motion.div>
    </>
  );

  // Render mobile/tablet layout (NOT used for iPads)
  const renderMobileTabletLayout = () => {
    const isTabletLayout = isTablet;
    
    return (
      <div className={`galgame-${deviceType}-container`} onClick={handleStartAudio}>
        {/* Background Audio */}
        <BackgroundAudio 
          src="/audio/landing-ambience.mp3"
          volume={audioVolume}
          isPlaying={isAudioPlaying}
        />
        
        {/* Audio Control Button */}
        <motion.button
          className={`galgame-audio-control-btn ${isAudioPlaying && !isMuted ? 'audio-playing' : ''}`}
          onClick={handleSpeakerClick}
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.95, rotate: -2 }}
          initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.5, 
            duration: 0.5,
            rotate: { type: "spring", stiffness: 200, damping: 15 }
          }}
          aria-label={hasUserStartedAudio ? (isMuted ? "Click to unmute audio" : "Audio playing - click to mute") : "Click to play audio"}
        >
          {!hasUserStartedAudio ? (
            <Volume2 size={isMobile ? 22 : 24} className="galgame-audio-icon" />
          ) : isMuted ? (
            <VolumeX size={isMobile ? 22 : 24} className="galgame-audio-icon" />
          ) : (
            <Volume2 size={isMobile ? 22 : 24} className="galgame-audio-icon" />
          )}
          
          {/* Visual indicator when audio is playing */}
          {hasUserStartedAudio && isAudioPlaying && !isMuted && (
            <div className="galgame-audio-indicator">
              <motion.span 
                className="galgame-audio-wave"
                animate={{ height: ['4px', '14px', '4px'] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.span 
                className="galgame-audio-wave"
                animate={{ height: ['4px', '18px', '4px'] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.span 
                className="galgame-audio-wave"
                animate={{ height: ['4px', '10px', '4px'] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
              />
            </div>
          )}
        </motion.button>
        
        {/* Title Section */}
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          className={`galgame-${deviceType}-title-section`}
          onClick={handleStartAudio}
        >
          <div className={`galgame-title galgame-${deviceType}-title`}>
            The Château Vow
          </div>
          <div className={`galgame-subtitle galgame-${deviceType}-subtitle`}>
            ~ Our Promise in the Garden of Focus ~
          </div>
          <div className="galgame-sparkles-container">
            <Sparkles size={isMobile ? 14 : 16} className="galgame-sparkle" />
            <Sparkles size={isMobile ? 18 : 20} className="galgame-sparkle" />
            <Sparkles size={isMobile ? 14 : 16} className="galgame-sparkle" />
          </div>
          {!hasUserStartedAudio && (
            <div className="landing-audio-hint" style={{ marginTop: '15px' }}>
              🔊 Click anywhere to enable audio
            </div>
          )}
          {hasUserStartedAudio && isMuted && (
            <div className="landing-audio-hint" style={{ marginTop: '15px' }}>
              🔊 Audio muted - Click speaker to unmute
            </div>
          )}
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          variants={landingContentVariants}
          initial="initial"
          animate="animate"
          className={`galgame-${deviceType}-card`}
          onClick={handleStartAudio}
        >
          {/* Decorative border corners */}
          <div className="galgame-decorative-border">
            <div className="galgame-border-corner galgame-border-corner--tl" />
            <div className="galgame-border-corner galgame-border-corner--tr" />
            <div className="galgame-border-corner galgame-border-corner--bl" />
            <div className="galgame-border-corner galgame-border-corner--br" />
          </div>

          <p className={`galgame-${deviceType}-proclamation`}>
            Your presence is requested for a ceremony of focus. 
            Please review the Registry of Vows before stepping through the gates.
          </p>

          <div className={`galgame-${deviceType}-wax-seal-container`} onClick={handleStartAudio}>
            <WaxSealButton onClick={handleBeginClick} />
          </div>

          {/* Registry Toggle Button */}
          <button
            className={`galgame-${deviceType}-registry-toggle-btn`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering handleStartAudio
              toggleRegistry(e);
            }}
            aria-expanded={showRegistry}
            aria-label={showRegistry ? 'Close registry' : 'View registry'}
          >
            <span className="galgame-toggle-btn-icon" aria-hidden="true">♛</span>
            <span className="galgame-toggle-btn-text">
              {showRegistry ? 'Close Registry' : 'View Registry'}
            </span>
            <motion.div
              animate={{ rotate: showRegistry ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="galgame-toggle-btn-arrow"
            >
              <ChevronDown size={isMobile ? 20 : 22} />
            </motion.div>
          </button>

          <p className={`galgame-${deviceType}-hint landing-subhint--pulse`}>
            Tap to Enter
          </p>
        </motion.div>

        {/* Registry Popup Overlay */}
        <AnimatePresence>
          {showRegistry && !isClosing && (
            <motion.div
              className="galgame-registry-popup-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleOverlayClick}
            >
              <motion.div
                className={`galgame-${deviceType}-popup-container`}
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Close Button */}
                <motion.button
                  className="galgame-popup-close-btn"
                  onClick={toggleRegistry}
                  aria-label="Close registry"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} className="galgame-close-icon" />
                </motion.button>
                
                {/* Popup Title */}
                <div className="galgame-popup-title">Royal Registry</div>
                
                {/* Registry Items */}
                <motion.div className="galgame-popup-registry-items">
                  {REGISTRY_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        className="galgame-popup-registry-item"
                        variants={itemVariants}
                      >
                        <motion.div 
                          className="galgame-popup-registry-icon"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={isMobile ? 22 : 24} className="text-[#ff6b93]" />
                        </motion.div>
                        <div className="galgame-popup-registry-content">
                          <div className="galgame-popup-registry-kicker">
                            {item.kicker}
                          </div>
                          <div className="galgame-popup-registry-label">
                            {item.label}
                          </div>
                          <div className="galgame-popup-registry-desc">
                            {item.desc}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Optional footer */}
                <motion.div 
                  className="galgame-popup-footer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="galgame-popup-hint">
                    Read carefully before proceeding
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Main render logic - iPads use desktop layout
  const renderContent = () => {
    // Desktop includes both regular desktop AND iPads
    if (isDesktop) {
      return renderDesktopLayout();
    }
    // Mobile and tablet (non-iPad) use mobile/tablet layout
    return renderMobileTabletLayout();
  };

  return (
    <motion.div
      key="landing"
      className={`landing-stage ${isMobile ? 'galgame-mobile-view' : isTablet ? 'galgame-tablet-view' : 'galgame-desktop-view'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleStartAudio}
    >
      {/* Background layers */}
      <div className="landing-bg">
        <BackgroundVideo src="/videos/landing.mp4" />
      </div>
      <div className="landing-vignette bg-gradient-radial" />
      <div className="landing-veil" />
      
      {/* Atmosphere with conditional rendering for performance */}
      <Atmosphere 
        seed={1} 
      />

      {/* Main content */}
      {!isOpening && renderContent()}
    </motion.div>
  );
};

export default LandingStage;