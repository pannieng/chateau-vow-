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
  sadimageUrl: string;
  affinity: number;
  startDialogue: string[];
  middleDialogue: string[];
  endDialogue: string[];
  distractionDialogue: string[];
}

export interface BreakCeremonyTheme {
  id: number;
  name: string;
  backgroundColor: string;
  backgroundGradient: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  decorativeElements: DecorativeElement[];
  characterDialogue: string;
  progressBarStyle: ProgressBarStyle;
  interactiveElements: InteractiveElement[];
}

export interface DecorativeElement {
  type: 'floating' | 'static' | 'animated';
  content: React.ReactNode;
  position: { x: number; y: number };
}

export interface ProgressBarStyle {
  background: string;
  fillGradient: string[];
  markerColor: string;
}

export interface InteractiveElement {
  type: 'button' | 'toggle' | 'slider';
  label: string;
  action: () => void;
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
  isMobile?: boolean;
}

export interface TimerDialogueProps {
  dialogue: TimerDialogue;
  onHoverCharacter: () => void;
  isMobile?: boolean;
}

export interface ImmersiveTimerProps {
  timeLeft: number;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  isMobile?: boolean;
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