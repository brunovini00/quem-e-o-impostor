/** Regras puras compartilhadas pelo CLI e pelos testes. */
export const MINIMUM_WORDS_PER_THEME = 1000;

// A aprovação do usuário foi manter todos os temas. Esta lista impede que a
// remoção de um arquivo ou de uma linha do catálogo faça a meta passar.
export const APPROVED_THEME_IDS = Object.freeze([
  'comidas',
  'bebidas',
  'ingredientes',
  'animais',
  'objetos',
  'profissoes',
  'lugares',
  'paises-cidades',
  'filmes',
  'series-tv',
  'desenhos',
  'personagens',
  'personalidades',
  'esportes',
  'jogos',
  'musica',
  'tecnologia',
  'natureza',
  'transportes',
  'escola',
  'corpo-saude',
  'moda',
  'casa',
  'festas',
  'acoes',
]);

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const PLACEHOLDER =
  /^(?:(?:palavra|word|item|termo|entrada|exemplo|teste|tema)[\s_-]*\d+|placeholder(?:[\s_-]*\d+)?|todo|tbd|n\/?a|null|undefined)$/;

/** @param {string} text */
export function normalizeWord(text) {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/gu, ' ')
    .trim();
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonemptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function entryErrors(entry) {
  if (!isRecord(entry)) return ['A entrada precisa ser um objeto.'];
  const errors = [];
  if (!isNonemptyText(entry.text)) {
    errors.push('Texto ausente ou vazio.');
  } else {
    const normalized = normalizeWord(entry.text);
    if (entry.text.length > 120) errors.push('Texto acima de 120 caracteres.');
    if (!/\p{Script=Latin}/u.test(entry.text)) errors.push('Texto sem letras latinas.');
    if (/\p{L}/u.test(entry.text.replace(/\p{Script=Latin}/gu, ''))) {
      errors.push('Letra não latina: revisar grafia em português e caracteres semelhantes.');
    }
    if (/[\p{Cc}\p{Cf}]/u.test(entry.text)) errors.push('Caractere de controle ou invisível.');
    if (PLACEHOLDER.test(normalized) || /\blorem ipsum\b/.test(normalized)) {
      errors.push('Texto de preenchimento ou placeholder.');
    }
  }
  if (!DIFFICULTIES.has(entry.difficulty))
    errors.push('Dificuldade deve ser easy, medium ou hard.');
  if ('subtype' in entry && (!isNonemptyText(entry.subtype) || entry.subtype.length > 80)) {
    errors.push('Subtipo precisa ser um texto não vazio de até 80 caracteres.');
  }
  return errors;
}

/** Valida estrutura, normalização e quantidade de um tema; não julga semântica. */
export function validateTheme(theme, { minimumWords = MINIMUM_WORDS_PER_THEME } = {}) {
  if (!Number.isInteger(minimumWords) || minimumWords < 1) {
    throw new RangeError('A meta precisa ser um inteiro positivo.');
  }
  const metadata = isRecord(theme) ? theme : {};
  const errors = [];
  if (!isNonemptyText(metadata.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id)) {
    errors.push('Identificador de tema inválido.');
  }
  for (const field of ['name', 'emoji', 'description']) {
    if (!isNonemptyText(metadata[field])) errors.push(`Metadado obrigatório ausente: ${field}.`);
  }
  const words = Array.isArray(metadata.words) ? metadata.words : [];
  if (!Array.isArray(metadata.words)) errors.push('O banco precisa ser um array.');
  const invalidEntries = [];
  const duplicates = [];
  const normalizedSeen = new Map();
  const validSeen = new Set();
  const difficulties = { easy: 0, medium: 0, hard: 0 };
  let validEntries = 0;
  for (const [index, entry] of words.entries()) {
    const reasons = entryErrors(entry);
    const text = isRecord(entry) && typeof entry.text === 'string' ? entry.text : null;
    const normalized = text === null ? '' : normalizeWord(text);
    if (normalized) {
      if (normalizedSeen.has(normalized)) {
        duplicates.push({ text, normalized, index, firstIndex: normalizedSeen.get(normalized) });
      } else {
        normalizedSeen.set(normalized, index);
      }
    }
    if (reasons.length > 0) {
      invalidEntries.push({ index, text, reasons });
    } else {
      validEntries += 1;
      if (!validSeen.has(normalized)) {
        validSeen.add(normalized);
        difficulties[entry.difficulty] += 1;
      }
    }
  }
  const validUniqueWords = validSeen.size;
  return {
    id: typeof metadata.id === 'string' ? metadata.id : '(sem id)',
    name: typeof metadata.name === 'string' ? metadata.name : '(sem nome)',
    totalEntries: words.length,
    validEntries,
    validUniqueWords,
    minimumWords,
    missingWords: Math.max(0, minimumWords - validUniqueWords),
    meetsMinimum: validUniqueWords >= minimumWords,
    difficulties,
    invalidEntries,
    duplicates,
    errors,
    integrityPassed: errors.length === 0 && invalidEntries.length === 0 && duplicates.length === 0,
  };
}

/**
 * integrityOnly altera apenas o resultado do comando, nunca strictPassed/meta.
 * expectedThemeIds é configurável só na API pura para fixtures de teste.
 */
export function validateBanks(
  banks,
  {
    integrityOnly = false,
    minimumWords = MINIMUM_WORDS_PER_THEME,
    expectedThemeIds = APPROVED_THEME_IDS,
  } = {},
) {
  const globalErrors = [];
  if (!Array.isArray(banks)) globalErrors.push('O catálogo precisa ser um array.');
  const themes = (Array.isArray(banks) ? banks : []).map((bank) =>
    validateTheme(bank, { minimumWords }),
  );
  const seenIds = new Set();
  const expected = new Set(expectedThemeIds);
  for (const theme of themes) {
    if (seenIds.has(theme.id)) globalErrors.push(`Identificador de tema duplicado: ${theme.id}.`);
    seenIds.add(theme.id);
    if (!expected.has(theme.id)) globalErrors.push(`Tema sem aprovação no catálogo: ${theme.id}.`);
  }
  for (const id of expected) {
    if (!seenIds.has(id)) globalErrors.push(`Tema aprovado ausente: ${id}.`);
  }
  const integrityPassed =
    globalErrors.length === 0 && themes.every((theme) => theme.integrityPassed);
  const quantityPassed =
    themes.length === expected.size && themes.every((theme) => theme.meetsMinimum);
  const strictPassed = integrityPassed && quantityPassed;
  return {
    schemaVersion: 1,
    checkedMode: integrityOnly ? 'integrity-only' : 'required-minimum',
    minimumWordsPerTheme: minimumWords,
    expectedThemeCount: expected.size,
    actualThemeCount: themes.length,
    totalEntries: themes.reduce((sum, theme) => sum + theme.totalEntries, 0),
    totalValidUniqueWords: themes.reduce((sum, theme) => sum + theme.validUniqueWords, 0),
    totalMissingWords:
      themes.reduce((sum, theme) => sum + theme.missingWords, 0) +
      [...expected].filter((id) => !seenIds.has(id)).length * minimumWords,
    integrityPassed,
    quantityPassed,
    strictPassed,
    passed: integrityOnly ? integrityPassed : strictPassed,
    globalErrors,
    themes,
    limitations: [
      'Unicidade verificada dentro de cada tema; uma palavra pode aparecer em temas diferentes.',
      'A verificação automática não comprova pertinência temática, familiaridade cultural, equivalência semântica ou ausência de variantes artificiais.',
      'A classificação de dificuldade é editorial e ainda precisa de avaliação com grupos de jogadores.',
      'O modo integrity-only não atende nem altera a exigência de 1.000 entradas por tema.',
    ],
  };
}
