// scripts/build-gh-pages.mjs
// Genera build estático completo para GitHub Pages (/perfumeria-sr) en out/
// con la enciclopedia compacta en public/data/encyclopedia.json y limpia rutas API temporalmente.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE_CATALOG = path.join(ROOT, 'src', 'data', 'parfumo-catalog.json');
const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data');
const ENCYCLOPEDIA_DEST = path.join(PUBLIC_DATA_DIR, 'encyclopedia.json');
const API_DIR = path.join(ROOT, 'src', 'app', 'api');
const API_BACKUP_DIR = path.join(ROOT, '.api-export-backup');
const OUT_DIR = path.join(ROOT, 'out');
const NEXT_BIN = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');

const KEEP_KEYS = [
  'id',
  'name',
  'brand',
  'year',
  'concentration',
  'rating',
  'reviews',
  'family',
  'gender',
  'perfumers',
  'notes',
  'accords',
  'liquidColor',
  'liquidColorAlt',
  'glowColor',
  'accentColor',
  'parfumoUrl',
];

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function generateCompactEncyclopedia() {
  const raw = JSON.parse(await fs.readFile(SOURCE_CATALOG, 'utf8'));
  const perfumes = Array.isArray(raw.perfumes) ? raw.perfumes : [];
  const compact = perfumes.map((item) => {
    const out = {};
    for (const k of KEEP_KEYS) {
      if (item[k] !== undefined && item[k] !== null) {
        out[k] = item[k];
      }
    }
    return out;
  });

  await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  const payload = JSON.stringify({ perfumes: compact });
  await fs.writeFile(ENCYCLOPEDIA_DEST, payload, 'utf8');
  const sizeMb = (Buffer.byteLength(payload, 'utf8') / (1024 * 1024)).toFixed(2);
  console.log(`Generated compact encyclopedia.json (${compact.length} perfumes, ${sizeMb} MB)`);
}

function runNextStaticBuild() {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = spawnSync(process.execPath, [NEXT_BIN, 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, GITHUB_PAGES: 'true' },
    });
    if (res.status === 0) return;
    if (attempt === 1) {
      console.warn('next build failed on attempt 1, retrying once...');
    } else {
      throw new Error(`next build exited with status ${res.status}`);
    }
  }
}

async function main() {
  // Recuperar backup si quedó de una corrida interrumpida
  if (!(await exists(API_DIR)) && (await exists(API_BACKUP_DIR))) {
    await fs.rename(API_BACKUP_DIR, API_DIR);
  }

  await generateCompactEncyclopedia();

  let movedApi = false;
  try {
    if (await exists(API_DIR)) {
      if (await exists(API_BACKUP_DIR)) {
        await fs.rm(API_BACKUP_DIR, { recursive: true, force: true });
      }
      await fs.rename(API_DIR, API_BACKUP_DIR);
      movedApi = true;
    }

    runNextStaticBuild();
    await fs.writeFile(path.join(OUT_DIR, '.nojekyll'), '', 'utf8');
    console.log('Static export ready at out/ with .nojekyll');
  } finally {
    if (movedApi && (await exists(API_BACKUP_DIR))) {
      if (await exists(API_DIR)) {
        await fs.rm(API_DIR, { recursive: true, force: true });
      }
      await fs.rename(API_BACKUP_DIR, API_DIR);
    }
    await fs.rm(ENCYCLOPEDIA_DEST, { force: true });
    try {
      const remaining = await fs.readdir(PUBLIC_DATA_DIR);
      if (remaining.length === 0) await fs.rmdir(PUBLIC_DATA_DIR);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
