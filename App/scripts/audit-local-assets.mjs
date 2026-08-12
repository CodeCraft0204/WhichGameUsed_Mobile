#!/usr/bin/env node
/**
 * Report used (require('@/assets/...')) vs on-disk media under assets/.
 * Exit 1 if any require path is missing on disk.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { auditAssets, formatMb } from './lib/asset-audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

const report = auditAssets(appRoot);

console.log('=== Mobile local assets audit ===\n');
console.log(`On disk:          ${report.onDisk.length} files (${formatMb(report.bytes.onDisk)} MB)`);
console.log(`In use (req+remote): ${report.used.length} files (${formatMb(report.bytes.used)} MB)`);
console.log(`  require() local:   ${report.requireOnly.length}`);
console.log(`  remoteAsset():    ${report.remoteOnly.length}`);
console.log(`Unused:           ${report.unused.length} files (${formatMb(report.bytes.unused)} MB)`);
console.log(`Local keep:       ${report.localKeep.length} files (${formatMb(report.bytes.localKeep)} MB)`);
console.log(`Upload candidates:${report.uploadCandidates.length} files (${formatMb(report.bytes.upload)} MB)`);

console.log('\n--- Per top-level folder ---');
for (const [folder, row] of Object.entries(report.byTop).sort((a, b) => b[1].totalBytes - a[1].totalBytes)) {
  console.log(
    `${folder.padEnd(28)} used ${String(row.used).padStart(3)}/${String(row.total).padStart(3)}  ` +
      `${formatMb(row.usedBytes).padStart(6)} / ${formatMb(row.totalBytes).padStart(6)} MB`
  );
}

if (report.unused.length) {
  console.log(`\n--- Unused sample (first 40 of ${report.unused.length}) ---`);
  for (const rel of report.unused.slice(0, 40)) console.log(`  ${rel}`);
  if (report.unused.length > 40) console.log(`  … +${report.unused.length - 40} more`);
}

if (report.missingRefs.length) {
  console.error('\nERROR: require() paths missing on disk:');
  for (const m of report.missingRefs) console.error(`  ${m.file} → ${m.rel}`);
  process.exit(1);
}

console.log('\nOK: all require() asset paths exist on disk.');
