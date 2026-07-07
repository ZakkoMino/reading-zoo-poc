#!/usr/bin/env node
// scripts/generate-voice.mjs
//
// Pre-generates Czech audio clips for every text the app can speak, so the
// app doesn't depend on the device having a cs-CZ system voice (Web Speech
// stays as a fallback for anything not covered).
//
// Engine: Piper TTS (free, offline, no API key). One-time setup on a machine
// with normal internet access:
//
//   pip install piper-tts
//   python3 -m piper.download_voices cs_CZ-jirka-medium --data-dir voices
//   node scripts/generate-voice.mjs
//
// Output:
//   assets/voice/<hash>.mp3|wav   — one clip per text
//   assets/voice/manifest.json    — { files: { "<exact text>": "<file>" } }
//
// The clip set MUST mirror every speak()/speakAndWait() call site in js/
// (tasks.js + views.js). When adding a new spoken template there, add it to
// collectTexts() below and re-run this script — texts missing from the
// manifest simply fall back to Web Speech, so nothing breaks, it just
// requires the system voice again.
//
// Flags:
//   --model <path|name>  Piper voice (default: cs_CZ-jirka-medium, looked up
//                        in --data-dir when not a path to an .onnx file)
//   --data-dir <dir>     where downloaded voices live (default: voices)
//   --out <dir>          output directory (default: assets/voice)
//   --format mp3|wav     mp3 needs ffmpeg on PATH; default: mp3 when ffmpeg
//                        is available, wav otherwise (wav is ~6x larger)
//   --force              regenerate clips that already exist
//   --limit <n>          only first n texts (smoke test)
//   --dry-run            list what would be generated, no synthesis
//   --stub               generate short beep placeholders instead of speech
//                        (pipeline test without a voice model — do NOT ship)

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* ---------- CLI args ---------- */
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
};

const MODEL = opt('--model', 'cs_CZ-jirka-medium');
const DATA_DIR = opt('--data-dir', 'voices');
const OUT_DIR = join(ROOT, opt('--out', 'assets/voice'));
const FORCE = flag('--force');
const DRY = flag('--dry-run');
const STUB = flag('--stub');
const LIMIT = parseInt(opt('--limit', '0'), 10) || 0;

function hasFfmpeg() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}
const FORMAT = opt('--format', hasFfmpeg() ? 'mp3' : 'wav');

/* ---------- collect every text the app can speak ----------
 * Mirrors the templates in js/tasks.js and js/views.js — see the comment
 * at the top of this file. */

// tasks.js syllableSpeech(): "ma" -> "M, A, ma"
function syllableSpeech(text) {
  return text.toUpperCase().split('').join(', ') + ', ' + text;
}

function collectTexts() {
  const curriculum = read('data/content/curriculum_v2.json');
  const animalsDoc = read('data/content/animals_50_seed.json');
  const texts = new Set();

  for (const level of curriculum.levels) {
    for (const item of level.items || []) {
      texts.add(item.text);
      if (level.kind === 'letter') {
        texts.add(`Obtáhni písmeno ${item.text}`);                        // trace prompt
        if (item.animalIds && item.animalIds.length) {
          texts.add(`Najdi zvíře, které začíná na písmeno ${item.text}.`); // matchLetter
        }
      }
      if (level.kind === 'syllable') {
        texts.add(syllableSpeech(item.text));                             // read/compose
        texts.add(`Obtáhni slabiku ${item.text}`);                        // trace prompt
      }
    }
    // challenge win announcement per level
    texts.add(`Výborně! Odemkl jsi úroveň ${level.label}.`);
  }

  for (const a of animalsDoc.animals || []) {
    texts.add(a.name);                                                    // match/zoo/reward
    texts.add(`Nejdřív získej zvíře ${a.name}.`);                         // locked story tile
  }

  // read-task prompts + static UI phrases
  for (const unit of ['písmeno', 'slabiku', 'slovo', 'větu']) texts.add(`přečti ${unit}`);
  texts.add('Tahle úroveň se teprve odemkne. Splň Velkou výzvu!');
  texts.add('Výborně! Přečetl jsi celý příběh.');
  texts.add('Toto zvíře ještě nemáš.');

  return [...texts];
}

/* ---------- synthesis ---------- */
const fileFor = (text) =>
  createHash('sha1').update(text).digest('hex').slice(0, 10) + '.' + FORMAT;

function resolveModel() {
  if (MODEL.endsWith('.onnx')) return join(ROOT, MODEL);
  const p = join(ROOT, DATA_DIR, `${MODEL}.onnx`);
  if (!existsSync(p)) {
    console.error(
      `Voice model not found: ${p}\n\n` +
      `Download it first (needs internet):\n` +
      `  pip install piper-tts\n` +
      `  python3 -m piper.download_voices ${MODEL} --data-dir ${DATA_DIR}\n`
    );
    process.exit(1);
  }
  return p;
}

/* Single python process loads the model once and works through a JSONL job
 * list — spawning piper per clip would reload the model ~1200 times. */
const PY_DRIVER = `
import json, sys, wave
mode = sys.argv[1]
if mode == 'stub':
    import math, struct
    for line in sys.stdin:
        job = json.loads(line)
        with wave.open(job['wav'], 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050)
            n = int(22050 * 0.4)
            w.writeframes(b''.join(
                struct.pack('<h', int(0.25 * 32767 * math.sin(2 * math.pi * 440 * i / 22050)))
                for i in range(n)))
        print(job['wav'], flush=True)
else:
    from piper import PiperVoice
    voice = PiperVoice.load(sys.argv[2])
    for line in sys.stdin:
        job = json.loads(line)
        with wave.open(job['wav'], 'wb') as w:
            voice.synthesize_wav(job['text'], w)
        print(job['wav'], flush=True)
`;

function synthesize(jobs) {
  const pyArgs = STUB ? ['-c', PY_DRIVER, 'stub'] : ['-c', PY_DRIVER, 'piper', resolveModel()];
  const input = jobs.map((j) => JSON.stringify(j)).join('\n') + '\n';
  const res = spawnSync('python3', pyArgs, {
    input,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  if (res.status !== 0) {
    console.error(res.stderr || 'python driver failed');
    process.exit(1);
  }
  return res.stdout.trim().split('\n').filter(Boolean).length;
}

function toMp3(wavPath, mp3Path) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', wavPath,
    '-ac', '1', '-ar', '22050', '-b:a', '48k', mp3Path
  ]);
}

/* ---------- main ---------- */
function main() {
  let texts = collectTexts();
  if (LIMIT) texts = texts.slice(0, LIMIT);

  const todo = texts.filter((t) => FORCE || !existsSync(join(OUT_DIR, fileFor(t))));
  console.log(`🔊 texts: ${texts.length} · to generate: ${todo.length} · format: ${FORMAT}${STUB ? ' · STUB MODE (beeps!)' : ''}`);

  if (DRY) {
    for (const t of texts.slice(0, 20)) console.log('  ', fileFor(t), JSON.stringify(t));
    if (texts.length > 20) console.log(`   … and ${texts.length - 20} more`);
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  if (todo.length) {
    const tmp = join(tmpdir(), 'reading-zoo-voice');
    mkdirSync(tmp, { recursive: true });
    const useMp3 = FORMAT === 'mp3';
    const jobs = todo.map((text, i) => ({
      text,
      wav: useMp3 ? join(tmp, i + '.wav') : join(OUT_DIR, fileFor(text))
    }));
    const done = synthesize(jobs);
    console.log(`   synthesized ${done} clips`);
    if (useMp3) {
      jobs.forEach((j, i) => {
        toMp3(j.wav, join(OUT_DIR, fileFor(j.text)));
        rmSync(j.wav);
        if ((i + 1) % 200 === 0) console.log(`   encoded ${i + 1}/${jobs.length}`);
      });
      console.log(`   encoded ${jobs.length} mp3 files`);
    }
  }

  const manifest = {
    schema: 'reading-zoo.voice.v1',
    voice: STUB ? 'stub' : MODEL,
    format: FORMAT,
    count: texts.length,
    files: Object.fromEntries(texts.map((t) => [t, fileFor(t)]))
  };
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ ${texts.length} clips in ${OUT_DIR} + manifest.json`);
  if (STUB) console.log('⚠️  Stub clips are placeholder beeps — regenerate with a real voice before shipping.');
}

main();
