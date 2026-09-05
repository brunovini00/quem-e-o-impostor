import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'assets');
fs.mkdirSync(dir, { recursive: true });
// Rasterização determinística da marca vetorial, sem arquivos externos.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  const result = Buffer.alloc(body.length + 8);
  result.writeUInt32BE(data.length);
  body.copy(result, 4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}
const circle = (x, y, cx, cy, radius) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
function roundedRect(x, y, left, top, width, height, radius) {
  const cx = Math.max(left + radius, Math.min(x, left + width - radius));
  const cy = Math.max(top + radius, Math.min(y, top + height - radius));
  return circle(x, y, cx, cy, radius);
}
function png(size, transparent, scale = 1) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let py = 0; py < size; py++)
    for (let px = 0; px < size; px++) {
      const x = ((px / size - 0.5) / scale) * 100 + 50,
        y = ((py / size - 0.5) / scale) * 100 + 50;
      let c = transparent ? [0, 0, 0, 0] : [183, 161, 248, 255];
      if (roundedRect(x, y, 16, 27, 68, 46, 22)) c = [32, 33, 41, 255];
      if (roundedRect(x, y, 29, 37, 15, 25, 7.5) || roundedRect(x, y, 56, 37, 15, 25, 7.5))
        c = [244, 240, 232, 255];
      if (roundedRect(x, y, 35, 44, 7, 13, 3.5) || roundedRect(x, y, 62, 44, 7, 13, 3.5))
        c = [32, 33, 41, 255];
      const offset = py * (size * 4 + 1) + 1 + px * 4;
      c.forEach((channel, i) => {
        raw[offset + i] = channel;
      });
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
for (const [name, size, transparent, scale] of [
  ['icon.png', 1024, false, 1],
  ['adaptive-icon.png', 1024, true, 0.8],
  ['splash.png', 512, true, 1],
  ['favicon.png', 64, false, 1],
])
  fs.writeFileSync(path.join(dir, name), png(size, transparent, scale));
fs.writeFileSync(
  path.join(dir, 'brand.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#B7A1F8"/><rect x="16" y="27" width="68" height="46" rx="22" fill="#202129"/><g fill="#F4F0E8"><rect x="29" y="37" width="15" height="25" rx="7.5"/><rect x="56" y="37" width="15" height="25" rx="7.5"/></g><g fill="#202129"><rect x="35" y="44" width="7" height="13" rx="3.5"/><rect x="62" y="44" width="7" height="13" rx="3.5"/></g></svg>\n',
);
const rate = 22050,
  length = Math.floor(rate * 0.085),
  wav = Buffer.alloc(44 + length * 2);
wav.write('RIFF');
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(length * 2, 40);
for (let i = 0; i < length; i++)
  wav.writeInt16LE(
    Math.round(Math.sin((2 * Math.PI * 660 * i) / rate) * Math.sin((Math.PI * i) / length) * 3500),
    44 + i * 2,
  );
fs.writeFileSync(path.join(dir, 'tick.wav'), wav);
console.log('Marca, ícones, splash e sinal sonoro gerados em assets/.');
