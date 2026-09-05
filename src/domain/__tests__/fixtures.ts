import { randomIntFromUint32 } from '../random';
import { DEFAULT_SETTINGS, type Player, type Theme } from '../types';

export function players(count = 3): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index}`,
    name: `Pessoa ${index + 1}`,
  }));
}

export const themes: Theme[] = [
  {
    id: 'food',
    name: 'Comidas e pratos',
    emoji: '🍲',
    description: 'Receitas para compartilhar',
    words: [
      { text: 'Pão de queijo', difficulty: 'easy' },
      { text: 'Arroz', difficulty: 'easy' },
    ],
  },
  {
    id: 'animals',
    name: 'Animais',
    emoji: '🐼',
    description: 'Espécies da natureza',
    words: [{ text: 'Leão', difficulty: 'easy' }],
  },
  {
    id: 'technology',
    name: 'Tecnologia',
    emoji: '💻',
    description: 'Dispositivos e conexões',
    words: [{ text: 'Celular', difficulty: 'easy' }],
  },
];

export function options(count = 3) {
  return {
    players: players(count),
    themes,
    selectedThemeIds: ['food', 'animals'],
    settings: { ...DEFAULT_SETTINGS },
    history: [] as string[],
  };
}

export function seededRandom(seed = 123456) {
  let value = seed;
  return (max: number) =>
    randomIntFromUint32(max, () => {
      value ^= value << 13;
      value ^= value >>> 17;
      value ^= value << 5;
      return value >>> 0;
    });
}
