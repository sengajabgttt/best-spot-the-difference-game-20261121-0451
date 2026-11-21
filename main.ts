// main.ts — hands Mata Jeli in. It copies this repository's game/ and
// screenshots/ into the output directory and writes dossier.json there with
// the vendored make.fun library, so the scorer can check the entry and the
// judge can read it. Runs on Node 22 with the standard library only.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const from = join(repoRoot, name);
  if (!existsSync(from)) return;
  cpSync(from, join(outputDir, name), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree('game');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
copyTree('screenshots');

// The gate's caps for this bounty: the dossier text holds at most 160 KiB,
// at most 4 screenshots of 256 KiB each, game/ at most 993 files and
// 48 MiB, and no path under game/ longer than 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
