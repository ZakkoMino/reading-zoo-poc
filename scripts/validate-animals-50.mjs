#!/usr/bin/env node
// scripts/validate-animals-50.mjs

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'data', 'content', 'animals_50_seed.json');
const SVG_DIR = join(ROOT, 'assets', 'animals-illustrated');

const VALID_CATEGORIES = ['savec', 'ptak', 'plaz', 'obojzivelnik', 'ryba', 'hmyz', 'pavoukovec', 'mekkys', 'korys'];
const VALID_BIOMES = ['domov', 'statek', 'les', 'louka', 'savana', 'poust', 'reka', 'rybnik', 'ocean', 'hory', 'zoo'];
const VALID_LEVELS = [1, 2, 3];

let errors = 0;
let warnings = 0;

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.error(`  ❌ ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnings++; }

console.log('\n📋 Validace animals_50_seed.json + SVG assets\n');

// 1. JSON parseable
let manifest;
try {
  const raw = readFileSync(DATA_PATH, 'utf8');
  manifest = JSON.parse(raw);
  pass('JSON je validní');
} catch (e) {
  fail(`JSON nelze parsovat: ${e.message}`);
  process.exit(1);
}

// 2.–3. count field must match the actual number of animals
if (!Array.isArray(manifest.animals)) {
  fail('manifest.animals není pole');
  process.exit(1);
}
if (manifest.count === manifest.animals.length) {
  pass(`manifest.count = ${manifest.count} (odpovídá počtu zvířat)`);
} else {
  fail(`manifest.count je ${manifest.count}, ale zvířat je ${manifest.animals.length}`);
}

// 4. unique IDs
const ids = manifest.animals.map(a => a.id);
const uniqueIds = new Set(ids);
if (uniqueIds.size === ids.length) {
  pass('Všechna id jsou unikátní');
} else {
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  fail(`Duplicitní id: ${dupes.join(', ')}`);
}

// 5. each imagePath exists
let missingImages = 0;
for (const animal of manifest.animals) {
  const imgPath = join(ROOT, animal.imagePath);
  if (!existsSync(imgPath)) {
    fail(`imagePath neexistuje: ${animal.imagePath}`);
    missingImages++;
  }
}
if (missingImages === 0) {
  pass('Všechny imagePath existují');
}

// 6. exactly 50 SVG files in assets/animals-illustrated
let svgFiles;
try {
  svgFiles = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
} catch (e) {
  fail(`Adresář SVG neexistuje: ${SVG_DIR}`);
  process.exit(1);
}
if (svgFiles.length === 50) {
  pass(`assets/animals-illustrated obsahuje přesně 50 SVG souborů`);
} else {
  fail(`assets/animals-illustrated obsahuje ${svgFiles.length} SVG souborů, očekáváno 50`);
}

// 7–8. each SVG: viewBox + no external references
let svgBadViewBox = 0;
let svgExternalRef = 0;
for (const file of svgFiles) {
  const svgPath = join(SVG_DIR, file);
  const content = readFileSync(svgPath, 'utf8');

  if (!content.includes('viewBox="0 0 200 200"')) {
    fail(`${file}: chybí viewBox="0 0 200 200"`);
    svgBadViewBox++;
  }

  if (/href\s*=\s*["']https?:/.test(content) || /<image/.test(content)) {
    fail(`${file}: obsahuje externí href nebo <image> tag`);
    svgExternalRef++;
  }
}
if (svgBadViewBox === 0) pass('Všechna SVG mají viewBox="0 0 200 200"');
if (svgExternalRef === 0) pass('Žádné SVG neobsahuje externí href ani <image> tag');

// 9. category / biome / readingLevel values
let badCategory = 0, badBiome = 0, badLevel = 0;
for (const animal of manifest.animals) {
  if (!VALID_CATEGORIES.includes(animal.category)) {
    fail(`${animal.id}: neplatná category "${animal.category}"`);
    badCategory++;
  }
  if (!VALID_BIOMES.includes(animal.biome)) {
    fail(`${animal.id}: neplatný biome "${animal.biome}"`);
    badBiome++;
  }
  if (!VALID_LEVELS.includes(animal.readingLevel)) {
    fail(`${animal.id}: neplatný readingLevel ${animal.readingLevel}`);
    badLevel++;
  }
  if (typeof animal.wordDifficulty !== 'number' || animal.wordDifficulty < 1 || animal.wordDifficulty > 5) {
    warn(`${animal.id}: wordDifficulty ${animal.wordDifficulty} není v rozsahu 1-5`);
  }
}
if (badCategory === 0) pass('Všechny category jsou v povolených hodnotách');
if (badBiome === 0) pass('Všechny biome jsou v povolených hodnotách');
if (badLevel === 0) pass('Všechny readingLevel jsou v povolených hodnotách (1/2/3)');

// Summary
console.log('\n─────────────────────────────────────────');
if (errors === 0 && warnings === 0) {
  console.log('🎉 Validace PROŠLA – žádné chyby ani varování.\n');
} else if (errors === 0) {
  console.log(`✅ Validace PROŠLA – ${warnings} varování.\n`);
} else {
  console.log(`💥 Validace SELHALA – ${errors} chyb, ${warnings} varování.\n`);
  process.exit(1);
}
