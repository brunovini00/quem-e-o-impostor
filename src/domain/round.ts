import { normalize, validatePlayers } from './players';
import { drawIndex, type RandomInt } from './random';
import type { Player, Round, Settings, Theme, WordEntry } from './types';

export const HISTORY_LIMIT = 80;

export interface RoundOptions {
  players: readonly Player[];
  themes: readonly Theme[];
  selectedThemeIds: readonly string[];
  settings: Settings;
  history: readonly string[];
}

export function filterThemes(themes: readonly Theme[], query: string): Theme[] {
  const search = normalize(query);
  return themes.filter((theme) => normalize(`${theme.name} ${theme.description}`).includes(search));
}

/** History is chronological, with the newest entry at the end. */
export function updateHistory(history: readonly string[], word: string): string[] {
  const normalized = normalize(word);
  const clean = history
    .map(normalize)
    .filter(
      (entry, index, all) =>
        Boolean(entry) && entry !== normalized && all.lastIndexOf(entry) === index,
    );
  if (normalized) clean.push(normalized);
  return clean.slice(-HISTORY_LIMIT);
}

export function createRound(
  options: RoundOptions,
  randomInt: RandomInt,
  id = 'local-round',
): Round {
  const validation = validatePlayers(options.players);
  if (validation) throw new Error(validation);
  const selected = new Set(options.selectedThemeIds);
  const entries: { word: WordEntry; themeId: string; key: string }[] = [];
  for (const theme of options.themes) {
    if (selected.has(theme.id)) {
      for (const word of theme.words) {
        const key = normalize(word.text);
        if (key) entries.push({ word, themeId: theme.id, key });
      }
    }
  }
  if (!entries.length) throw new Error('Selecione pelo menos um tema com palavras disponíveis.');

  const history = options.history.map(normalize);
  const used = new Set(history);
  let available = entries.filter((entry) => !used.has(entry.key));
  if (!available.length) {
    // Release only the least recently used word; repeated history entries use their last occurrence.
    const oldestIndex = Math.min(...entries.map((entry) => history.lastIndexOf(entry.key)));
    available = entries.filter((entry) => history.lastIndexOf(entry.key) === oldestIndex);
  }
  const chosen = available[drawIndex(available.length, randomInt)];
  const impostor = options.players[drawIndex(options.players.length, randomInt)];
  const firstSpeaker =
    options.settings.firstSpeaker === 'first'
      ? options.players[0]
      : options.players[drawIndex(options.players.length, randomInt)];
  if (!chosen || !impostor || !firstSpeaker) throw new Error('Não foi possível iniciar a partida.');
  return {
    id,
    players: options.players.map((player) => ({
      ...player,
      name: player.name.trim(),
    })),
    word: { ...chosen.word },
    themeId: chosen.themeId,
    impostorIds: [impostor.id],
    firstSpeakerId: firstSpeaker.id,
  };
}
