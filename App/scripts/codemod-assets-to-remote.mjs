#!/usr/bin/env node
/**
 * Replace require('@/assets/...') with remoteAsset('...') for non local-keep paths.
 * Leaves Splash, fonts, and camera requires intact.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isLocalKeep, walkCodeFiles } from './lib/asset-audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

const IMPORT_LINE = "import { remoteAsset } from '@/constants/remoteAssets';\n";
const IMPORT_URI_LINE =
  "import { remoteAsset, remoteAssetUri } from '@/constants/remoteAssets';\n";

const files = walkCodeFiles(appRoot);
let changedFiles = 0;

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  let touchedRemote = false;
  let touchedUri = false;

  text = text.replace(
    /require\(\s*['"]@\/assets\/([^'"]+)['"]\s*\)(\s+as\s+ImageSourcePropType)?/g,
    (full, rel, asCast) => {
      const norm = rel.replace(/\\/g, '/');
      if (isLocalKeep(norm)) return full;
      touchedRemote = true;
      // educationDocuments prefers remoteUri string for PDFs
      if (file.replace(/\\/g, '/').endsWith('constants/educationDocuments.ts') && /\.pdf$/i.test(norm)) {
        touchedUri = true;
        return `remoteAssetUri('${norm.replace(/'/g, "\\'")}')`;
      }
      const call = `remoteAsset('${norm.replace(/'/g, "\\'")}')`;
      return asCast ? `${call} as ImageSourcePropType` : call;
    }
  );

  if (text === original) continue;

  if (touchedUri && !text.includes("from '@/constants/remoteAssets'")) {
    text = IMPORT_URI_LINE + text;
  } else if (touchedRemote && !text.includes("from '@/constants/remoteAssets'")) {
    text = IMPORT_LINE + text;
  } else if (touchedUri && text.includes("import { remoteAsset } from '@/constants/remoteAssets'")) {
    text = text.replace(
      "import { remoteAsset } from '@/constants/remoteAssets';",
      "import { remoteAsset, remoteAssetUri } from '@/constants/remoteAssets';"
    );
  }

  // educationDocuments: remoteUri field instead of assetModule for PDF
  if (file.replace(/\\/g, '/').endsWith('constants/educationDocuments.ts')) {
    text = text.replace(
      /assetModule:\s*remoteAssetUri\(([^)]+)\)/,
      'remoteUri: remoteAssetUri($1)'
    );
  }

  fs.writeFileSync(file, text);
  changedFiles += 1;
  console.log(`updated ${path.relative(appRoot, file)}`);
}

console.log(`\nCodemod complete: ${changedFiles} files`);
