export type AppStage = 'landing' | 'name_entry' | 'video_transition' | 'selection' | 'vow_setup' | 'timer';

export interface Companion {
  id: number;
  name: string;
  epithet: string;
  focusPower: string;
  dialogue: string;
  secretDialogue: string;
  vowConfirmation: string;
  completionDialogue: string;
  timeDialogue: string;
  videoUrl: string;
  videoSmilingUrl: string;
  vibeHearts: 1 | 2 | 3;
  imageUrl: string;
  affinity: number;
  // New dialogue stages for timer
  startDialogue: string[];
  middleDialogue: string[];
  endDialogue: string[];
  distractionDialogue: string[];
}

export interface BackgroundVideoProps {
  src: string;
  brightness?: string;
  blur?: boolean;
}

export interface TimerDialogue {
  text: string;
  stage: 'start' | 'middle' | 'end' | 'distraction';
  shouldShow: boolean;
}

export interface SpiritMeterProps {
  progress: number;
  isCompleted: boolean;
}

export interface TimerDialogueProps {
  dialogue: TimerDialogue;
  onHoverCharacter: () => void;
}

export interface ImmersiveTimerProps {
  timeLeft: number;
  isImmersive: boolean;
  onToggleImmersive: () => void;
}

export interface CharacterCardProps {
  companion: Companion;
  isSelected: boolean;
  onSelect: () => void;
  onSecretDialogue: (dialogue: string) => void;
  isDimmed: boolean;
  isPanelOpen: boolean;
  clickCount: number;
}
