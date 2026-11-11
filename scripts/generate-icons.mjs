#!/usr/bin/env node
/**
 * Generates the PWA icons in public/icons/ using only Node built-ins (no deps).
 * Background color = Tailwind emerald-800 (oklch(43.2% .095 166.913) ≈ #006044).
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icons');

const BG = [0x00, 0x60, 0x44, 255]; // emerald-800
const FG = [255, 255, 255, 255]; // white "C" (Ciboulette)
const SS = 3; // supersampling factor for antialiasing

// ---------------------------------------------------------------------------
// Minimal PNG encoder (8-bit RGBA, no interlace)
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, rgba) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
/** Rounded-rect coverage test (signed-distance based, in pixel space). */
function inRoundedRect(px, py, size, radius) {
  if (radius <= 0) return px >= 0 && px < size && py >= 0 && py < size;
  const dx = Math.abs(px - size / 2) - (size / 2 - radius);
  const dy = Math.abs(py - size / 2) - (size / 2 - radius);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - radius <= 0;
}

/**
 * Draws an emerald tile with a white "C" (gap opening to the right).
 * @param {number} size image size in px
 * @param {{rounded: boolean, glyphScale: number}} opts
 *   rounded=false → full-bleed background (maskable / apple-touch icons)
 */
function drawIcon(size, { rounded, glyphScale }) {
  const rgba = Buffer.alloc(size * size * 4);
  const cornerRadius = rounded ? size * 0.22 : 0;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.3 * glyphScale;
  const innerR = outerR * 0.6; // stroke = 40% of radius
  const gapRad = (52 * Math.PI) / 180; // half-angle of the opening on the right

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0;
      let fgHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (!inRoundedRect(px, py, size, cornerRadius)) continue;
          bgHits++;
          const dx = px - cx;
          const dy = py - cy;
          const d = Math.hypot(dx, dy);
          if (d <= outerR && d >= innerR && Math.abs(Math.atan2(dy, dx)) > gapRad) fgHits++;
        }
      }
      const total = SS * SS;
      const bgA = bgHits / total;
      const fgA = fgHits / total;
      const outA = fgA + bgA * (1 - fgA);
      const i = (y * size + x) * 4;
      if (outA === 0) {
        rgba[i] = 0;
        rgba[i + 1] = 0;
        rgba[i + 2] = 0;
        rgba[i + 3] = 0;
        continue;
      }
      rgba[i] = Math.round((FG[0] * fgA + BG[0] * bgA * (1 - fgA)) / outA);
      rgba[i + 1] = Math.round((FG[1] * fgA + BG[1] * bgA * (1 - fgA)) / outA);
      rgba[i + 2] = Math.round((FG[2] * fgA + BG[2] * bgA * (1 - fgA)) / outA);
      rgba[i + 3] = Math.round(outA * 255);
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ['icon-192.png', drawIcon(192, { rounded: true, glyphScale: 1 })],
  ['icon-512.png', drawIcon(512, { rounded: true, glyphScale: 1 })],
  // Maskable / apple-touch icons keep the glyph inside the 80% safe zone.
  ['maskable-512.png', drawIcon(512, { rounded: false, glyphScale: 0.82 })],
  ['apple-touch-icon.png', drawIcon(180, { rounded: false, glyphScale: 0.82 })],
];

for (const [name, png] of targets) {
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote public/icons/${name} (${png.length} bytes)`);
}
