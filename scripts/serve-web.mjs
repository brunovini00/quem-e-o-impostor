import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '../dist'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function insideRoot(path) {
  const fromRoot = relative(root, path);
  return !fromRoot.startsWith('..') && !isAbsolute(fromRoot);
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://127.0.0.1:4173').pathname,
    );
    let filename = resolve(root, `.${pathname}`);
    if (!insideRoot(filename)) {
      response.writeHead(403);
      response.end();
      return;
    }
    if (pathname.endsWith('/')) filename = resolve(filename, 'index.html');
    filename = await realpath(filename);
    if (!insideRoot(filename)) {
      response.writeHead(403);
      response.end();
      return;
    }
    const details = await stat(filename);
    if (!details.isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
      'Content-Length': details.size,
    });
    if (request.method === 'HEAD') response.end();
    else
      createReadStream(filename)
        .on('error', () => response.destroy())
        .pipe(response);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404);
    response.end();
  }
});

server.listen(4173, '127.0.0.1', () => {
  console.info('Prévia local do Impostor: http://127.0.0.1:4173');
});
