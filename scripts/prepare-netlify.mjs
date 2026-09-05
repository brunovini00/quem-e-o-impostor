import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const textExtensions = new Set(['.js', '.mjs', '.cjs', '.html', '.css', '.json', '.map']);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Link simbólico inesperado na exportação: ${path}`);
    }
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function replaceReference(text, source, target) {
  const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match a complete local URL, including optional query/hash, never a URL prefix
  // or the same pathname embedded in an external origin.
  const expression = new RegExp('(^|["\'`(=\\s])' + escaped + '(?=["\'`\\s)<>?#]|$)', 'g');
  return text.replace(expression, (_, prefix) => prefix + target);
}

async function prepare(directory) {
  let details;
  try {
    details = await stat(directory);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error(
      `Exportação ausente: ${directory}. Execute expo export --platform web primeiro.`,
    );
  }
  if (!details.isDirectory()) throw new Error(`A exportação deve ser um diretório: ${directory}`);

  const files = await listFiles(directory);
  const copies = new Map();
  const replacements = new Map();
  const hiddenAssets = new Set();
  for (const file of files) {
    const segments = relative(directory, file).split(sep);
    if (segments[0] !== 'assets' || !segments.some((segment) => segment.startsWith('.'))) continue;
    const extension = extname(file).toLowerCase();
    if (extension && !/^\.[a-z0-9]+$/.test(extension)) {
      throw new Error(`Extensão de asset não suportada: ${file}`);
    }
    const bytes = await readFile(file);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const publicPath = `/assets/netlify/${hash}${extension}`;
    const destination = resolve(directory, `.${publicPath}`);
    const planned = copies.get(destination);
    if (planned && !planned.equals(bytes)) throw new Error(`Colisão entre assets: ${destination}`);
    copies.set(destination, bytes);
    hiddenAssets.add(file);

    const sourcePath = `/${segments.join('/')}`;
    for (const source of new Set([sourcePath, encodeURI(sourcePath)])) {
      replacements.set(source, publicPath);
      replacements.set(source.replaceAll('/', '\\/'), publicPath.replaceAll('/', '\\/'));
    }
  }

  // Validate every existing destination before modifying any export file.
  const missing = [];
  for (const [destination, bytes] of copies) {
    try {
      const existing = await readFile(destination);
      if (!existing.equals(bytes)) {
        throw new Error(
          `Colisão no asset público: ${destination}. Exporte novamente antes de publicar.`,
        );
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      missing.push([destination, bytes]);
    }
  }
  for (const [destination, bytes] of missing) {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { flag: 'wx' });
  }

  let updated = 0;
  for (const file of files) {
    if (hiddenAssets.has(file) || !textExtensions.has(extname(file).toLowerCase())) continue;
    const original = await readFile(file, 'utf8');
    let prepared = original;
    for (const [source, target] of replacements)
      prepared = replaceReference(prepared, source, target);
    if (prepared !== original) {
      await writeFile(file, prepared);
      updated += 1;
    }
  }
  console.info(
    `Netlify: ${copies.size} assets em caminhos públicos; ${updated} arquivos atualizados.`,
  );
}

try {
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--dir')) {
    throw new Error('Uso: node scripts/prepare-netlify.mjs [--dir <diretório exportado>]');
  }
  await prepare(args.length ? resolve(args[1]) : resolve(scriptDirectory, '../dist'));
} catch (error) {
  console.error(`Não foi possível preparar o Netlify: ${error.message}`);
  process.exitCode = 1;
}
