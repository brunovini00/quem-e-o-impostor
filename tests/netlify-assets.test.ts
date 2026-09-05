import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const script = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/prepare-netlify.mjs');
const temporaryRoots: string[] = [];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'impostor-netlify-assets-'));
  temporaryRoots.push(root);
  return root;
}

function put(root: string, path: string, contents: string | Buffer) {
  const destination = join(root, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents);
}

function run(root: string) {
  return spawnSync(process.execPath, [script, '--dir', root], { encoding: 'utf8' });
}

function publicPath(bytes: Buffer, extension = '.ttf') {
  return `/assets/netlify/${createHash('sha256').update(bytes).digest('hex')}${extension}`;
}

afterAll(() => {
  const prefix = `${resolve(tmpdir())}${sep}impostor-netlify-assets-`;
  for (const root of temporaryRoots) {
    const absolute = resolve(root);
    if (!absolute.startsWith(prefix))
      throw new Error('Fixture fora do diretório temporário permitido.');
    rmSync(absolute, { recursive: true, force: true });
  }
});

describe('preparação dos assets estáticos para Netlify', () => {
  it('preserva os bytes e originais, atualiza referências completas e pode ser repetida', () => {
    const root = fixture();
    const bytes = Buffer.from([0, 255, 128, 4, 0, 13, 10]);
    const source = '/assets/node_modules/.pnpm/pacote/Fonts/Ionicons.ttf';
    const target = publicPath(bytes);
    put(root, source, bytes);
    put(root, '_expo/web.js', `const font="${source}";const other="${source}.backup";`);
    put(
      root,
      'index.html',
      `<link href="${source}?v=1#font"><a href="https://example.com${source}">`,
    );
    put(root, 'styles.css', `@font-face{src:url(${source})}`);
    put(root, 'metadata.json', JSON.stringify({ font: source }).replaceAll('/', '\\/'));
    const first = run(root);
    expect(first.status, first.stderr).toBe(0);
    expect(readFileSync(join(root, target))).toEqual(bytes);
    expect(readFileSync(join(root, source))).toEqual(bytes);
    expect(readFileSync(join(root, '_expo/web.js'), 'utf8')).toBe(
      `const font="${target}";const other="${source}.backup";`,
    );
    expect(readFileSync(join(root, 'index.html'), 'utf8')).toBe(
      `<link href="${target}?v=1#font"><a href="https://example.com${source}">`,
    );
    expect(readFileSync(join(root, 'styles.css'), 'utf8')).toBe(`@font-face{src:url(${target})}`);
    expect(JSON.parse(readFileSync(join(root, 'metadata.json'), 'utf8'))).toEqual({ font: target });
    const second = run(root);
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain('0 arquivos atualizados');
    expect(readdirSync(join(root, 'assets/netlify'))).toHaveLength(1);
  });

  it('não confunde assets de mesmo nome e reutiliza o destino de conteúdo idêntico', () => {
    const root = fixture();
    const first = Buffer.from('fonte um');
    const second = Buffer.from('fonte dois');
    const paths = ['/assets/.a/font.ttf', '/assets/.b/font.ttf', '/assets/.c/font.ttf'];
    put(root, paths[0]!, first);
    put(root, paths[1]!, second);
    put(root, paths[2]!, first);
    put(root, 'fonts.json', JSON.stringify(paths));
    const result = run(root);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(readFileSync(join(root, 'fonts.json'), 'utf8'))).toEqual([
      publicPath(first),
      publicPath(second),
      publicPath(first),
    ]);
    expect(readdirSync(join(root, 'assets/netlify'))).toHaveLength(2);
    expect(readFileSync(join(root, publicPath(first)))).toEqual(first);
    expect(readFileSync(join(root, publicPath(second)))).toEqual(second);
  });

  it('falha sem sobrescrever destino conflitante ou referências', () => {
    const root = fixture();
    const bytes = Buffer.from('fonte correta');
    const source = '/assets/.pnpm/font.ttf';
    const original = JSON.stringify({ font: source });
    put(root, source, bytes);
    put(root, publicPath(bytes), 'conteúdo conflitante');
    put(root, 'metadata.json', original);
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Colisão no asset público');
    expect(readFileSync(join(root, publicPath(bytes)), 'utf8')).toBe('conteúdo conflitante');
    expect(readFileSync(join(root, 'metadata.json'), 'utf8')).toBe(original);
  });

  it('mantém exportação sem assets ocultos intacta e não copia arquivos ocultos fora de assets', () => {
    const root = fixture();
    put(root, 'index.html', '<script src="/bundle.js"></script>');
    put(root, 'bundle.js', 'const font="/assets/fonts/regular.ttf";');
    put(root, 'assets/fonts/regular.ttf', Buffer.from([255, 0]));
    put(root, '.internal/info.txt', 'não publicar');
    const result = run(root);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('0 assets em caminhos públicos; 0 arquivos atualizados');
    expect(readdirSync(join(root, 'assets'))).toEqual(['fonts']);
    expect(readFileSync(join(root, 'bundle.js'), 'utf8')).toBe(
      'const font="/assets/fonts/regular.ttf";',
    );
    expect(readFileSync(join(root, 'assets/fonts/regular.ttf'))).toEqual(Buffer.from([255, 0]));
  });

  it('atualiza URLs codificadas e conserva a extensão do asset', () => {
    const root = fixture();
    const bytes = Buffer.from('imagem');
    const source = '/assets/.cache/ícone azul.PNG';
    put(root, source, bytes);
    put(root, 'index.html', `<img src="${encodeURI(source)}">`);
    const result = run(root);
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(join(root, 'index.html'), 'utf8')).toBe(
      `<img src="${publicPath(bytes, '.png')}">`,
    );
    expect(readFileSync(join(root, publicPath(bytes, '.png')))).toEqual(bytes);
  });

  it('explica que a exportação web precisa existir antes de preparar o deploy', () => {
    const root = fixture();
    const result = run(join(root, 'dist-ausente'));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Exportação ausente');
    expect(result.stderr).toContain('expo export --platform web');
  });
});
