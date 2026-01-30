import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { COMPANIONS } from '../src/constants/companions';
import { useIsMobile } from '../src/hooks/useIsMobile';
import LandingStage from '../src/pages/LandingStage';
import NameEntryStage from '../src/pages/NameEntryStage';
import SelectionStage from '../src/pages/SelectionStage';
import VowSetupStage from '../src/pages/VowSetupStage';
import TimerStage from '../src/pages/TimerStage';
import CharacterCutIn from '../src/components/CharacterCutIn';
import BackgroundAudio from '../src/components/BackgroundAudio'; // Import the BackgroundAudio component

function App() {
  const [stage, setStage] = useState<'landing' | 'name_entry' | 'video_transition' | 'selection' | 'vow_setup' | 'timer'>('landing');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [showOpening, setShowOpening] = useState(false);
  const [secretDialogue, setSecretDialogue] = useState('');
  const [characterClickCounts, setCharacterClickCounts] = useState<Record<number, number>>({});
  const [showCharacterCutIn, setShowCharacterCutIn] = useState(false);
  
  // New state to control background audio
  const [isBackgroundAudioPlaying, setIsBackgroundAudioPlaying] = useState(false);
  const [currentAudioStage, setCurrentAudioStage] = useState<'selection' | 'timer'>('selection');

  const isMobile = useIsMobile();

  const handleNameSubmitted = (name: string) => {
    setPlayerName(name);
    setStage('selection');
    // Start audio when entering selection stage
    setIsBackgroundAudioPlaying(true);
    setCurrentAudioStage('selection');
  };

  const handleSelectCharacter = (id: number | null) => {
    setSelectedCharacter(id);
  };

  const handleCharacterClick = (id: number) => {
    setCharacterClickCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleSecretDialogue = (dialogue: string) => {
    setSecretDialogue(dialogue);
  };

  const handleConfirmSelection = () => {
    if (selectedCharacter) {
      setShowCharacterCutIn(true);
    }
  };

  const handleCutInComplete = () => {
    setShowCharacterCutIn(false);
    setStage('vow_setup');
    // Audio continues playing through vow_setup stage
  };

  const handleSelectTime = (time: number) => {
    setSelectedTime(time);
  };

  const handleConfirmVow = () => {
    if (selectedCharacter && selectedTime) {
      setStage('timer');
      // Audio continues playing in timer stage
    }
  };

  const handleGoBackToSelection = () => {
    setStage('selection');
    // Ensure audio is playing when going back to selection
    setIsBackgroundAudioPlaying(true);
    setCurrentAudioStage('selection');
  };

  const handleEndVow = () => {
    setStage('selection');
    // Reset to selection audio when ending vow
    setIsBackgroundAudioPlaying(true);
    setCurrentAudioStage('selection');
  };

  // Determine which audio file to play based on current stage
  const getAudioSrc = () => {
    if (currentAudioStage === 'selection') {
      return '/audio/landing.mp3'; // Replace with your selection stage audio path
    } else if (currentAudioStage === 'timer') {
      return '/audio/landing1.mp3'; // Replace with your timer stage audio path
    }
    return '';
  };

  // Update audio stage when timer stage starts
  React.useEffect(() => {
    if (stage === 'timer') {
      setCurrentAudioStage('timer');
    }
  }, [stage]);

  return (
    <div className="app">
      {/* Background Audio Component - renders in all stages when needed */}
      {isBackgroundAudioPlaying && (
        <BackgroundAudio
          src={getAudioSrc()}
          volume={0.5}
          isPlaying={isBackgroundAudioPlaying}
          key={`audio-${currentAudioStage}`} // Key forces re-mount when audio changes
        />
      )}

      <AnimatePresence mode="wait">
        {showCharacterCutIn && selectedCharacter && (
          <CharacterCutIn
            character={COMPANIONS.find(c => c.id === selectedCharacter) || null}
            onComplete={handleCutInComplete}
          />
        )}

        {stage === 'landing' && (
          <LandingStage
            isOpening={showOpening}
            onBegin={() => setStage('name_entry')}
          />
        )}

        {stage === 'name_entry' && (
          <NameEntryStage
            onNameSubmitted={handleNameSubmitted}
          />
        )}

        {stage === 'selection' && (
          <SelectionStage
            selectedCharacter={selectedCharacter}
            onSelect={handleSelectCharacter}
            onConfirm={handleConfirmSelection}
            onSecretDialogue={handleSecretDialogue}
            characterClickCounts={characterClickCounts}
          />
        )}

        {stage === 'vow_setup' && selectedCharacter && (
          <VowSetupStage
            selectedCharacter={selectedCharacter}
            selectedTime={selectedTime}
            playerName={playerName}
            onSelectTime={handleSelectTime}
            onConfirmVow={handleConfirmVow}
            onGoBack={handleGoBackToSelection}
          />
        )}

        {stage === 'timer' && selectedCharacter && selectedTime && (
          <TimerStage
            key={`timer-${selectedCharacter}-${selectedTime}`}
            selectedCharacter={selectedCharacter}
            selectedTime={selectedTime}
            playerName={playerName}
            onEndVow={handleEndVow}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;