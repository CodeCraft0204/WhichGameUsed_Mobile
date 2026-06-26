import fs from 'fs';
import path from 'path';

const bgDir = path.resolve('assets/Photo Editor/background');
const outDir = path.resolve('constants/photoEditorBackgrounds');
const chunksDir = path.join(outDir, 'chunks');
const legacyFile = path.resolve('constants/photoEditorBackgrounds.ts');
const CHUNK_SIZE = 8;

const files = fs.readdirSync(bgDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
const used = new Set();

function keyFor(name) {
  let base =
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 48) || 'bg';
  if (/^[0-9]/.test(base)) {
    base = `bg_${base}`;
  }
  let key = base;
  let i = 2;
  while (used.has(key)) {
    key = `${base}_${i++}`;
  }
  used.add(key);
  return key;
}

function label(file) {
  const stem = file.replace(/\.[^.]+$/, '').trim();
  if (/^background\s*\(\d+\)$/i.test(stem)) {
    return stem.replace(/^background/i, 'Background');
  }
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 48);
}

const entries = files.map((file) => ({ key: keyFor(file), file, label: label(file) }));

fs.mkdirSync(chunksDir, { recursive: true });

const chunkCount = Math.ceil(entries.length / CHUNK_SIZE) || 1;
const chunkImports = [];

for (let i = 0; i < chunkCount; i++) {
  const slice = entries.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  const chunkName = `chunk${i}`;
  let chunk = `/** Background assets chunk ${i + 1}/${chunkCount} — generated, do not edit. */\n\n`;
  chunk += `export const ${chunkName} = {\n`;
  for (const entry of slice) {
    const escaped = entry.file.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    chunk += `  ${entry.key}: require('@/assets/Photo Editor/background/${escaped}'),\n`;
  }
  chunk += `} as const;\n`;
  fs.writeFileSync(path.join(chunksDir, `${chunkName}.ts`), chunk);
  chunkImports.push(chunkName);
}

let index = `/** Photo editor canvas backgrounds (Photo Editor/background). */\n\n`;
index += `import type { ImageSourcePropType } from 'react-native';\n`;
for (const chunkName of chunkImports) {
  index += `import { ${chunkName} } from './chunks/${chunkName}';\n`;
}
index += `\nexport const photoBackgrounds = {\n`;
for (const chunkName of chunkImports) {
  index += `  ...${chunkName},\n`;
}
index += `} as const;\n\n`;
index += `export type PhotoBackgroundImageKey = keyof typeof photoBackgrounds;\n`;
index += `export type PhotoBackgroundKey = 'parchment' | PhotoBackgroundImageKey;\n`;
index += `export const DEFAULT_PHOTO_BACKGROUND: PhotoBackgroundKey = 'parchment';\n`;
index += `export const photoBackgroundImageKeys = Object.keys(photoBackgrounds) as PhotoBackgroundImageKey[];\n\n`;
index += `export const photoBackgroundLabels: Record<PhotoBackgroundKey, string> = {\n`;
index += `  parchment: 'Parchment (default)',\n`;
for (const entry of entries) {
  index += `  ${entry.key}: '${entry.label.replace(/'/g, "\\'")}',\n`;
}
index += `};\n\n`;
index += `export const photoBackgroundPickerKeys: PhotoBackgroundKey[] = [\n`;
index += `  'parchment',\n`;
index += `  ...photoBackgroundImageKeys\n`;
index += `];\n\n`;
index += `export function photoBackgroundSource(key: PhotoBackgroundKey): ImageSourcePropType | null {\n`;
index += `  if (key === 'parchment') return null;\n`;
index += `  if (Object.prototype.hasOwnProperty.call(photoBackgrounds, key)) {\n`;
index += `    return photoBackgrounds[key as PhotoBackgroundImageKey];\n`;
index += `  }\n`;
index += `  return null;\n`;
index += `}\n`;

fs.writeFileSync(path.join(outDir, 'index.ts'), index);

if (fs.existsSync(legacyFile)) {
  fs.unlinkSync(legacyFile);
}

const totalBytes = files.reduce((sum, file) => {
  return sum + fs.statSync(path.join(bgDir, file)).size;
}, 0);
const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

console.log(`Wrote ${entries.length} backgrounds in ${chunkCount} chunks to ${outDir}`);
console.log(`Total background asset size: ${totalMb} MB`);
if (totalBytes > 40 * 1024 * 1024) {
  console.warn(
    'Warning: backgrounds exceed ~40 MB. Metro may run out of memory unless images are compressed or Node heap is increased.'
  );
}
