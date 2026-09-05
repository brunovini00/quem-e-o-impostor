import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { themes } from '../src/data/themes';
import {
  APPROVED_THEME_IDS,
  MINIMUM_WORDS_PER_THEME,
  normalizeWord,
  validateBanks,
  validateTheme,
} from '../scripts/word-validation.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureTheme = (words: unknown[], overrides: Record<string, unknown> = {}) => ({
  id: 'fixture',
  name: 'Tema de teste',
  emoji: '🧪',
  description: 'Somente para verificar a validação.',
  words,
  ...overrides,
});
const word = (text: string, difficulty = 'easy') => ({ text, difficulty });

describe('normalização do conteúdo', () => {
  it('normaliza caixa, acentos, Unicode e espaços', () => {
    expect(normalizeWord('  AÇAÍ   com LEITE  ')).toBe('acai com leite');
    expect(normalizeWord('Ca\u0301fe\u0301')).toBe('cafe');
    expect(normalizeWord('Chá\u00a0verde')).toBe('cha verde');
  });

  it('preserva pontuação significativa em nomes compostos', () => {
    expect(normalizeWord('Homem-Aranha')).toBe('homem-aranha');
    expect(normalizeWord('R&B')).toBe('r&b');
  });
});

describe('entradas e contagem por tema', () => {
  it('conta somente entradas válidas únicas depois de normalizar', () => {
    const result = validateTheme(
      fixtureTheme([
        word('Chá verde'),
        word(' CHÁ   VERDE '),
        word('Café', 'medium'),
        word('Leite', 'hard'),
      ]),
      { minimumWords: 3 },
    );
    expect(result.totalEntries).toBe(4);
    expect(result.validUniqueWords).toBe(3);
    expect(result.duplicates).toEqual([
      expect.objectContaining({ normalized: 'cha verde', firstIndex: 0, index: 1 }),
    ]);
    expect(result.difficulties).toEqual({ easy: 1, medium: 1, hard: 1 });
    expect(result.meetsMinimum).toBe(true);
    expect(result.integrityPassed).toBe(false);
  });

  it('valida metadados, identificador e formato do banco', () => {
    const result = validateTheme({ id: 'Inválido com espaço', words: {} });
    expect(result.integrityPassed).toBe(false);
    expect(result.errors).toHaveLength(5);
    expect(result.validUniqueWords).toBe(0);
  });

  it('rejeita entrada vazia, não objeto, numérica, enorme e dificuldade desconhecida', () => {
    const result = validateTheme(
      fixtureTheme([
        null,
        'Texto solto',
        {},
        word('   '),
        word('123'),
        word('A'.repeat(121)),
        word('Árvore', 'facil'),
      ]),
    );
    expect(result.invalidEntries).toHaveLength(7);
    expect(result.validUniqueWords).toBe(0);
  });

  it('rejeita preenchimento numerado e marcadores de trabalho', () => {
    const result = validateTheme(
      fixtureTheme([
        word('palavra 001'),
        word('WORD-002'),
        word('Item_023'),
        word('termo123'),
        word('Placeholder'),
        word('TODO'),
        word('Lorem ipsum dolor sit amet'),
      ]),
    );
    expect(result.invalidEntries).toHaveLength(7);
    expect(result.validUniqueWords).toBe(0);
  });

  it('não confunde substantivos naturais com placeholders', () => {
    const result = validateTheme(fixtureTheme([word('Teste'), word('Entrada')]));
    expect(result.invalidEntries).toHaveLength(0);
    expect(result.validUniqueWords).toBe(2);
  });

  it('detecta caracteres invisíveis e letras de outro alfabeto parecidas com latinas', () => {
    const result = validateTheme(fixtureTheme([word('Caf\u200bé'), word('Boi\u0430r')]));
    expect(result.invalidEntries).toHaveLength(2);
  });

  it('aceita subtipo opcional válido e rejeita metadado malformado', () => {
    const result = validateTheme(
      fixtureTheme([
        { ...word('Samba'), subtype: 'ritmo' },
        { ...word('Violão'), subtype: '' },
        { ...word('Piano'), subtype: 8 },
      ]),
    );
    expect(result.validUniqueWords).toBe(1);
    expect(result.invalidEntries).toHaveLength(2);
  });

  it('não inclui entrada com dificuldade inválida no mínimo', () => {
    const result = validateTheme(fixtureTheme([word('Banana'), word('Maçã', 'desconhecida')]), {
      minimumWords: 2,
    });
    expect(result.validUniqueWords).toBe(1);
    expect(result.missingWords).toBe(1);
    expect(result.meetsMinimum).toBe(false);
  });

  it('rejeita metas inválidas na API de fixtures', () => {
    expect(() => validateTheme(fixtureTheme([]), { minimumWords: 0 })).toThrow(RangeError);
    expect(() => validateTheme(fixtureTheme([]), { minimumWords: 1.5 })).toThrow(RangeError);
  });
});

describe('catálogo aprovado e meta obrigatória', () => {
  it('mantém todos os 25 temas aprovados e a meta de 1.000', () => {
    expect(MINIMUM_WORDS_PER_THEME).toBe(1000);
    expect(APPROVED_THEME_IDS).toHaveLength(25);
    expect(themes.map((theme) => theme.id)).toEqual(APPROVED_THEME_IDS);
  });

  it('comprova a integridade do material editorial instalado', () => {
    const report = validateBanks(themes, { integrityOnly: true });
    expect(report.integrityPassed).toBe(true);
    expect(report.passed).toBe(true);
    expect(report.themes.every((theme) => theme.invalidEntries.length === 0)).toBe(true);
    expect(report.themes.every((theme) => theme.duplicates.length === 0)).toBe(true);
    expect(report.totalValidUniqueWords).toBe(
      themes.reduce((sum, theme) => sum + theme.words.length, 0),
    );
  });

  it('rejeita banco deficiente no modo obrigatório, sem relaxar a meta nas fixtures', () => {
    const fixture = [fixtureTheme([word('Maçã')])];
    const options = { expectedThemeIds: ['fixture'] };
    const strict = validateBanks(fixture, options);
    const integrity = validateBanks(fixture, { ...options, integrityOnly: true });
    expect(strict.passed).toBe(false);
    expect(strict.strictPassed).toBe(false);
    expect(strict.totalMissingWords).toBe(999);
    expect(integrity.passed).toBe(true);
    expect(integrity.strictPassed).toBe(false);
    expect(integrity.minimumWordsPerTheme).toBe(1000);
  });

  it('aprova um fixture quando o mínimo configurado para o teste é realmente cumprido', () => {
    const report = validateBanks([fixtureTheme([word('Maçã'), word('Banana')])], {
      expectedThemeIds: ['fixture'],
      minimumWords: 2,
    });
    expect(report.strictPassed).toBe(true);
    expect(report.totalMissingWords).toBe(0);
  });

  it('rejeita remoção de tema aprovado mesmo no modo de integridade', () => {
    const report = validateBanks(themes.slice(1), { integrityOnly: true });
    expect(report.passed).toBe(false);
    expect(report.globalErrors).toContain('Tema aprovado ausente: comidas.');
  });

  it('rejeita identificador duplicado e tema não aprovado', () => {
    const report = validateBanks(
      [
        fixtureTheme([word('Maçã')]),
        fixtureTheme([word('Banana')]),
        fixtureTheme([word('Pera')], { id: 'extra' }),
      ],
      { expectedThemeIds: ['fixture'], integrityOnly: true },
    );
    expect(report.passed).toBe(false);
    expect(report.globalErrors).toContain('Identificador de tema duplicado: fixture.');
    expect(report.globalErrors).toContain('Tema sem aprovação no catálogo: extra.');
  });

  it('permite repetição entre temas porque a regra de unicidade é interna', () => {
    const report = validateBanks(
      [
        fixtureTheme([word('Maçã')], { id: 'primeiro' }),
        fixtureTheme([word('Maçã')], { id: 'segundo' }),
      ],
      { expectedThemeIds: ['primeiro', 'segundo'], minimumWords: 1 },
    );
    expect(report.passed).toBe(true);
    expect(report.totalValidUniqueWords).toBe(2);
  });

  it('não aprova um catálogo ausente', () => {
    const report = validateBanks(null, { integrityOnly: true });
    expect(report.passed).toBe(false);
    expect(report.totalMissingWords).toBe(25000);
  });
});

const temporaryRoots: string[] = [];
function makeCliFixture() {
  const destination = mkdtempSync(join(tmpdir(), 'impostor-word-validation-'));
  temporaryRoots.push(destination);
  mkdirSync(join(destination, 'scripts'), { recursive: true });
  mkdirSync(join(destination, 'src', 'data', 'words'), { recursive: true });
  for (const file of ['validate-words.mjs', 'word-validation.mjs']) {
    copyFileSync(join(root, 'scripts', file), join(destination, 'scripts', file));
  }
  const catalog = APPROVED_THEME_IDS.map((id: string) => ({
    id,
    name: id,
    emoji: '🧪',
    description: 'Fixture do CLI.',
    file: `${id}.json`,
  }));
  writeFileSync(join(destination, 'src', 'data', 'catalog.json'), JSON.stringify(catalog));
  for (const theme of catalog) {
    writeFileSync(
      join(destination, 'src', 'data', 'words', theme.file),
      JSON.stringify([word('Sinal')]),
    );
  }
  return destination;
}

afterAll(() => {
  const allowedPrefix = `${resolve(tmpdir())}${sep}impostor-word-validation-`;
  for (const temporaryRoot of temporaryRoots) {
    const absolute = resolve(temporaryRoot);
    if (!absolute.startsWith(allowedPrefix))
      throw new Error('Diretório de teste fora da raiz temporária.');
    rmSync(absolute, { recursive: true, force: true });
  }
});

describe('CLI de validação', () => {
  it('retorna código 1 para quantidade insuficiente e grava a verdade nos relatórios', () => {
    const destination = makeCliFixture();
    const result = spawnSync(
      process.execPath,
      [join(destination, 'scripts', 'validate-words.mjs')],
      {
        cwd: destination,
        encoding: 'utf8',
      },
    );
    expect(result.status).toBe(1);
    const report = JSON.parse(readFileSync(join(destination, 'docs', 'word-report.json'), 'utf8'));
    expect(report.totalValidUniqueWords).toBe(25);
    expect(report.totalMissingWords).toBe(24975);
    expect(report.strictPassed).toBe(false);
    expect(readFileSync(join(destination, 'docs', 'word-report.md'), 'utf8')).toContain(
      'REPROVADO',
    );
  });

  it('modo de integridade retorna 0 mas não altera o resultado da meta obrigatória', () => {
    const destination = makeCliFixture();
    const output = execFileSync(
      process.execPath,
      [join(destination, 'scripts', 'validate-words.mjs'), '--integrity-only'],
      { cwd: destination, encoding: 'utf8' },
    );
    expect(output).toContain('não aprova o mínimo obrigatório');
    const report = JSON.parse(readFileSync(join(destination, 'docs', 'word-report.json'), 'utf8'));
    expect(report.passed).toBe(true);
    expect(report.strictPassed).toBe(false);
    expect(report.minimumWordsPerTheme).toBe(1000);
  });

  it('reporta arquivo ausente e JSON malformado sem aceitar o catálogo', () => {
    const destination = makeCliFixture();
    unlinkSync(join(destination, 'src', 'data', 'words', 'comidas.json'));
    writeFileSync(join(destination, 'src', 'data', 'words', 'bebidas.json'), '{');
    const result = spawnSync(
      process.execPath,
      [join(destination, 'scripts', 'validate-words.mjs'), '--integrity-only'],
      { cwd: destination, encoding: 'utf8' },
    );
    expect(result.status).toBe(1);
    const report = JSON.parse(readFileSync(join(destination, 'docs', 'word-report.json'), 'utf8'));
    expect(report.integrityPassed).toBe(false);
    expect(report.globalErrors).toHaveLength(2);
  });

  it('não oferece flag para diminuir a meta do build', () => {
    const destination = makeCliFixture();
    const result = spawnSync(
      process.execPath,
      [join(destination, 'scripts', 'validate-words.mjs'), '--minimum=1'],
      { cwd: destination, encoding: 'utf8' },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Uso:');
  });
});
