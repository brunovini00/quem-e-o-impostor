export type Difficulty = 'easy' | 'medium' | 'hard';
export interface WordEntry {
  text: string;
  difficulty: Difficulty;
  subtype?: string;
}
export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  words: WordEntry[];
}
export interface Player {
  id: string;
  name: string;
}
export interface Settings {
  sound: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  colorScheme: 'system' | 'light' | 'dark';
  timerSeconds: number;
  firstSpeaker: 'first' | 'random';
}
export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  haptics: true,
  reduceMotion: false,
  colorScheme: 'dark',
  timerSeconds: 180,
  firstSpeaker: 'random',
};
export interface Round {
  id: string;
  players: Player[];
  word: WordEntry;
  themeId: string;
  impostorIds: string[];
  firstSpeakerId: string;
}
export type Phase =
  'handoff' | 'ready' | 'revealing' | 'concealed' | 'discussion' | 'vote' | 'result';
export interface GameState {
  phase: Phase;
  round: Round;
  cursor: number;
  choiceId: string | null;
  revealedForCurrent: boolean;
}
export type GameAction =
  | {
      type: 'CONFIRM_HOLDER' | 'REVEAL' | 'CONCEAL' | 'MARK_READ' | 'NEXT';
      playerId: string;
    }
  | { type: 'BACKGROUND' | 'VOTE' | 'DISCUSS' | 'RESULT' }
  | { type: 'CHOOSE'; playerId: string };
export interface Preferences {
  players: Player[];
  selectedThemeIds: string[];
  settings: Settings;
  history: string[];
}
