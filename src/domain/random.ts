export type RandomInt = (max: number) => number;

const UINT32_RANGE = 0x100000000;

/** Rejection sampling avoids the bias introduced by a direct modulo. */
export function randomIntFromUint32(max: number, nextUint32: () => number): number {
  if (!Number.isSafeInteger(max) || max < 1 || max > UINT32_RANGE)
    throw new RangeError('Limite de sorteio inválido.');
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  let sample: number;
  do {
    sample = nextUint32();
    if (!Number.isInteger(sample) || sample < 0 || sample >= UINT32_RANGE)
      throw new RangeError('Fonte de aleatoriedade inválida.');
  } while (sample >= limit);
  return sample % max;
}

export function drawIndex(max: number, randomInt: RandomInt): number {
  const result = randomInt(max);
  if (!Number.isInteger(result) || result < 0 || result >= max)
    throw new RangeError('O sorteio não pôde ser concluído.');
  return result;
}

/** Fisher–Yates, using an injectable uniform integer source. */
export function shuffle<T>(items: readonly T[], randomInt: RandomInt): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = drawIndex(index + 1, randomInt);
    const original = shuffled[index] as T;
    shuffled[index] = shuffled[target] as T;
    shuffled[target] = original;
  }
  return shuffled;
}
