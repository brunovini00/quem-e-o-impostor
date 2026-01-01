import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  getConfig, 
  saveConfig, 
  GameConfig, 
  Player, 
  Theme, 
  generateId 
} from '@/lib/storage';
import { getAllThemes, getWordsByFilter } from '@/data/themes';

// Game state types
interface GameState {
  // Config (persisted)
  config: GameConfig;
  
  // Current game session (not persisted)
  isGameActive: boolean;
  currentPlayerIndex: number;
  secretWord: string | null;
  secretWordTheme: string | null;
  impostorIndices: number[];
  gamePhase: 'setup' | 'distribution' | 'round' | 'voting' | 'result' | 'guess';
  timerRunning: boolean;
  timerSeconds: number;
  votedPlayerIndex: number | null;
  impostorWon: boolean | null;
}

type GameAction =
  | { type: 'LOAD_CONFIG'; payload: GameConfig }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GameConfig> }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; name: string } }
  | { type: 'REORDER_PLAYERS'; payload: Player[] }
  | { type: 'CLEAR_PLAYERS' }
  | { type: 'SET_IMPOSTOR_COUNT'; payload: number }
  | { type: 'TOGGLE_THEME'; payload: string }
  | { type: 'SET_DIFFICULTY'; payload: 'facil' | 'medio' | 'dificil' | 'todos' }
  | { type: 'SET_TIMER_ENABLED'; payload: boolean }
  | { type: 'SET_TIMER_DURATION'; payload: number }
  | { type: 'SET_SOUND_ENABLED'; payload: boolean }
  | { type: 'SET_VIBRATION_ENABLED'; payload: boolean }
  | { type: 'ADD_CUSTOM_THEME'; payload: Theme }
  | { type: 'UPDATE_CUSTOM_THEME'; payload: Theme }
  | { type: 'DELETE_CUSTOM_THEME'; payload: string }
  | { type: 'IMPORT_THEMES'; payload: Theme[] }
  | { type: 'START_GAME'; payload: { word: string; theme: string; impostors: number[] } }
  | { type: 'NEXT_PLAYER' }
  | { type: 'START_ROUND' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'TICK_TIMER' }
  | { type: 'GO_TO_VOTING' }
  | { type: 'VOTE'; payload: number }
  | { type: 'REVEAL_RESULT' }
  | { type: 'IMPOSTOR_GUESS'; payload: boolean }
  | { type: 'RESET_GAME' }
  | { type: 'NEW_WORD'; payload: { word: string; theme: string; impostors: number[] } };

const initialState: GameState = {
  config: {
    version: 1,
    players: [],
    impostorCount: 1,
    selectedThemeIds: [],
    difficulty: 'todos',
    timerEnabled: false,
    timerDuration: 120,
    soundEnabled: true,
    vibrationEnabled: true,
    customThemes: [],
  },
  isGameActive: false,
  currentPlayerIndex: 0,
  secretWord: null,
  secretWordTheme: null,
  impostorIndices: [],
  gamePhase: 'setup',
  timerRunning: false,
  timerSeconds: 0,
  votedPlayerIndex: null,
  impostorWon: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_CONFIG':
      return { ...state, config: action.payload };

    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };

    case 'ADD_PLAYER':
      return {
        ...state,
        config: {
          ...state.config,
          players: [...state.config.players, { id: generateId(), name: action.payload }],
        },
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        config: {
          ...state.config,
          players: state.config.players.filter(p => p.id !== action.payload),
        },
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        config: {
          ...state.config,
          players: state.config.players.map(p =>
            p.id === action.payload.id ? { ...p, name: action.payload.name } : p
          ),
        },
      };

    case 'REORDER_PLAYERS':
      return {
        ...state,
        config: { ...state.config, players: action.payload },
      };

    case 'CLEAR_PLAYERS':
      return {
        ...state,
        config: { ...state.config, players: [] },
      };

    case 'SET_IMPOSTOR_COUNT':
      return {
        ...state,
        config: { ...state.config, impostorCount: action.payload },
      };

    case 'TOGGLE_THEME':
      const themeId = action.payload;
      const currentIds = state.config.selectedThemeIds;
      const newIds = currentIds.includes(themeId)
        ? currentIds.filter(id => id !== themeId)
        : [...currentIds, themeId];
      return {
        ...state,
        config: { ...state.config, selectedThemeIds: newIds },
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        config: { ...state.config, difficulty: action.payload },
      };

    case 'SET_TIMER_ENABLED':
      return {
        ...state,
        config: { ...state.config, timerEnabled: action.payload },
      };

    case 'SET_TIMER_DURATION':
      return {
        ...state,
        config: { ...state.config, timerDuration: action.payload },
      };

    case 'SET_SOUND_ENABLED':
      return {
        ...state,
        config: { ...state.config, soundEnabled: action.payload },
      };

    case 'SET_VIBRATION_ENABLED':
      return {
        ...state,
        config: { ...state.config, vibrationEnabled: action.payload },
      };

    case 'ADD_CUSTOM_THEME':
      return {
        ...state,
        config: {
          ...state.config,
          customThemes: [...state.config.customThemes, action.payload],
        },
      };

    case 'UPDATE_CUSTOM_THEME':
      return {
        ...state,
        config: {
          ...state.config,
          customThemes: state.config.customThemes.map(t =>
            t.id === action.payload.id ? action.payload : t
          ),
        },
      };

    case 'DELETE_CUSTOM_THEME':
      return {
        ...state,
        config: {
          ...state.config,
          customThemes: state.config.customThemes.filter(t => t.id !== action.payload),
          selectedThemeIds: state.config.selectedThemeIds.filter(id => id !== action.payload),
        },
      };

    case 'IMPORT_THEMES':
      return {
        ...state,
        config: {
          ...state.config,
          customThemes: [...state.config.customThemes, ...action.payload],
        },
      };

    case 'START_GAME':
      return {
        ...state,
        isGameActive: true,
        currentPlayerIndex: 0,
        secretWord: action.payload.word,
        secretWordTheme: action.payload.theme,
        impostorIndices: action.payload.impostors,
        gamePhase: 'distribution',
        timerSeconds: state.config.timerDuration,
        votedPlayerIndex: null,
        impostorWon: null,
      };

    case 'NEXT_PLAYER':
      const nextIndex = state.currentPlayerIndex + 1;
      if (nextIndex >= state.config.players.length) {
        return { ...state, gamePhase: 'round', currentPlayerIndex: 0 };
      }
      return { ...state, currentPlayerIndex: nextIndex };

    case 'START_ROUND':
      return { ...state, gamePhase: 'round' };

    case 'START_TIMER':
      return { ...state, timerRunning: true };

    case 'PAUSE_TIMER':
      return { ...state, timerRunning: false };

    case 'TICK_TIMER':
      return { ...state, timerSeconds: Math.max(0, state.timerSeconds - 1) };

    case 'GO_TO_VOTING':
      return { ...state, gamePhase: 'voting', timerRunning: false };

    case 'VOTE':
      return { ...state, votedPlayerIndex: action.payload, gamePhase: 'result' };

    case 'REVEAL_RESULT':
      const votedIsImpostor = state.impostorIndices.includes(state.votedPlayerIndex!);
      if (votedIsImpostor) {
        return { ...state, gamePhase: 'guess' };
      }
      return { ...state, impostorWon: true };

    case 'IMPOSTOR_GUESS':
      return { ...state, impostorWon: !action.payload };

    case 'RESET_GAME':
      return {
        ...state,
        isGameActive: false,
        currentPlayerIndex: 0,
        secretWord: null,
        secretWordTheme: null,
        impostorIndices: [],
        gamePhase: 'setup',
        timerRunning: false,
        timerSeconds: 0,
        votedPlayerIndex: null,
        impostorWon: null,
      };

    case 'NEW_WORD':
      return {
        ...state,
        currentPlayerIndex: 0,
        secretWord: action.payload.word,
        secretWordTheme: action.payload.theme,
        impostorIndices: action.payload.impostors,
        gamePhase: 'distribution',
        timerSeconds: state.config.timerDuration,
        votedPlayerIndex: null,
        impostorWon: null,
      };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  allThemes: Theme[];
  availableWordCount: number;
  startNewGame: () => boolean;
  pickNewWord: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load config on mount
  useEffect(() => {
    const config = getConfig();
    dispatch({ type: 'LOAD_CONFIG', payload: config });
  }, []);

  // Save config on changes
  useEffect(() => {
    saveConfig(state.config);
  }, [state.config]);

  const allThemes = getAllThemes(state.config.customThemes);
  
  const availableWordCount = getWordsByFilter(
    allThemes,
    state.config.selectedThemeIds,
    state.config.difficulty
  ).length;

  const startNewGame = (): boolean => {
    const words = getWordsByFilter(
      allThemes,
      state.config.selectedThemeIds,
      state.config.difficulty
    );

    if (words.length === 0) {
      return false;
    }

    if (state.config.players.length < 3) {
      return false;
    }

    if (state.config.impostorCount >= state.config.players.length) {
      return false;
    }

    // Pick random word
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // Pick random impostors
    const playerIndices = state.config.players.map((_, i) => i);
    const shuffled = playerIndices.sort(() => Math.random() - 0.5);
    const impostors = shuffled.slice(0, state.config.impostorCount);

    dispatch({
      type: 'START_GAME',
      payload: {
        word: randomWord.text,
        theme: randomWord.themeName,
        impostors,
      },
    });

    return true;
  };

  const pickNewWord = () => {
    const words = getWordsByFilter(
      allThemes,
      state.config.selectedThemeIds,
      state.config.difficulty
    );

    if (words.length === 0) return;

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const playerIndices = state.config.players.map((_, i) => i);
    const shuffled = playerIndices.sort(() => Math.random() - 0.5);
    const impostors = shuffled.slice(0, state.config.impostorCount);

    dispatch({
      type: 'NEW_WORD',
      payload: {
        word: randomWord.text,
        theme: randomWord.themeName,
        impostors,
      },
    });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        allThemes,
        availableWordCount,
        startNewGame,
        pickNewWord,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
