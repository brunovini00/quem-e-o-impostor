import { MAX_PLAYER_NAME_LENGTH, MAX_PLAYERS, updateHistory } from '../domain';
import type { Preferences, Settings } from '../domain/types';

export const PREFERENCES_KEY = 'impostor.preferences.v1';
const VERSION = 1;

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readSettings(value: unknown): Settings | null {
  if (
    !isRecord(value) ||
    typeof value.sound !== 'boolean' ||
    typeof value.haptics !== 'boolean' ||
    typeof value.reduceMotion !== 'boolean' ||
    !['system', 'light', 'dark'].includes(String(value.colorScheme)) ||
    !['first', 'random'].includes(String(value.firstSpeaker)) ||
    typeof value.timerSeconds !== 'number' ||
    !Number.isInteger(value.timerSeconds) ||
    value.timerSeconds < 0 ||
    value.timerSeconds > 3600
  )
    return null;
  return {
    sound: value.sound,
    haptics: value.haptics,
    reduceMotion: value.reduceMotion,
    colorScheme: value.colorScheme as Settings['colorScheme'],
    timerSeconds: value.timerSeconds,
    firstSpeaker: value.firstSpeaker as Settings['firstSpeaker'],
  };
}

function readPreferences(value: unknown): Preferences | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.players) ||
    value.players.length > MAX_PLAYERS ||
    !Array.isArray(value.selectedThemeIds) ||
    value.selectedThemeIds.length > 256 ||
    !Array.isArray(value.history) ||
    value.history.length > 1000
  )
    return null;
  const settings = readSettings(value.settings);
  if (!settings) return null;
  const players: Preferences['players'] = [];
  const ids = new Set<string>();
  for (const player of value.players) {
    if (
      !isRecord(player) ||
      typeof player.id !== 'string' ||
      !player.id.trim() ||
      player.id.length > 128 ||
      ids.has(player.id) ||
      typeof player.name !== 'string' ||
      [...player.name.trim()].length > MAX_PLAYER_NAME_LENGTH
    )
      return null;
    players.push({ id: player.id, name: player.name.trim() });
    ids.add(player.id);
  }
  const selectedThemeIds: string[] = [];
  for (const id of value.selectedThemeIds) {
    if (typeof id !== 'string' || !id.trim() || id.length > 128) return null;
    selectedThemeIds.push(id);
  }
  let history: string[] = [];
  for (const entry of value.history) {
    if (typeof entry !== 'string' || entry.length > 256) return null;
    history = updateHistory(history, entry);
  }
  return {
    players,
    selectedThemeIds: [...new Set(selectedThemeIds)],
    settings,
    history,
  };
}

export async function loadPreferences(adapter: StorageAdapter): Promise<Preferences | null> {
  const raw = await adapter.getItem(PREFERENCES_KEY);
  if (!raw) return null;
  let envelope: unknown;
  try {
    envelope = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(envelope) || envelope.version !== VERSION) return null;
  return readPreferences(envelope.preferences);
}

export async function savePreferences(
  adapter: StorageAdapter,
  preferences: Preferences,
): Promise<void> {
  const safe = readPreferences(preferences);
  if (!safe) throw new Error('Não foi possível salvar preferências inválidas.');
  // Explicit projection prevents rounds, roles, and temporary reveal state from reaching storage.
  await adapter.setItem(PREFERENCES_KEY, JSON.stringify({ version: VERSION, preferences: safe }));
}

export async function clearPreferences(adapter: StorageAdapter): Promise<void> {
  await adapter.removeItem(PREFERENCES_KEY);
}
