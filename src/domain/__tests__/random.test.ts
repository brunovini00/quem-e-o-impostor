import { describe, expect, it, vi } from 'vitest';
import { randomIntFromUint32, shuffle } from '../random';
import { seededRandom } from './fixtures';

describe('sorteio sem viés de módulo', () => {
  it('descarta a cauda que não cabe em blocos inteiros do limite', () => {
    const next = vi.fn().mockReturnValueOnce(0xffffffff).mockReturnValueOnce(17);
    expect(randomIntFromUint32(10, next)).toBe(7);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('aceita todo o espaço uint32 e o limite unitário', () => {
    expect(randomIntFromUint32(0x100000000, () => 0xffffffff)).toBe(0xffffffff);
    expect(randomIntFromUint32(1, () => 0xffffffff)).toBe(0);
  });

  it.each([0, -1, 1.5, Number.NaN, Infinity, 0x100000001])(
    'rejeita limite inválido %s',
    (limit) => {
      expect(() => randomIntFromUint32(limit, () => 1)).toThrow(RangeError);
    },
  );

  it.each([-1, 0x100000000, 0.5, Number.NaN, Infinity])('rejeita fonte inválida %s', (sample) => {
    expect(() => randomIntFromUint32(3, () => sample)).toThrow(RangeError);
  });

  it('Fisher–Yates preserva todos os itens e a entrada', () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffle(input, () => 0);
    expect(output).toEqual([2, 3, 4, 5, 1]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...output].sort()).toEqual(input);
    expect(shuffle([], () => 0)).toEqual([]);
    expect(shuffle([1], () => 0)).toEqual([1]);
    expect(() => shuffle(input, () => 9)).toThrow(RangeError);
  });

  it('distribui posições de embaralhamento sem favorecer posições grosseiramente', () => {
    const random = seededRandom(847128);
    const positions = [0, 0, 0];
    for (let index = 0; index < 9000; index += 1)
      positions[shuffle([0, 1, 2], random).indexOf(0)]! += 1;
    for (const count of positions) expect(count).toBeGreaterThan(2700);
    for (const count of positions) expect(count).toBeLessThan(3300);
  });
});
