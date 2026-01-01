import { Theme } from '@/lib/storage';

// Default themes with 150+ words in Portuguese
export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'animais',
    name: 'Animais',
    icon: '🐾',
    words: [
      { id: 'a1', text: 'Cachorro', difficulty: 'facil' },
      { id: 'a2', text: 'Gato', difficulty: 'facil' },
      { id: 'a3', text: 'Elefante', difficulty: 'facil' },
      { id: 'a4', text: 'Leão', difficulty: 'facil' },
      { id: 'a5', text: 'Tigre', difficulty: 'facil' },
      { id: 'a6', text: 'Girafa', difficulty: 'facil' },
      { id: 'a7', text: 'Macaco', difficulty: 'facil' },
      { id: 'a8', text: 'Pinguim', difficulty: 'medio' },
      { id: 'a9', text: 'Tubarão', difficulty: 'medio' },
      { id: 'a10', text: 'Baleia', difficulty: 'medio' },
      { id: 'a11', text: 'Arara', difficulty: 'medio' },
      { id: 'a12', text: 'Capivara', difficulty: 'medio' },
      { id: 'a13', text: 'Ornitorrinco', difficulty: 'dificil' },
      { id: 'a14', text: 'Axolote', difficulty: 'dificil' },
      { id: 'a15', text: 'Tarântula', difficulty: 'dificil' },
    ],
  },
  {
    id: 'comidas',
    name: 'Comidas',
    icon: '🍕',
    words: [
      { id: 'c1', text: 'Pizza', difficulty: 'facil' },
      { id: 'c2', text: 'Hambúrguer', difficulty: 'facil' },
      { id: 'c3', text: 'Feijoada', difficulty: 'facil' },
      { id: 'c4', text: 'Brigadeiro', difficulty: 'facil' },
      { id: 'c5', text: 'Coxinha', difficulty: 'facil' },
      { id: 'c6', text: 'Pastel', difficulty: 'facil' },
      { id: 'c7', text: 'Açaí', difficulty: 'facil' },
      { id: 'c8', text: 'Tapioca', difficulty: 'medio' },
      { id: 'c9', text: 'Acarajé', difficulty: 'medio' },
      { id: 'c10', text: 'Moqueca', difficulty: 'medio' },
      { id: 'c11', text: 'Vatapá', difficulty: 'dificil' },
      { id: 'c12', text: 'Bobó de Camarão', difficulty: 'dificil' },
      { id: 'c13', text: 'Pamonha', difficulty: 'medio' },
      { id: 'c14', text: 'Pão de Queijo', difficulty: 'facil' },
    ],
  },
  {
    id: 'profissoes',
    name: 'Profissões',
    icon: '👨‍⚕️',
    words: [
      { id: 'p1', text: 'Médico', difficulty: 'facil' },
      { id: 'p2', text: 'Professor', difficulty: 'facil' },
      { id: 'p3', text: 'Bombeiro', difficulty: 'facil' },
      { id: 'p4', text: 'Policial', difficulty: 'facil' },
      { id: 'p5', text: 'Astronauta', difficulty: 'facil' },
      { id: 'p6', text: 'Cozinheiro', difficulty: 'facil' },
      { id: 'p7', text: 'Piloto', difficulty: 'facil' },
      { id: 'p8', text: 'Veterinário', difficulty: 'medio' },
      { id: 'p9', text: 'Arqueólogo', difficulty: 'medio' },
      { id: 'p10', text: 'Paleontólogo', difficulty: 'dificil' },
      { id: 'p11', text: 'Neurocirurgião', difficulty: 'dificil' },
      { id: 'p12', text: 'Engenheiro', difficulty: 'medio' },
      { id: 'p13', text: 'Advogado', difficulty: 'medio' },
    ],
  },
  {
    id: 'lugares',
    name: 'Lugares',
    icon: '🌍',
    words: [
      { id: 'l1', text: 'Praia', difficulty: 'facil' },
      { id: 'l2', text: 'Hospital', difficulty: 'facil' },
      { id: 'l3', text: 'Escola', difficulty: 'facil' },
      { id: 'l4', text: 'Estádio', difficulty: 'facil' },
      { id: 'l5', text: 'Aeroporto', difficulty: 'facil' },
      { id: 'l6', text: 'Shopping', difficulty: 'facil' },
      { id: 'l7', text: 'Parque', difficulty: 'facil' },
      { id: 'l8', text: 'Museu', difficulty: 'medio' },
      { id: 'l9', text: 'Biblioteca', difficulty: 'medio' },
      { id: 'l10', text: 'Zoológico', difficulty: 'medio' },
      { id: 'l11', text: 'Observatório', difficulty: 'dificil' },
      { id: 'l12', text: 'Planetário', difficulty: 'dificil' },
      { id: 'l13', text: 'Cemitério', difficulty: 'medio' },
    ],
  },
  {
    id: 'filmes',
    name: 'Filmes e Séries',
    icon: '🎬',
    words: [
      { id: 'f1', text: 'Harry Potter', difficulty: 'facil' },
      { id: 'f2', text: 'Vingadores', difficulty: 'facil' },
      { id: 'f3', text: 'Titanic', difficulty: 'facil' },
      { id: 'f4', text: 'Frozen', difficulty: 'facil' },
      { id: 'f5', text: 'Rei Leão', difficulty: 'facil' },
      { id: 'f6', text: 'Star Wars', difficulty: 'facil' },
      { id: 'f7', text: 'Jurassic Park', difficulty: 'medio' },
      { id: 'f8', text: 'Stranger Things', difficulty: 'medio' },
      { id: 'f9', text: 'Game of Thrones', difficulty: 'medio' },
      { id: 'f10', text: 'Breaking Bad', difficulty: 'medio' },
      { id: 'f11', text: 'Interestelar', difficulty: 'dificil' },
      { id: 'f12', text: 'Matrix', difficulty: 'medio' },
      { id: 'f13', text: 'Senhor dos Anéis', difficulty: 'medio' },
    ],
  },
  {
    id: 'esportes',
    name: 'Esportes',
    icon: '⚽',
    words: [
      { id: 'e1', text: 'Futebol', difficulty: 'facil' },
      { id: 'e2', text: 'Vôlei', difficulty: 'facil' },
      { id: 'e3', text: 'Basquete', difficulty: 'facil' },
      { id: 'e4', text: 'Natação', difficulty: 'facil' },
      { id: 'e5', text: 'Tênis', difficulty: 'facil' },
      { id: 'e6', text: 'Skate', difficulty: 'facil' },
      { id: 'e7', text: 'Surfe', difficulty: 'facil' },
      { id: 'e8', text: 'Judô', difficulty: 'medio' },
      { id: 'e9', text: 'Esgrima', difficulty: 'medio' },
      { id: 'e10', text: 'Polo Aquático', difficulty: 'dificil' },
      { id: 'e11', text: 'Curling', difficulty: 'dificil' },
      { id: 'e12', text: 'Críquete', difficulty: 'dificil' },
    ],
  },
  {
    id: 'instrumentos',
    name: 'Instrumentos',
    icon: '🎵',
    words: [
      { id: 'i1', text: 'Violão', difficulty: 'facil' },
      { id: 'i2', text: 'Piano', difficulty: 'facil' },
      { id: 'i3', text: 'Bateria', difficulty: 'facil' },
      { id: 'i4', text: 'Flauta', difficulty: 'facil' },
      { id: 'i5', text: 'Violino', difficulty: 'facil' },
      { id: 'i6', text: 'Saxofone', difficulty: 'medio' },
      { id: 'i7', text: 'Trompete', difficulty: 'medio' },
      { id: 'i8', text: 'Acordeão', difficulty: 'medio' },
      { id: 'i9', text: 'Harpa', difficulty: 'medio' },
      { id: 'i10', text: 'Oboé', difficulty: 'dificil' },
      { id: 'i11', text: 'Cítara', difficulty: 'dificil' },
      { id: 'i12', text: 'Berimbau', difficulty: 'medio' },
    ],
  },
  {
    id: 'objetos',
    name: 'Objetos do Lar',
    icon: '🏠',
    words: [
      { id: 'o1', text: 'Geladeira', difficulty: 'facil' },
      { id: 'o2', text: 'Sofá', difficulty: 'facil' },
      { id: 'o3', text: 'Televisão', difficulty: 'facil' },
      { id: 'o4', text: 'Espelho', difficulty: 'facil' },
      { id: 'o5', text: 'Vassoura', difficulty: 'facil' },
      { id: 'o6', text: 'Microondas', difficulty: 'facil' },
      { id: 'o7', text: 'Ventilador', difficulty: 'facil' },
      { id: 'o8', text: 'Liquidificador', difficulty: 'medio' },
      { id: 'o9', text: 'Aspirador', difficulty: 'medio' },
      { id: 'o10', text: 'Abajur', difficulty: 'medio' },
      { id: 'o11', text: 'Ralador', difficulty: 'dificil' },
      { id: 'o12', text: 'Espremedor', difficulty: 'medio' },
    ],
  },
  {
    id: 'natureza',
    name: 'Natureza',
    icon: '🌿',
    words: [
      { id: 'n1', text: 'Cachoeira', difficulty: 'facil' },
      { id: 'n2', text: 'Montanha', difficulty: 'facil' },
      { id: 'n3', text: 'Vulcão', difficulty: 'facil' },
      { id: 'n4', text: 'Arco-íris', difficulty: 'facil' },
      { id: 'n5', text: 'Tempestade', difficulty: 'facil' },
      { id: 'n6', text: 'Tsunami', difficulty: 'medio' },
      { id: 'n7', text: 'Aurora Boreal', difficulty: 'medio' },
      { id: 'n8', text: 'Terremoto', difficulty: 'medio' },
      { id: 'n9', text: 'Tornado', difficulty: 'medio' },
      { id: 'n10', text: 'Géiser', difficulty: 'dificil' },
      { id: 'n11', text: 'Estalactite', difficulty: 'dificil' },
      { id: 'n12', text: 'Recife de Coral', difficulty: 'medio' },
    ],
  },
  {
    id: 'festas',
    name: 'Festas e Celebrações',
    icon: '🎉',
    words: [
      { id: 'fe1', text: 'Carnaval', difficulty: 'facil' },
      { id: 'fe2', text: 'Casamento', difficulty: 'facil' },
      { id: 'fe3', text: 'Aniversário', difficulty: 'facil' },
      { id: 'fe4', text: 'Natal', difficulty: 'facil' },
      { id: 'fe5', text: 'Festa Junina', difficulty: 'facil' },
      { id: 'fe6', text: 'Réveillon', difficulty: 'medio' },
      { id: 'fe7', text: 'Páscoa', difficulty: 'facil' },
      { id: 'fe8', text: 'Halloween', difficulty: 'medio' },
      { id: 'fe9', text: 'Chá de Bebê', difficulty: 'medio' },
      { id: 'fe10', text: 'Formatura', difficulty: 'medio' },
      { id: 'fe11', text: 'Batizado', difficulty: 'medio' },
    ],
  },
  {
    id: 'herois',
    name: 'Super-Heróis',
    icon: '🦸',
    words: [
      { id: 'h1', text: 'Homem-Aranha', difficulty: 'facil' },
      { id: 'h2', text: 'Batman', difficulty: 'facil' },
      { id: 'h3', text: 'Superman', difficulty: 'facil' },
      { id: 'h4', text: 'Mulher Maravilha', difficulty: 'facil' },
      { id: 'h5', text: 'Homem de Ferro', difficulty: 'facil' },
      { id: 'h6', text: 'Capitão América', difficulty: 'facil' },
      { id: 'h7', text: 'Thor', difficulty: 'facil' },
      { id: 'h8', text: 'Hulk', difficulty: 'facil' },
      { id: 'h9', text: 'Pantera Negra', difficulty: 'medio' },
      { id: 'h10', text: 'Aquaman', difficulty: 'medio' },
      { id: 'h11', text: 'Gavião Arqueiro', difficulty: 'medio' },
      { id: 'h12', text: 'Visão', difficulty: 'dificil' },
    ],
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    words: [
      { id: 'g1', text: 'Minecraft', difficulty: 'facil' },
      { id: 'g2', text: 'Mario', difficulty: 'facil' },
      { id: 'g3', text: 'Fortnite', difficulty: 'facil' },
      { id: 'g4', text: 'Pokémon', difficulty: 'facil' },
      { id: 'g5', text: 'FIFA', difficulty: 'facil' },
      { id: 'g6', text: 'GTA', difficulty: 'facil' },
      { id: 'g7', text: 'Call of Duty', difficulty: 'medio' },
      { id: 'g8', text: 'League of Legends', difficulty: 'medio' },
      { id: 'g9', text: 'Counter-Strike', difficulty: 'medio' },
      { id: 'g10', text: 'Zelda', difficulty: 'medio' },
      { id: 'g11', text: 'Dark Souls', difficulty: 'dificil' },
      { id: 'g12', text: 'Elden Ring', difficulty: 'dificil' },
    ],
  },
];

export function getAllThemes(customThemes: Theme[] = []): Theme[] {
  // Custom themes with same ID override default themes
  const customIds = new Set(customThemes.map(t => t.id));
  const defaultsNotOverridden = DEFAULT_THEMES.filter(t => !customIds.has(t.id));
  return [...defaultsNotOverridden, ...customThemes.map(t => ({ ...t, isCustom: true }))];
}

// Check if a theme ID is a default theme
export function isDefaultThemeId(themeId: string): boolean {
  return DEFAULT_THEMES.some(t => t.id === themeId);
}

// Get the original default theme by ID
export function getDefaultTheme(themeId: string): Theme | undefined {
  return DEFAULT_THEMES.find(t => t.id === themeId);
}

export function getWordsByFilter(
  themes: Theme[],
  selectedThemeIds: string[],
  difficulty: 'facil' | 'medio' | 'dificil' | 'todos'
): { id: string; text: string; difficulty: string; themeId: string; themeName: string }[] {
  const selectedThemes = selectedThemeIds.length > 0
    ? themes.filter(t => selectedThemeIds.includes(t.id))
    : themes;

  const words: { id: string; text: string; difficulty: string; themeId: string; themeName: string }[] = [];

  for (const theme of selectedThemes) {
    for (const word of theme.words) {
      if (difficulty === 'todos' || word.difficulty === difficulty) {
        words.push({
          ...word,
          themeId: theme.id,
          themeName: theme.name,
        });
      }
    }
  }

  return words;
}

export function countAvailableWords(
  themes: Theme[],
  selectedThemeIds: string[],
  difficulty: 'facil' | 'medio' | 'dificil' | 'todos'
): number {
  return getWordsByFilter(themes, selectedThemeIds, difficulty).length;
}
