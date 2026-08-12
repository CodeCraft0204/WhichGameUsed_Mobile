#!/usr/bin/env node
/**
 * Delete local asset files that are no longer needed in the bundle.
 *
 * Default: delete files not referenced by require() OR remoteAsset() — safe.
 *
 * With --delete-remote-sources:
 *   Also delete on-disk files referenced by remoteAsset() / remoteAssetUri()
 *   Run ONLY after a successful `npm run assets:upload`.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  auditAssets,
  collectRemoteAssetPaths,
  formatMb,
  isLocalKeep,
  walkFiles
} from './lib/asset-audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(appRoot, 'assets');
const deleteRemote = process.argv.includes('--delete-remote-sources');
const dryRun = process.argv.includes('--dry-run');

const report = auditAssets(appRoot);
const toDelete = new Set(report.unused);

if (deleteRemote) {
  for (const rel of collectRemoteAssetPaths(appRoot)) {
    if (!isLocalKeep(rel)) toDelete.add(rel);
  }
}

let bytes = 0;
let count = 0;
const deleted = [];

for (const rel of [...toDelete].sort()) {
  // Never delete currently required local-keep files
  if (report.requireOnly.includes(rel) && isLocalKeep(rel)) continue;

  const abs = path.join(assetsRoot, rel);
  if (!fs.existsSync(abs)) continue;
  const sz = fs.statSync(abs).size;
  bytes += sz;
  count += 1;
  deleted.push(rel);
  if (!dryRun) fs.unlinkSync(abs);
}

if (!dryRun) {
  const allDirs = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const full = path.join(dir, entry.name);
        walk(full);
        allDirs.push(full);
      }
    }
  })(assetsRoot);
  for (const dir of allDirs.sort((a, b) => b.length - a.length)) {
    try {
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {
      /* ignore */
    }
  }
}

console.log(
  `${dryRun ? 'Would delete' : 'Deleted'} ${count} files (${formatMb(bytes)} MB)` +
    (deleteRemote ? ' [unused + remote sources]' : ' [unused only]')
);
if (dryRun) {
  for (const rel of deleted.slice(0, 50)) console.log(`  ${rel}`);
  if (deleted.length > 50) console.log(`  … +${deleted.length - 50} more`);
}

if (!deleteRemote) {
  console.log(
    `\nKept ${report.uploadCandidates.length} remote sources on disk (${formatMb(report.bytes.upload)} MB) for upload.`
  );
  console.log('After `npm run assets:upload`, re-run with --delete-remote-sources.');
}
