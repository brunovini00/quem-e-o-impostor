// Storage module for persistent local data
// Handles config, players, themes, and game settings

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'impostor-game';

export interface Player {
  id: string;
  name: string;
}

export interface Word {
  id: string;
  text: string;
  difficulty: 'facil' | 'medio' | 'dificil';
}

export interface Theme {
  id: string;
  name: string;
  icon: string;
  words: Word[];
  isCustom?: boolean;
}

export interface GameConfig {
  version: number;
  players: Player[];
  impostorCount: number;
  selectedThemeIds: string[];
  difficulty: 'facil' | 'medio' | 'dificil' | 'todos';
  timerEnabled: boolean;
  timerDuration: number; // in seconds
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  votingEnabled: boolean;
  customThemes: Theme[];
}

const DEFAULT_CONFIG: GameConfig = {
  version: STORAGE_VERSION,
  players: [],
  impostorCount: 1,
  selectedThemeIds: [],
  difficulty: 'todos',
  timerEnabled: false,
  timerDuration: 120,
  soundEnabled: true,
  vibrationEnabled: true,
  votingEnabled: true,
  customThemes: [],
};

export function getConfig(): GameConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_CONFIG };
    }

    const parsed = JSON.parse(stored) as GameConfig;
    
    // Version migration
    if (!parsed.version || parsed.version < STORAGE_VERSION) {
      return migrateConfig(parsed);
    }

    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (error) {
    console.error('Error loading config:', error);
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Partial<GameConfig>): void {
  try {
    const current = getConfig();
    const updated = { ...current, ...config, version: STORAGE_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

export function resetConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting config:', error);
  }
}

function migrateConfig(oldConfig: Partial<GameConfig>): GameConfig {
  // Handle migrations from older versions
  const migrated: GameConfig = {
    ...DEFAULT_CONFIG,
    ...oldConfig,
    version: STORAGE_VERSION,
  };
  
  saveConfig(migrated);
  return migrated;
}

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Export/Import for themes
export function exportThemes(themes: Theme[]): string {
  return JSON.stringify(themes, null, 2);
}

export function importThemes(json: string): Theme[] | null {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return null;
    }
    // Validate structure
    for (const theme of parsed) {
      if (!theme.id || !theme.name || !Array.isArray(theme.words)) {
        return null;
      }
    }
    return parsed as Theme[];
  } catch {
    return null;
  }
}
