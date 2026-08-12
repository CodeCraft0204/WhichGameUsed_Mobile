/**
 * Shared audit helpers for local mobile assets.
 * Used by audit-local-assets.mjs, upload-mobile-assets.mjs, prune-local-assets.mjs
 */
import fs from 'fs';
import path from 'path';

export const MEDIA_EXT = /\.(png|jpe?g|webp|gif|pdf|ttf|otf)$/i;

/** Relative to assets/ — stay in the native bundle. */
export const LOCAL_KEEP_PREFIXES = ['fonts/', 'camera/'];
export const LOCAL_KEEP_FILES = new Set(['Splash.png']);

export function isLocalKeep(relFromAssets) {
  const norm = relFromAssets.replace(/\\/g, '/');
  if (LOCAL_KEEP_FILES.has(norm)) return true;
  return LOCAL_KEEP_PREFIXES.some((p) => norm === p.slice(0, -1) || norm.startsWith(p));
}

export function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

const CODE_ROOTS = ['app', 'components', 'constants', 'context', 'lib', 'hooks'];

export function walkCodeFiles(appRoot, out = []) {
  for (const rootName of CODE_ROOTS) {
    const root = path.join(appRoot, rootName);
    if (!fs.existsSync(root)) continue;
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx|js)$/.test(entry.name)) out.push(full);
      }
    })(root);
  }
  return out;
}

/** Collect require(...assets/...) relative paths (no assets/ prefix). */
export function collectRequireAssetPaths(appRoot) {
  const files = walkCodeFiles(appRoot);
  const aliasRe = /require\(\s*['"]@\/assets\/([^'"]+)['"]\s*\)/g;
  const relativeRe = /require\(\s*['"]((?:\.\.\/)+assets\/[^'"]+)['"]\s*\)/g;
  const paths = new Set();
  const missingRefs = [];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = aliasRe.exec(text))) {
      const rel = m[1].replace(/\\/g, '/');
      paths.add(rel);
      const abs = path.join(appRoot, 'assets', rel);
      if (!fs.existsSync(abs)) {
        missingRefs.push({ file: path.relative(appRoot, file), rel });
      }
    }
    while ((m = relativeRe.exec(text))) {
      const joined = path.normalize(path.join(path.dirname(file), m[1]));
      const rel = path.relative(path.join(appRoot, 'assets'), joined).replace(/\\/g, '/');
      if (rel.startsWith('..')) continue;
      paths.add(rel);
      if (!fs.existsSync(joined)) {
        missingRefs.push({ file: path.relative(appRoot, file), rel });
      }
    }
  }
  return { paths, missingRefs };
}

/** Paths referenced by remoteAsset('...') / remoteAssetUri('...'). */
export function collectRemoteAssetPaths(appRoot) {
  const files = walkCodeFiles(appRoot);
  const re = /remoteAsset(?:Uri)?\(\s*['"]([^'"]+)['"]\s*\)/g;
  const paths = new Set();
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(text))) paths.add(m[1].replace(/\\/g, '/'));
  }
  return paths;
}

export function auditAssets(appRoot) {
  const assetsRoot = path.join(appRoot, 'assets');
  const onDisk = walkFiles(assetsRoot)
    .filter((f) => MEDIA_EXT.test(f))
    .map((f) => path.relative(assetsRoot, f).replace(/\\/g, '/'));

  const { paths: requireSet, missingRefs } = collectRequireAssetPaths(appRoot);
  const remoteSet = collectRemoteAssetPaths(appRoot);
  const usedSet = new Set([...requireSet, ...remoteSet]);

  const used = [...usedSet].sort();
  const unused = onDisk.filter((p) => !usedSet.has(p)).sort();
  const localKeep = [...requireSet].filter((p) => isLocalKeep(p)).sort();
  const uploadCandidates = [...remoteSet].filter((p) => !isLocalKeep(p)).sort();

  function bytesFor(relList) {
    return relList.reduce((sum, rel) => {
      const abs = path.join(assetsRoot, rel);
      if (!fs.existsSync(abs)) return sum;
      return sum + fs.statSync(abs).size;
    }, 0);
  }

  const byTop = {};
  for (const rel of onDisk) {
    const top = rel.split('/')[0] || 'root';
    if (!byTop[top]) byTop[top] = { total: 0, used: 0, unused: 0, totalBytes: 0, usedBytes: 0 };
    const sz = fs.statSync(path.join(assetsRoot, rel)).size;
    byTop[top].total += 1;
    byTop[top].totalBytes += sz;
    if (usedSet.has(rel)) {
      byTop[top].used += 1;
      byTop[top].usedBytes += sz;
    } else {
      byTop[top].unused += 1;
    }
  }

  return {
    onDisk,
    used,
    unused,
    localKeep,
    uploadCandidates,
    requireOnly: [...requireSet].sort(),
    remoteOnly: [...remoteSet].sort(),
    missingRefs,
    bytes: {
      onDisk: bytesFor(onDisk),
      used: bytesFor(used),
      unused: bytesFor(unused),
      upload: bytesFor(uploadCandidates),
      localKeep: bytesFor(localKeep)
    },
    byTop
  };
}

export function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}
