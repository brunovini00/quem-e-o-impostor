import type { Player } from './types';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const MAX_PLAYER_NAME_LENGTH = 24;

/** Shared comparison key for player names, theme search, and recent words. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('pt-BR');
}

export function validatePlayers(players: readonly Player[]): string | null {
  if (players.length < MIN_PLAYERS)
    return 'Adicione pelo menos 3 jogadores: dois conhecem a palavra e um é o impostor.';
  if (players.length > MAX_PLAYERS) return 'A partida permite no máximo 20 jogadores.';
  const names = new Set<string>();
  const ids = new Set<string>();
  for (const player of players) {
    const name = normalize(player.name);
    if (!name) return 'Preencha o nome de todos os jogadores.';
    if ([...player.name.trim()].length > MAX_PLAYER_NAME_LENGTH)
      return 'Cada nome pode ter até 24 caracteres.';
    if (names.has(name)) return 'Existem nomes repetidos. Use nomes ou apelidos diferentes.';
    if (!player.id.trim() || ids.has(player.id))
      return 'A lista de jogadores está inválida. Cadastre os participantes novamente.';
    names.add(name);
    ids.add(player.id);
  }
  return null;
}

export function movePlayer(players: readonly Player[], from: number, to: number): Player[] {
  const reordered = [...players];
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= players.length ||
    to >= players.length ||
    from === to
  )
    return reordered;
  const player = reordered.splice(from, 1)[0];
  if (player) reordered.splice(to, 0, player);
  return reordered;
}
