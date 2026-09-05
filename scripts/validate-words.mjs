import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { APPROVED_THEME_IDS, validateBanks } from './word-validation.mjs';

const allowedFlags = new Set(['--integrity-only']);
const flags = process.argv.slice(2);
if (flags.some((flag) => !allowedFlags.has(flag))) {
  console.error('Uso: node scripts/validate-words.mjs [--integrity-only]');
  process.exitCode = 2;
} else {
  const integrityOnly = flags.includes('--integrity-only');
  const root = new URL('../', import.meta.url);
  const loadingErrors = [];
  let catalog = [];
  try {
    const parsed = JSON.parse(await readFile(new URL('src/data/catalog.json', root), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Catálogo não é um array.');
    catalog = parsed;
  } catch (error) {
    loadingErrors.push(`Não foi possível carregar o catálogo: ${error.message}`);
  }
  const banks = [];
  for (const metadata of catalog) {
    if (
      typeof metadata?.id !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id) ||
      metadata.file !== `${metadata.id}.json`
    ) {
      loadingErrors.push('Metadado de arquivo inválido no catálogo.');
      banks.push({ ...metadata, words: null });
      continue;
    }
    try {
      const words = JSON.parse(
        await readFile(new URL(`src/data/words/${metadata.file}`, root), 'utf8'),
      );
      banks.push({ ...metadata, words });
    } catch (error) {
      loadingErrors.push(`Não foi possível carregar ${metadata.id}: ${error.message}`);
      banks.push({ ...metadata, words: null });
    }
  }
  try {
    const files = await readdir(new URL('src/data/words/', root));
    const approvedFiles = new Set(APPROVED_THEME_IDS.map((id) => `${id}.json`));
    for (const file of files) {
      if (file.endsWith('.json') && !approvedFiles.has(file)) {
        loadingErrors.push(`Banco sem tema aprovado: ${file}.`);
      }
    }
  } catch (error) {
    loadingErrors.push(`Não foi possível listar os bancos: ${error.message}`);
  }
  const report = validateBanks(banks, { integrityOnly });
  report.globalErrors.push(...loadingErrors);
  if (loadingErrors.length > 0) {
    report.integrityPassed = false;
    report.strictPassed = false;
    report.passed = false;
  }
  const escapeCell = (text) =>
    String(text)
      .replace(/\|/g, '\\|')
      .replace(/[\r\n]+/g, ' ');
  const markdown = [
    '# Relatório dos bancos de palavras',
    '',
    `Validação executada no modo: **${report.checkedMode}**.`,
    '',
    `Meta aprovada: **${report.minimumWordsPerTheme} entradas válidas e únicas em cada um dos ${report.expectedThemeCount} temas**.`,
    '',
    `Total atual: **${report.totalValidUniqueWords} entradas válidas, somadas entre os ${report.actualThemeCount} temas**. A unicidade é verificada dentro de cada tema. Déficit: **${report.totalMissingWords} entradas**.`,
    '',
    `Integridade: **${report.integrityPassed ? 'APROVADA' : 'REPROVADA'}**. Critério obrigatório completo: **${report.strictPassed ? 'APROVADO' : 'REPROVADO'}**.`,
    '',
    '| Tema | Entradas | Válidas únicas | Faltam | Inválidas | Duplicatas | Fáceis | Médias | Difíceis |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.themes.map(
      (theme) =>
        `| ${escapeCell(theme.name)} | ${theme.totalEntries} | ${theme.validUniqueWords} | ${theme.missingWords} | ${theme.invalidEntries.length} | ${theme.duplicates.length} | ${theme.difficulties.easy} | ${theme.difficulties.medium} | ${theme.difficulties.hard} |`,
    ),
    '',
    '## Limites da verificação',
    '',
    ...report.limitations.map((limitation) => `- ${limitation}`),
    '',
    'A origem, o método editorial e as opções de ampliação estão em [content-notes.md](content-notes.md). O relatório estruturado completo está em [word-report.json](word-report.json).',
    '',
    '## Erros encontrados',
    '',
    ...(report.globalErrors.length > 0
      ? report.globalErrors.map((error) => `- ${error}`)
      : ['Nenhum erro global de estrutura.']),
    ...report.themes.flatMap((theme) => [
      ...theme.errors.map((error) => `- ${theme.id}: ${error}`),
      ...theme.invalidEntries.map(
        (entry) => `- ${theme.id}, entrada ${entry.index + 1}: ${entry.reasons.join(' ')}`,
      ),
      ...theme.duplicates.map(
        (entry) =>
          `- ${theme.id}: ${escapeCell(entry.text)} duplica a entrada ${entry.firstIndex + 1}.`,
      ),
    ]),
    '',
    report.strictPassed
      ? 'Todos os critérios automáticos de conteúdo foram atendidos; a revisão editorial permanece necessária para novas inclusões.'
      : 'A meta de 1.000 entradas por tema permanece pendente. A publicação web do banco inicial foi autorizada pelo usuário e exige integridade aprovada; o build completo e a validação estrita continuam exigindo a meta original.',
    '',
  ].join('\n');
  await mkdir(new URL('docs/', root), { recursive: true });
  await writeFile(new URL('docs/word-report.json', root), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(new URL('docs/word-report.md', root), markdown);
  console.log(
    `Temas: ${report.actualThemeCount}/${report.expectedThemeCount}. Entradas válidas únicas por tema, somadas: ${report.totalValidUniqueWords}.`,
  );
  console.log(
    `Integridade: ${report.integrityPassed ? 'aprovada' : 'reprovada'}. Meta de 1.000/tema: ${report.strictPassed ? 'aprovada' : 'NÃO ATENDIDA'}. Déficit: ${report.totalMissingWords}.`,
  );
  if (integrityOnly)
    console.log('Este comando verifica integridade somente; não aprova o mínimo obrigatório.');
  console.log('Relatórios: docs/word-report.md e docs/word-report.json.');
  process.exitCode = report.passed ? 0 : 1;
}
