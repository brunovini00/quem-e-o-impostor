import { describe, expect, it } from 'vitest';
import { createRound, filterThemes, HISTORY_LIMIT, updateHistory } from '../round';
import { options, seededRandom, themes } from './fixtures';

describe('seleção da rodada', () => {
  it.each([3, 20])(
    'sorteia exatamente um impostor entre %s jogadores e copia os dados',
    (count) => {
      const input = options(count);
      const round = createRound(input, (max) => max - 1, 'round-test');
      expect(round.id).toBe('round-test');
      expect(round.impostorIds).toEqual([`player-${count - 1}`]);
      expect(round.players).toHaveLength(count);
      expect(round.players).not.toBe(input.players);
      expect(round.players[0]).not.toBe(input.players[0]);
      expect(round.word).toEqual({ text: 'Leão', difficulty: 'easy' });
      expect(round.word).not.toBe(themes[1]!.words[0]);
      expect(round.themeId).toBe('animals');
    },
  );

  it('aceita tema único, seleção múltipla e todos os temas', () => {
    expect(createRound({ ...options(), selectedThemeIds: ['technology'] }, () => 0).word.text).toBe(
      'Celular',
    );
    expect(createRound(options(), () => 0).word.text).toBe('Pão de queijo');
    expect(
      createRound(
        { ...options(), selectedThemeIds: themes.map((theme) => theme.id) },
        (max) => max - 1,
      ).word.text,
    ).toBe('Celular');
    expect(
      createRound({ ...options(), selectedThemeIds: ['technology', 'technology'] }, () => 0).word
        .text,
    ).toBe('Celular');
  });

  it('rejeita jogadores inválidos, ausência de temas e sorteador inválido', () => {
    expect(() => createRound(options(2), () => 0)).toThrow(/3 jogadores/);
    expect(() => createRound({ ...options(), selectedThemeIds: [] }, () => 0)).toThrow(/Selecione/);
    expect(() => createRound({ ...options(), selectedThemeIds: ['inexistente'] }, () => 0)).toThrow(
      /Selecione/,
    );
    expect(() =>
      createRound({ ...options(), themes: [{ ...themes[0]!, words: [] }] }, () => 0),
    ).toThrow(/Selecione/);
    expect(() => createRound(options(), () => -1)).toThrow(RangeError);
  });

  it('primeiro da discussão é independente do impostor', () => {
    const input = options();
    expect(
      createRound(
        { ...input, settings: { ...input.settings, firstSpeaker: 'first' } },
        (max) => max - 1,
      ).firstSpeakerId,
    ).toBe('player-0');
    expect(createRound(input, (max) => max - 1).firstSpeakerId).toBe('player-2');
  });

  it('exclui palavras recentes após normalização e libera a menos recente ao esgotar', () => {
    const input = { ...options(), history: [' PÃO  DE QUEIJO ', 'LEAO'] };
    expect(createRound(input, () => 0).word.text).toBe('Arroz');
    expect(
      createRound({ ...input, history: ['ARROZ', 'leão', 'Pão de queijo'] }, () => 0).word.text,
    ).toBe('Arroz');
    expect(
      createRound({ ...input, history: ['Arroz', 'Leão', 'Arroz', 'Pão de queijo'] }, () => 0).word
        .text,
    ).toBe('Leão');
  });

  it('evita viés grosseiro por jogador e por entrada, inclusive entre temas de tamanhos diferentes', () => {
    const random = seededRandom();
    const impostors = new Map<string, number>();
    const words = new Map<string, number>();
    const speakers = new Map<string, number>();
    const input = options();
    for (let index = 0; index < 12000; index += 1) {
      const round = createRound(input, random);
      const impostor = round.impostorIds[0]!;
      impostors.set(impostor, (impostors.get(impostor) ?? 0) + 1);
      words.set(round.word.text, (words.get(round.word.text) ?? 0) + 1);
      speakers.set(round.firstSpeakerId, (speakers.get(round.firstSpeakerId) ?? 0) + 1);
    }
    for (const counts of [impostors, words, speakers]) {
      expect(counts.size).toBe(3);
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(3600);
        expect(count).toBeLessThan(4400);
      }
    }
  });
});

describe('histórico e temas', () => {
  it('normaliza e limita o histórico, movendo palavras repetidas para o fim', () => {
    expect(updateHistory(['arroz', 'PÃO DE QUEIJO'], ' Arroz ')).toEqual([
      'pao de queijo',
      'arroz',
    ]);
    expect(updateHistory(['arroz', 'arroz', ''], ' ')).toEqual(['arroz']);
    expect(updateHistory(['arroz', 'pão', 'arroz'], 'novo')).toEqual(['pao', 'arroz', 'novo']);
    const input = Array.from({ length: 85 }, (_, index) => `palavra de teste ${index}`);
    const result = updateHistory(input, 'Novo');
    expect(result).toHaveLength(HISTORY_LIMIT);
    expect(result[0]).toBe('palavra de teste 6');
    expect(result.at(-1)).toBe('novo');
    expect(input).toHaveLength(85);
  });

  it('busca tema e descrição sem diferenças de caixa ou acento', () => {
    expect(filterThemes(themes, '  TECNOLOGIA ')).toEqual([themes[2]]);
    expect(filterThemes(themes, 'especies')).toEqual([themes[1]]);
    expect(filterThemes(themes, 'conexoes')).toEqual([themes[2]]);
    expect(filterThemes(themes, ' ')).toEqual(themes);
    expect(filterThemes(themes, 'sem resultados')).toEqual([]);
  });
});
