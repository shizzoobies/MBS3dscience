#!/usr/bin/env node
/**
 * Optimize all images in public/images:
 *  - Resize to max 1800px wide (photos don't need more for full-bleed hero)
 *  - Re-encode as progressive JPEG at quality 78 with mozjpeg
 *  - Delete PNGs in favor of JPGs for photos (PNG transparency not needed here)
 *
 * Usage: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { readdir, unlink, rename, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const dir = 'public/images';
const MAX_WIDTH = 1800;
const QUALITY = 78;

// Files we DO NOT want to JPG-convert (keep alpha or skip entirely)
const SKIP = new Set(['logo.png', 'logo-alt.png', 'header.png', 'header-bg.png']);

const files = await readdir(dir);
let bytesBefore = 0;
let bytesAfter = 0;
let count = 0;

for (const file of files) {
  const ext = parse(file).ext.toLowerCase();
  const base = parse(file).name;
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
  if (SKIP.has(file)) continue;

  const full = join(dir, file);
  const sizeBefore = (await stat(full)).size;
  bytesBefore += sizeBefore;

  const img = sharp(full);
  const meta = await img.metadata();

  let pipe = img.rotate(); // honor EXIF orientation
  if (meta.width && meta.width > MAX_WIDTH) {
    pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const outPath = join(dir, base + '.jpg');
  const tempPath = join(dir, base + '.tmp.jpg');

  await pipe.jpeg({ quality: QUALITY, progressive: true, mozjpeg: true }).toFile(tempPath);

  // Remove original, swap in optimized
  await unlink(full);
  await rename(tempPath, outPath);

  const sizeAfter = (await stat(outPath)).size;
  bytesAfter += sizeAfter;
  count += 1;

  const pct = Math.round((1 - sizeAfter / sizeBefore) * 100);
  console.log(
    `${file.padEnd(36)} ${String(Math.round(sizeBefore / 1024)).padStart(5)}KB -> ${String(
      Math.round(sizeAfter / 1024)
    ).padStart(5)}KB  (-${pct}%)`
  );
}

console.log('\n' + '-'.repeat(60));
console.log(
  `Optimized ${count} files. Total: ${Math.round(bytesBefore / 1024)}KB -> ${Math.round(
    bytesAfter / 1024
  )}KB  (saved ${Math.round((bytesBefore - bytesAfter) / 1024)}KB, -${Math.round(
    (1 - bytesAfter / bytesBefore) * 100
  )}%)`
);
