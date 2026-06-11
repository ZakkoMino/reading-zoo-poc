#!/usr/bin/env node
// scripts/fetch-animal-art.mjs
//
// Downloads the Microsoft Fluent Emoji 3D render for every animal in
// data/content/animals_50_seed.json into assets/animals-3d/<id>.png,
// rewrites each animal's imagePath, refreshes the CSV export and writes
// the MIT license note next to the assets.
//
// Source: https://github.com/microsoft/fluentui-emoji (MIT)
// Usage : node scripts/fetch-animal-art.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = join(ROOT, 'data', 'content', 'animals_50_seed.json');
const CSV_PATH = join(ROOT, 'data', 'content', 'animals_50_seed.csv');
const OUT_DIR = join(ROOT, 'assets', 'animals-3d');
const BASE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';

/* animalId → Fluent Emoji asset folder name (folder layout:
 * assets/<Folder>/3D/<folder_lowercased_underscored>_3d.png) */
const FLUENT_FOLDER = {
  pes: 'Dog',
  kocka: 'Cat',
  lev: 'Lion',
  sova: 'Owl',
  liska: 'Fox',
  zebra: 'Zebra',
  kos: 'Blackbird',
  krava: 'Cow',
  kun: 'Horse',
  zaba: 'Frog',
  slon: 'Elephant',
  medved: 'Bear',
  had: 'Snake',
  beran: 'Ram',
  orel: 'Eagle',
  vlk: 'Wolf',
  hroch: 'Hippopotamus',
  jelen: 'Deer',
  papousek: 'Parrot',
  prase: 'Pig',
  ovce: 'Ewe',
  koza: 'Goat',
  kohout: 'Rooster',
  slepice: 'Chicken',
  kachna: 'Duck',
  husa: 'Goose',
  kralik: 'Rabbit',
  mys: 'Mouse',
  krysa: 'Rat',
  tygr: 'Tiger',
  opice: 'Monkey',
  zirafa: 'Giraffe',
  velbloud: 'Two-hump camel',
  tucnak: 'Penguin',
  tulen: 'Seal',
  delfin: 'Dolphin',
  velryba: 'Spouting whale',
  zelva: 'Turtle',
  ryba: 'Tropical fish',   // generic "ryba" gets the colorful fish…
  kapr: 'Fish',            // …and kapr the plain one, so they differ
  krokodyl: 'Crocodile',
  vcela: 'Honeybee',
  mravenec: 'Ant',
  motyl: 'Butterfly',
  moucha: 'Fly',
  pavouk: 'Spider',
  snek: 'Snail',
  jezek: 'Hedgehog',
  bobr: 'Beaver',
  vydra: 'Otter'
};

const LICENSE_MD = `# Licence ilustrací v této složce

Obrázky zvířat (\`*.png\`) pocházejí ze sady **Microsoft Fluent Emoji**
(3D varianta) a jsou použity podle licence MIT.

- Zdroj: https://github.com/microsoft/fluentui-emoji
- Licence: MIT — https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE

> MIT License
>
> Copyright (c) Microsoft Corporation.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
`;

function urlFor(folder) {
  const file = folder.toLowerCase().replace(/ /g, '_');
  return `${BASE}/${encodeURIComponent(folder)}/3D/${file}_3d.png`;
}

function toCsv(animals) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = ['id,name,category,biome,readingLevel,wordDifficulty,sentence,fact,imagePath,tags'];
  for (const a of animals) {
    rows.push([
      a.id, a.name, a.category, a.biome, a.readingLevel, a.wordDifficulty,
      esc(a.sentence), esc(a.fact), a.imagePath, esc(a.tags.join(';'))
    ].join(','));
  }
  return rows.join('\n') + '\n';
}

async function main() {
  const manifest = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  const failed = [];
  for (const animal of manifest.animals) {
    const folder = FLUENT_FOLDER[animal.id];
    if (!folder) { failed.push(`${animal.id} (bez mapování)`); continue; }
    const url = urlFor(folder);
    const res = await fetch(url);
    if (!res.ok) { failed.push(`${animal.id} → HTTP ${res.status} ${url}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(OUT_DIR, `${animal.id}.png`), buf);
    animal.imagePath = `assets/animals-3d/${animal.id}.png`;
    ok++;
    process.stdout.write(`✅ ${animal.id} ← ${folder} (${(buf.length / 1024).toFixed(0)} kB)\n`);
  }

  if (failed.length) {
    console.error('\n❌ Nestaženo:\n  ' + failed.join('\n  '));
    process.exit(1);
  }

  manifest.licenseNote =
    'Animal images are Microsoft Fluent Emoji (3D), MIT licensed — see assets/animals-3d/LICENSE.md.';
  manifest.version = '1.1.0';
  writeFileSync(DATA_PATH, JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(CSV_PATH, toCsv(manifest.animals));
  writeFileSync(join(OUT_DIR, 'LICENSE.md'), LICENSE_MD);
  console.log(`\n🦁 Hotovo: ${ok}/${manifest.animals.length} obrázků, manifest + CSV aktualizovány.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
