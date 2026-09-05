import { describe, expect, it } from 'vitest';
import { gameReducer, initialGame, secretForCurrent } from '../game';
import { createRound } from '../round';
import type { GameState } from '../types';
import { options } from './fixtures';

function setup(count = 3) {
  return initialGame(createRound(options(count), () => 0, 'privacy-test'));
}

function readCurrent(state: GameState): GameState {
  const playerId = state.round.players[state.cursor]!.id;
  let next = gameReducer(state, { type: 'CONFIRM_HOLDER', playerId });
  next = gameReducer(next, { type: 'REVEAL', playerId });
  return gameReducer(next, { type: 'MARK_READ', playerId });
}

function finishRevelations(state = setup()): GameState {
  let next = state;
  for (const player of state.round.players)
    next = gameReducer(readCurrent(next), {
      type: 'NEXT',
      playerId: player.id,
    });
  return next;
}

describe('máquina de estados e privacidade', () => {
  it.each([3, 20])(
    'completa uma única passagem entre %s pessoas, com uma palavra comum e um impostor',
    (count) => {
      let state = setup(count);
      const secrets = [];
      for (const [cursor, player] of state.round.players.entries()) {
        expect(state.phase).toBe('handoff');
        expect(state.cursor).toBe(cursor);
        expect(secretForCurrent(state)).toBeNull();
        state = gameReducer(state, {
          type: 'CONFIRM_HOLDER',
          playerId: player.id,
        });
        expect(secretForCurrent(state)).toBeNull();
        state = gameReducer(state, { type: 'REVEAL', playerId: player.id });
        secrets.push(secretForCurrent(state));
        state = gameReducer(state, { type: 'MARK_READ', playerId: player.id });
        expect(state.phase).toBe('concealed');
        expect(secretForCurrent(state)).toBeNull();
        state = gameReducer(state, { type: 'NEXT', playerId: player.id });
        expect(secretForCurrent(state)).toBeNull();
      }
      expect(secrets.filter((secret) => secret?.kind === 'impostor')).toEqual([
        { kind: 'impostor' },
      ]);
      expect(secrets.filter((secret) => secret?.kind === 'word')).toEqual(
        Array.from({ length: count - 1 }, () => ({
          kind: 'word',
          text: 'Pão de queijo',
        })),
      );
      expect(state.phase).toBe('discussion');
      expect(state.cursor).toBe(count - 1);
    },
  );

  it('exige confirmação do portador e primeira revelação antes de confirmar leitura', () => {
    const start = setup();
    expect(gameReducer(start, { type: 'REVEAL', playerId: 'player-0' })).toBe(start);
    expect(gameReducer(start, { type: 'CONFIRM_HOLDER', playerId: 'player-1' })).toBe(start);
    const ready = gameReducer(start, {
      type: 'CONFIRM_HOLDER',
      playerId: 'player-0',
    });
    expect(gameReducer(ready, { type: 'MARK_READ', playerId: 'player-0' })).toBe(ready);
    expect(gameReducer(ready, { type: 'NEXT', playerId: 'player-0' })).toBe(ready);
  });

  it('toques repetidos são idempotentes e tokens antigos não pulam o próximo jogador', () => {
    const start = setup();
    const ready = gameReducer(start, {
      type: 'CONFIRM_HOLDER',
      playerId: 'player-0',
    });
    expect(gameReducer(ready, { type: 'CONFIRM_HOLDER', playerId: 'player-0' })).toBe(ready);
    const revealing = gameReducer(ready, {
      type: 'REVEAL',
      playerId: 'player-0',
    });
    expect(gameReducer(revealing, { type: 'REVEAL', playerId: 'player-0' })).toBe(revealing);
    const concealed = gameReducer(revealing, {
      type: 'MARK_READ',
      playerId: 'player-0',
    });
    expect(gameReducer(concealed, { type: 'MARK_READ', playerId: 'player-0' })).toBe(concealed);
    expect(gameReducer(concealed, { type: 'REVEAL', playerId: 'player-0' })).toBe(concealed);
    const next = gameReducer(concealed, { type: 'NEXT', playerId: 'player-0' });
    expect(next.cursor).toBe(1);
    expect(next.revealedForCurrent).toBe(false);
    for (const type of ['NEXT', 'CONFIRM_HOLDER', 'REVEAL', 'CONCEAL', 'MARK_READ'] as const)
      expect(gameReducer(next, { type, playerId: 'player-0' })).toBe(next);
  });

  it('oculta ao soltar e ao ir ao segundo plano, exigindo novo gesto ao retornar', () => {
    const ready = gameReducer(setup(), {
      type: 'CONFIRM_HOLDER',
      playerId: 'player-0',
    });
    const showing = gameReducer(ready, {
      type: 'REVEAL',
      playerId: 'player-0',
    });
    const released = gameReducer(showing, {
      type: 'CONCEAL',
      playerId: 'player-0',
    });
    expect(released.phase).toBe('ready');
    expect(secretForCurrent(released)).toBeNull();
    const background = gameReducer(showing, { type: 'BACKGROUND' });
    expect(background.phase).toBe('ready');
    expect(secretForCurrent(background)).toBeNull();
    expect(gameReducer(background, { type: 'BACKGROUND' })).toBe(background);
    expect(gameReducer(background, { type: 'MARK_READ', playerId: 'player-0' }).phase).toBe(
      'concealed',
    );
    const handoff = setup();
    expect(gameReducer(handoff, { type: 'BACKGROUND' })).toBe(handoff);
  });

  it('não permite votação, resultado ou consulta anterior durante a revelação', () => {
    const start = setup();
    for (const type of ['RESULT', 'DISCUSS', 'VOTE'] as const)
      expect(gameReducer(start, { type })).toBe(start);
    expect(gameReducer(start, { type: 'CHOOSE', playerId: 'player-0' })).toBe(start);
    const next = gameReducer(readCurrent(start), {
      type: 'NEXT',
      playerId: 'player-0',
    });
    expect(gameReducer(next, { type: 'REVEAL', playerId: 'player-0' })).toBe(next);
  });

  it('votação é opcional, só aceita jogadores existentes e resultado encerra a máquina', () => {
    const discussion = finishRevelations();
    expect(gameReducer(discussion, { type: 'RESULT' }).phase).toBe('result');
    const vote = gameReducer(discussion, { type: 'VOTE' });
    expect(vote.phase).toBe('vote');
    expect(gameReducer(vote, { type: 'CHOOSE', playerId: 'inexistente' })).toBe(vote);
    const chosen = gameReducer(vote, { type: 'CHOOSE', playerId: 'player-1' });
    expect(chosen.choiceId).toBe('player-1');
    expect(gameReducer(chosen, { type: 'DISCUSS' }).phase).toBe('discussion');
    const result = gameReducer(chosen, { type: 'RESULT' });
    expect(result.phase).toBe('result');
    expect(result.choiceId).toBe('player-1');
    expect(secretForCurrent(result)).toBeNull();
    for (const type of ['VOTE', 'RESULT', 'DISCUSS', 'BACKGROUND'] as const)
      expect(gameReducer(result, { type })).toBe(result);
    for (const type of [
      'CONFIRM_HOLDER',
      'REVEAL',
      'MARK_READ',
      'NEXT',
      'CONCEAL',
      'CHOOSE',
    ] as const)
      expect(gameReducer(result, { type, playerId: 'player-2' })).toBe(result);
  });
});
