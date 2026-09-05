import type { GameAction, GameState, Round } from './types';

export type IndividualSecret = { kind: 'word'; text: string } | { kind: 'impostor' };

export function initialGame(round: Round): GameState {
  return {
    phase: 'handoff',
    round,
    cursor: 0,
    choiceId: null,
    revealedForCurrent: false,
  };
}

export function secretForCurrent(state: GameState): IndividualSecret | null {
  if (state.phase !== 'revealing') return null;
  const current = state.round.players[state.cursor];
  if (!current) return null;
  return state.round.impostorIds.includes(current.id)
    ? { kind: 'impostor' }
    : { kind: 'word', text: state.round.word.text };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'BACKGROUND') {
    return state.phase === 'revealing' ? { ...state, phase: 'ready' } : state;
  }
  if (action.type === 'VOTE')
    return state.phase === 'discussion' ? { ...state, phase: 'vote' } : state;
  if (action.type === 'DISCUSS')
    return state.phase === 'vote' ? { ...state, phase: 'discussion' } : state;
  if (action.type === 'RESULT')
    return state.phase === 'discussion' || state.phase === 'vote'
      ? { ...state, phase: 'result' }
      : state;
  if (action.type === 'CHOOSE') {
    return state.phase === 'vote' &&
      state.round.players.some((player) => player.id === action.playerId)
      ? { ...state, choiceId: action.playerId }
      : state;
  }
  const current = state.round.players[state.cursor];
  if (!('playerId' in action) || !current || current.id !== action.playerId) return state;
  switch (action.type) {
    case 'CONFIRM_HOLDER':
      return state.phase === 'handoff' ? { ...state, phase: 'ready' } : state;
    case 'REVEAL':
      return state.phase === 'ready'
        ? { ...state, phase: 'revealing', revealedForCurrent: true }
        : state;
    case 'CONCEAL':
      return state.phase === 'revealing' ? { ...state, phase: 'ready' } : state;
    case 'MARK_READ':
      return (state.phase === 'ready' || state.phase === 'revealing') && state.revealedForCurrent
        ? { ...state, phase: 'concealed' }
        : state;
    case 'NEXT':
      if (state.phase !== 'concealed') return state;
      return state.cursor < state.round.players.length - 1
        ? {
            ...state,
            phase: 'handoff',
            cursor: state.cursor + 1,
            revealedForCurrent: false,
          }
        : { ...state, phase: 'discussion', revealedForCurrent: false };
    default:
      return state;
  }
}
