#!/usr/bin/env node
/**
 * Upload assets referenced by remoteAsset() / remoteAssetUri() to Supabase Storage
 * bucket `mobile-app-assets`. Only those paths (currently used by the app) are uploaded.
 *
 * Env:
 *   EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Flags:
 *   --dry-run   List files without uploading
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import {
  collectRemoteAssetPaths,
  formatMb,
  isLocalKeep
} from './lib/asset-audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(appRoot, 'assets');
const BUCKET = 'mobile-app-assets';
const dryRun = process.argv.includes('--dry-run');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    // Prefer .env when shell env is unset or empty (common on Windows).
    if (!(key in process.env) || process.env[key] === '') {
      process.env[key] = val;
    }
  }
  return true;
}

const envPath = path.join(appRoot, '.env');
const envTxtPath = path.join(appRoot, '.env.txt'); // Notepad on Windows often creates this
let loadedEnv = loadEnvFile(envPath);
let loadedEnvTxt = false;
if (!loadedEnv && fs.existsSync(envTxtPath)) {
  loadedEnvTxt = loadEnvFile(envTxtPath);
  if (loadedEnvTxt) {
    console.warn(
      `WARNING: loaded ${envTxtPath}\n` +
        'Rename it to ".env" (no .txt). Notepad often appends .txt on Windows.'
    );
  }
}
loadEnvFile(path.resolve(appRoot, '../../Web/supabase/.env'));
loadEnvFile(path.resolve(appRoot, '../../Web/.env'));
loadEnvFile(path.resolve(appRoot, '../../Web/portal/.env'));

const url = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(
  /\/$/,
  ''
);
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const toUpload = [...collectRemoteAssetPaths(appRoot)]
  .filter((rel) => !isLocalKeep(rel))
  .sort();
const missing = toUpload.filter((rel) => !fs.existsSync(path.join(assetsRoot, rel)));
const present = toUpload.filter((rel) => fs.existsSync(path.join(assetsRoot, rel)));
const bytes = present.reduce((sum, rel) => sum + fs.statSync(path.join(assetsRoot, rel)).size, 0);

console.log(`Remote asset refs: ${toUpload.length}`);
console.log(`On disk to upload: ${present.length} (${formatMb(bytes)} MB)`);
if (missing.length) {
  console.warn(`Missing on disk (skip): ${missing.length}`);
  for (const rel of missing.slice(0, 20)) console.warn(`  ${rel}`);
}

if (dryRun) {
  for (const rel of present) console.log(`  ${rel}`);
  console.log('\nDry run only — no uploads.');
  process.exit(0);
}

if (!url || !serviceKey) {
  console.error('Missing Supabase credentials for upload.\n');
  console.error(`  App folder: ${appRoot}`);
  console.error(`  .env path:  ${envPath}`);
  console.error(`  .env found: ${loadedEnv ? 'yes' : 'NO'}`);
  console.error(`  .env.txt found: ${fs.existsSync(envTxtPath) ? 'yes (rename to .env)' : 'no'}`);
  console.error(`  EXPO_PUBLIC_SUPABASE_URL: ${url ? 'set' : 'MISSING'}`);
  console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? 'set' : 'MISSING'}`);

  try {
    const nearby = fs
      .readdirSync(appRoot)
      .filter((n) => /env/i.test(n))
      .sort();
    console.error(`\n  Files matching *env* in App folder:`);
    if (nearby.length === 0) console.error('    (none)');
    else for (const n of nearby) console.error(`    ${n}`);
  } catch {
    /* ignore */
  }

  console.error(`
Create .env with PowerShell (run inside App folder):

  @"
EXPO_PUBLIC_SUPABASE_URL=https://govegqqwnoxwkfjxplhw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
"@ | Set-Content -Path .env -Encoding utf8

Then verify:
  dir .env
  type .env
`);
  process.exit(1);
}

if (serviceKey.startsWith('sb_publishable_') || serviceKey === process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'WARNING: SUPABASE_SERVICE_ROLE_KEY looks like the publishable/anon key.\n' +
      'Use the secret **service_role** key from Supabase Dashboard → Project Settings → API.'
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  // Node 20 has no global WebSocket; supabase-js still initializes Realtime.
  realtime: { transport: ws }
});

function mimeFor(rel) {
  const lower = rel.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

let ok = 0;
let failed = 0;

for (const rel of present) {
  const abs = path.join(assetsRoot, rel);
  const body = fs.readFileSync(abs);
  const { error } = await supabase.storage.from(BUCKET).upload(rel, body, {
    contentType: mimeFor(rel),
    upsert: true,
    cacheControl: '31536000'
  });
  if (error) {
    const cause = error.cause instanceof Error ? `: ${error.cause.message}` : '';
    console.error(`FAIL ${rel}: ${error.message}${cause}`);
    failed += 1;
  } else {
    ok += 1;
    if (ok % 25 === 0) console.log(`… uploaded ${ok}/${present.length}`);
  }
}

const manifestPath = path.join(__dirname, '.last-upload-manifest.json');
fs.writeFileSync(
  manifestPath,
  JSON.stringify({ bucket: BUCKET, uploadedAt: new Date().toISOString(), paths: present }, null, 2)
);

console.log(`\nDone. uploaded=${ok} failed=${failed}`);
console.log(`Manifest: ${manifestPath}`);
if (failed) process.exit(1);
console.log('Next: npm run assets:prune -- --delete-remote-sources');
