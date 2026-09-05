import { describe, expect, it } from 'vitest';
import { movePlayer, normalize, validatePlayers } from '../players';
import { players } from './fixtures';

describe('cadastro de jogadores', () => {
  it('normaliza espaços, caixa e acentos de forma consistente', () => {
    expect(normalize('  JOÃO   dÁvila  ')).toBe('joao davila');
    expect(normalize('A\u0301RVORE\t azul')).toBe('arvore azul');
  });

  it('aceita os limites de 3 e 20 participantes', () => {
    expect(validatePlayers(players(3))).toBeNull();
    expect(validatePlayers(players(20))).toBeNull();
    expect(validatePlayers(players(2))).toMatch(/pelo menos 3/);
    expect(validatePlayers(players(21))).toMatch(/máximo 20/);
  });

  it('rejeita nomes vazios, longos e duplicados com acento ou espaços', () => {
    expect(
      validatePlayers([
        { id: '1', name: ' João ' },
        { id: '2', name: 'JOAO' },
        { id: '3', name: 'Ana' },
      ]),
    ).toMatch(/repetidos/);
    expect(validatePlayers([{ id: '1', name: '\t ' }, ...players(2)])).toMatch(/Preencha/);
    expect(validatePlayers([{ id: '1', name: 'x'.repeat(25) }, ...players(2)])).toMatch(/24/);
    expect(validatePlayers([{ id: '1', name: 'x'.repeat(24) }, ...players(2)])).toBeNull();
  });

  it('conta caracteres Unicode sem cortar pares substitutos', () => {
    expect(validatePlayers([{ id: '1', name: '🦊'.repeat(24) }, ...players(2)])).toBeNull();
    expect(validatePlayers([{ id: '1', name: '🦊'.repeat(25) }, ...players(2)])).toMatch(/24/);
  });

  it('rejeita identificadores vazios ou repetidos', () => {
    expect(validatePlayers([{ id: '', name: 'Ana' }, ...players(2)])).not.toBeNull();
    expect(validatePlayers([{ id: 'player-0', name: 'Ana' }, ...players(2)])).not.toBeNull();
  });

  it('reordena para cima e para baixo sem modificar a lista original', () => {
    const original = players();
    expect(movePlayer(original, 0, 2).map((player) => player.id)).toEqual([
      'player-1',
      'player-2',
      'player-0',
    ]);
    expect(movePlayer(original, 2, 0).map((player) => player.id)).toEqual([
      'player-2',
      'player-0',
      'player-1',
    ]);
    expect(original).toEqual(players());
  });

  it.each([
    [-1, 0],
    [0, 3],
    [1.5, 0],
    [0, Number.NaN],
    [0, 0],
  ])('ignora índices inválidos ou sem movimento: %s → %s', (from, to) => {
    const original = players();
    expect(movePlayer(original, from, to)).toEqual(original);
    expect(movePlayer(original, from, to)).not.toBe(original);
  });
});
