#!/usr/bin/env node
// scripts/generate-animals-assets.mjs
// Generates 50 illustrated SVGs + JSON/CSV/schema for Čtecí ZOO

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

// ---------------------------------------------------------------------------
// SVG element helpers
// ---------------------------------------------------------------------------
const ci = (cx, cy, r, fill, stroke = '#2C2C2C', sw = 1.5) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const el = (cx, cy, rx, ry, fill, stroke = '#2C2C2C', sw = 1.5, xf = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${xf ? ` transform="${xf}"` : ''}/>`;
const pa = (d, fill, stroke = '#2C2C2C', sw = 1.5) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const li = (x1, y1, x2, y2, stroke = '#2C2C2C', sw = 1.5) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
const po = (pts, fill, stroke = '#2C2C2C', sw = 1.5) =>
  `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const re = (x, y, w, h, rx, fill, stroke = '#2C2C2C', sw = 1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

// Standard animal eyes (filled circle + dark iris + shine)
function eyes(lx, ly, rx, ry, r = 7, iris = '#2C2C2C') {
  return ci(lx, ly, r, '#FFF') + ci(lx + 0.5, ly + 0.5, r * 0.6, iris, 'none', 0) +
    ci(lx - 1.5, ly - 2, r * 0.22, '#FFF', 'none', 0) +
    ci(rx, ry, r, '#FFF') + ci(rx + 0.5, ry + 0.5, r * 0.6, iris, 'none', 0) +
    ci(rx - 1.5, ry - 2, r * 0.22, '#FFF', 'none', 0);
}

// Big round eyes for owls / frogs
function bigEyes(lx, ly, rx, ry, r = 14) {
  return ci(lx, ly, r, '#FFF') + ci(lx + 1, ly + 1, r * 0.58, '#2C2C2C', 'none', 0) +
    ci(lx - 3, ly - 3, r * 0.2, '#FFF', 'none', 0) +
    ci(rx, ry, r, '#FFF') + ci(rx + 1, ry + 1, r * 0.58, '#2C2C2C', 'none', 0) +
    ci(rx - 3, ry - 3, r * 0.2, '#FFF', 'none', 0);
}

// Smile arc
const smile = (cx, cy, w = 12, h = 5) =>
  pa(`M${cx - w} ${cy} Q${cx} ${cy + h} ${cx + w} ${cy}`, 'none', '#2C2C2C', 1.5);

// Background circle
const bg = (color) => ci(100, 100, 95, color, 'none', 0);

// SVG wrapper
const svg = (content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n${content}\n</svg>`;

// ---------------------------------------------------------------------------
// Animal draw functions (return inner SVG content without wrapper)
// ---------------------------------------------------------------------------

function draw_pes() {
  const fur = '#D4A070'; const ear = '#B87840'; const snout = '#E8C4A0';
  return bg('#FFF0DC') +
    pa('M148 148 Q172 118 162 104', 'none', ear, 3) +   // tail
    el(100, 148, 46, 36, fur) +                           // body
    el(72, 94, 16, 24, ear, '#8B5E30', 1.5, 'rotate(-18 72 94)') +  // left ear
    el(128, 94, 16, 24, ear, '#8B5E30', 1.5, 'rotate(18 128 94)') + // right ear
    ci(100, 78, 34, fur) +                               // head
    el(100, 91, 20, 13, snout, '#C0904C', 1) +           // snout
    el(100, 85, 8, 5.5, '#3C2010', 'none', 0) +          // nose
    eyes(83, 70, 117, 70, 7) +
    smile(100, 97, 8, 4);
}

function draw_kocka() {
  const fur = '#A0A0B0'; const inner = '#FFD0D0';
  return bg('#F0EEFF') +
    pa('M145 160 Q168 130 155 105 Q150 115 145 160', fur, '#808090', 2) + // tail
    el(100, 148, 44, 36, fur) +                           // body
    po('78,42 88,72 68,72', fur) +                        // left ear
    po('122,42 132,72 112,72', fur) +                     // right ear
    po('81,50 88,68 73,68', inner, 'none', 0) +           // left ear inner
    po('119,50 127,68 113,68', inner, 'none', 0) +        // right ear inner
    ci(100, 80, 34, fur) +                               // head
    el(100, 92, 14, 9, '#DDB0A8', '#C09090', 1) +        // muzzle
    ci(100, 90, 4, '#3C2010', 'none', 0) +               // nose
    eyes(83, 75, 117, 75, 7, '#1A6040') +
    li(86, 94, 70, 91, '#808090', 1) + li(86, 96, 70, 96, '#808090', 1) + li(86, 98, 70, 101, '#808090', 1) + // left whiskers
    li(114, 94, 130, 91, '#808090', 1) + li(114, 96, 130, 96, '#808090', 1) + li(114, 98, 130, 101, '#808090', 1); // right whiskers
}

function draw_lev() {
  const fur = '#D4A030'; const mane = '#A06820';
  return bg('#FFF8DC') +
    ci(100, 85, 46, mane) +                              // mane
    el(100, 150, 46, 36, fur) +                           // body
    po('76,46 84,75 68,75', fur, mane) +                  // left ear
    po('124,46 132,75 116,75', fur, mane) +               // right ear
    ci(100, 85, 34, fur) +                               // head
    el(100, 98, 18, 12, '#E8C060', '#B08030', 1) +       // muzzle
    ci(100, 93, 5, '#3C2010', 'none', 0) +               // nose
    eyes(82, 76, 118, 76, 7) +
    li(86, 100, 70, 97, '#A06820', 1) + li(86, 102, 70, 102, '#A06820', 1) + // whiskers
    li(114, 100, 130, 97, '#A06820', 1) + li(114, 102, 130, 102, '#A06820', 1) +
    smile(100, 105, 7, 4);
}

function draw_sova() {
  const body = '#8B6020'; const face = '#E8D0A0';
  return bg('#1C3050') +
    el(100, 145, 40, 42, body) +                          // body
    po('72,42 84,78 60,78', body) +                       // left ear tuft
    po('128,42 140,78 116,78', body) +                    // right ear tuft
    ci(100, 82, 36, body) +                              // head
    el(100, 82, 28, 26, face, body, 1) +                  // face disk
    bigEyes(85, 78, 115, 78, 12) +
    po('96,90 100,100 104,90', '#E8A020', '#C07800', 1.5) + // beak
    li(80, 162, 72, 175, body, 2) + li(120, 162, 128, 175, body, 2) + // feet
    li(72, 175, 62, 180, body, 1.5) + li(72, 175, 72, 183, body, 1.5) + li(72, 175, 82, 180, body, 1.5) +
    li(128, 175, 118, 180, body, 1.5) + li(128, 175, 128, 183, body, 1.5) + li(128, 175, 138, 180, body, 1.5);
}

function draw_liska() {
  const fur = '#E06020'; const dark = '#2C2C2C';
  return bg('#FFE5D9') +
    po('55,70 78,95 45,100', fur) +                       // left ear
    po('145,70 122,95 155,100', fur) +                    // right ear
    po('60,78 72,92 56,95', dark, 'none', 0) +           // left ear inner
    po('140,78 128,92 144,95', dark, 'none', 0) +        // right ear inner
    el(100, 118, 55, 50, fur) +                           // body
    pa('M75,130 Q100,162 125,130 Q120,152 100,152 Q80,152 75,130 Z', '#FFFAF2') + // belly
    el(100, 140, 14, 14, '#FFFAF2', 'none', 0) +          // belly center
    // bushy tail
    pa('M146 140 Q185 110 175 75 Q165 90 155 105 Q145 120 146 140', '#E06020', dark, 1.5) +
    ci(172, 77, 9, '#FFFAF2', dark, 1) +                  // tail tip
    ci(83, 110, 5, dark, 'none', 0) + ci(84, 108, 1.5, '#FFF', 'none', 0) + // left eye
    ci(117, 110, 5, dark, 'none', 0) + ci(118, 108, 1.5, '#FFF', 'none', 0) + // right eye
    el(100, 128, 7, 5, dark, 'none', 0) +                 // nose
    pa('M100,133 L100,140', 'none', dark, 2) + pa('M100,140 Q94,146 90,144', 'none', dark, 2) + pa('M100,140 Q106,146 110,144', 'none', dark, 2);
}

function draw_zebra() {
  const white = '#F4F4F0'; const black = '#2C2C2C';
  return bg('#E8E8DC') +
    el(100, 148, 48, 36, white) +                         // body
    // stripes on body
    pa('M60,148 Q68,112 75,138', 'none', black, 3) +
    pa('M75,148 Q83,108 90,136', 'none', black, 3) +
    pa('M90,148 Q100,106 110,136', 'none', black, 3) +
    pa('M115,148 Q122,108 128,136', 'none', black, 3) +
    pa('M130,148 Q138,112 143,136', 'none', black, 3) +
    // neck
    pa('M88,128 Q90,95 100,88 Q110,95 112,128', white, black, 1.5) +
    // mane
    pa('M92,128 Q88,100 94,88', 'none', black, 2.5) +
    pa('M96,126 Q92,98 96,86', 'none', black, 2.5) +
    pa('M100,125 Q96,96 100,85', 'none', black, 2.5) +
    pa('M104,126 Q102,97 104,86', 'none', black, 2.5) +
    ci(100, 76, 28, white) +                             // head
    // head stripes
    pa('M78,66 Q80,76 76,86', 'none', black, 2) +
    pa('M88,62 Q90,74 86,87', 'none', black, 2) +
    po('78,50 84,72 72,72', white, black) +               // left ear
    po('122,50 128,72 116,72', white, black) +            // right ear
    el(100, 88, 14, 9, white, black, 1) +                 // muzzle
    ci(100, 83, 4, black, 'none', 0) +                   // nose
    eyes(84, 70, 116, 70, 6);
}

function draw_kos() {
  const body = '#2C2C2C'; const beak = '#F0A000';
  return bg('#2D5A1B') +
    pa('M130,165 Q158,148 168,130 Q155,135 140,148 Q130,155 128,165', body, '#1A1A1A') + // tail
    el(100, 148, 42, 34, body) +                          // body
    ci(100, 86, 30, body) +                              // head
    po('96,86 115,80 112,94', beak, '#C07800') +          // beak
    ci(88, 78, 7, '#FFF') + ci(89, 79, 4, '#2C2C2C', 'none', 0) + ci(87, 77, 1.5, '#FFF', 'none', 0) + // eye
    pa('M88,162 Q84,175 78,180', 'none', body, 2) + pa('M112,162 Q116,175 122,180', 'none', body, 2); // feet
}

function draw_krava() {
  const white = '#F4F0E8'; const spot = '#2C2C2C';
  return bg('#E8F0FF') +
    // horns
    pa('M75,55 Q60,38 50,45', 'none', '#C0A040', 3) +
    pa('M125,55 Q140,38 150,45', 'none', '#C0A040', 3) +
    el(100, 148, 50, 38, white) +                         // body
    // spots on body
    el(80, 140, 12, 9, spot, 'none', 0) +
    el(115, 130, 10, 12, spot, 'none', 0) +
    el(95, 162, 8, 6, spot, 'none', 0) +
    el(75, 175, 10, 5, '#F4A0B0', '#E08090', 1) +         // udder
    ci(100, 78, 32, white) +                             // head
    el(76, 80, 12, 9, white, spot, 1) +                   // left ear
    el(124, 80, 12, 9, white, spot, 1) +                  // right ear
    el(100, 90, 17, 11, '#F0DFCC', spot, 1) +             // muzzle
    el(96, 87, 4, 3, spot, 'none', 0) +                   // left nostril
    el(104, 87, 4, 3, spot, 'none', 0) +                  // right nostril
    eyes(84, 70, 116, 70, 7) +
    smile(100, 96, 8, 4);
}

function draw_kun() {
  const fur = '#A06840'; const dark = '#6B3C18'; const mane = '#3A2410';
  const muzzle = '#D9A878'; const earIn = '#FFB5C0';
  return bg('#FFF0D9') +
    // body + head merged (tall oval)
    el(100, 120, 50, 58, fur, '#2C2C2C', 1.5) +
    // mane: dark crescent across top of head, scalloped
    pa('M58,98 Q60,68 78,60 Q92,52 100,52 Q108,52 122,60 Q140,68 142,98 Q132,86 120,90 Q116,76 100,74 Q84,76 80,90 Q68,86 58,98 Z', mane, dark, 1.5) +
    // ears (poke through mane)
    po('72,50 86,80 90,72', fur, dark, 1.5) +
    po('128,50 114,80 110,72', fur, dark, 1.5) +
    po('76,58 86,76 88,72', earIn, 'none', 0) +
    po('124,58 114,76 112,72', earIn, 'none', 0) +
    // forelock tuft between ears
    pa('M88,72 Q94,90 100,88 Q106,90 112,72 Q106,80 100,80 Q94,80 88,72 Z', mane, 'none', 0) +
    // muzzle (lighter)
    el(100, 150, 26, 22, muzzle, dark, 1) +
    // nostrils
    el(93, 148, 2.5, 3.5, '#2C2C2C', 'none', 0) +
    el(107, 148, 2.5, 3.5, '#2C2C2C', 'none', 0) +
    // eyes
    eyes(84, 108, 116, 108, 6) +
    // mouth
    smile(100, 158, 8, 4);
}

function draw_zaba() {
  const green = '#4DB04D'; const dkGreen = '#2A7A2A'; const belly = '#A8E880';
  return bg('#C8F0C0') +
    el(100, 145, 48, 36, green) +                         // body
    el(100, 148, 32, 22, belly, dkGreen, 1) +             // belly
    // front legs
    el(66, 162, 18, 10, green, dkGreen, 1.5) +
    el(134, 162, 18, 10, green, dkGreen, 1.5) +
    ci(100, 102, 32, green) +                            // head
    // eyes on TOP of head (key feature)
    ci(82, 80, 14, green) + ci(118, 80, 14, green) +      // eye bumps
    bigEyes(82, 80, 118, 80, 11) +
    // wide smile
    pa('M68,116 Q100,135 132,116', 'none', dkGreen, 3) +
    ci(100, 115, 5, '#FF8080', 'none', 0) +               // nose dots
    ci(96, 113, 2, dkGreen, 'none', 0) + ci(104, 113, 2, dkGreen, 'none', 0);
}

function draw_slon() {
  const gray = '#A0A0B4'; const lgray = '#C4C4D4';
  return bg('#E0E8FF') +
    // left ear (large)
    el(62, 105, 32, 40, lgray, gray, 1.5) +
    // right ear (large)
    el(138, 105, 32, 40, lgray, gray, 1.5) +
    el(100, 150, 50, 38, gray) +                          // body
    ci(100, 90, 38, gray) +                              // head
    // trunk (S-curve)
    pa('M92,118 Q78,135 82,155 Q88,170 96,168', 'none', gray, 10) +
    pa('M92,118 Q78,135 82,155 Q88,170 96,168', 'none', lgray, 6) +
    // tusks
    pa('M86,118 Q72,130 74,148', 'none', '#F4F0DC', 3) +
    pa('M88,117 Q75,128 77,146', 'none', '#F4F0DC', 2) +
    eyes(85, 80, 115, 80, 7) +
    smile(100, 110, 10, 4);
}

function draw_medved() {
  const brown = '#7A4020'; const light = '#C08050';
  return bg('#E0F4D0') +
    // ears
    ci(72, 64, 18, brown) + ci(72, 64, 11, light) +
    ci(128, 64, 18, brown) + ci(128, 64, 11, light) +
    el(100, 148, 50, 40, brown) +                         // body
    el(100, 148, 30, 26, light, brown, 1) +               // belly
    ci(100, 84, 36, brown) +                             // head
    el(100, 96, 20, 14, light, brown, 1) +                // muzzle
    ci(100, 90, 6, '#2C2C2C', 'none', 0) +               // nose
    eyes(82, 76, 118, 76, 7) +
    smile(100, 103, 8, 4) +
    // claws
    li(72, 182, 68, 190, '#4A2010', 2) + li(78, 183, 75, 191, '#4A2010', 2) + li(84, 183, 82, 191, '#4A2010', 2);
}

function draw_had() {
  const green = '#4A9A4A'; const dkGreen = '#2A6A2A'; const belly = '#A0D480';
  return bg('#D4F0C0') +
    // S-shaped body
    pa('M60,168 Q30,150 40,120 Q50,90 80,90 Q110,90 120,70 Q130,50 115,30 Q105,18 100,15',
      'none', green, 22) +
    pa('M60,168 Q30,150 40,120 Q50,90 80,90 Q110,90 120,70 Q130,50 115,30 Q105,18 100,15',
      'none', belly, 14) +
    // head
    el(100, 20, 16, 12, green) +
    // scales hint
    pa('M55,150 Q50,145 60,140', 'none', dkGreen, 1.5) +
    pa('M60,130 Q55,125 65,120', 'none', dkGreen, 1.5) +
    pa('M73,110 Q68,105 78,100', 'none', dkGreen, 1.5) +
    // eyes
    ci(93, 17, 4, '#FFF') + ci(93.5, 17.5, 2.5, '#2C2C2C', 'none', 0) +
    ci(107, 17, 4, '#FFF') + ci(107.5, 17.5, 2.5, '#2C2C2C', 'none', 0) +
    // tongue
    pa('M100,27 L100,36 L96,40', 'none', '#CC2020', 1.5) +
    pa('M100,36 L104,40', 'none', '#CC2020', 1.5);
}

function draw_cap() {
  const gray = '#C0B898'; const dark = '#6A5A3A'; const beard = '#D8D0B8';
  return bg('#FFF8E0') +
    // horns
    pa('M78,54 Q58,30 50,42', 'none', '#A09070', 4) +
    pa('M122,54 Q142,30 150,42', 'none', '#A09070', 4) +
    el(100, 148, 46, 36, gray) +                          // body
    ci(100, 82, 32, gray) +                              // head
    el(76, 84, 12, 9, gray, dark, 1) +                    // left ear
    el(124, 84, 12, 9, gray, dark, 1) +                   // right ear
    el(100, 94, 16, 11, '#D8CCB0', dark, 1) +             // muzzle
    // beard
    pa('M90,106 Q100,128 110,106 Q105,118 100,120 Q95,118 90,106', beard, dark, 1) +
    ci(100, 89, 5, '#3A2A1A', 'none', 0) +               // nose
    eyes(83, 74, 117, 74, 7) +
    smile(100, 101, 7, 3);
}

function draw_orel() {
  const brown = '#6A3C10'; const white = '#F4F0E8'; const yellow = '#E8C020';
  return bg('#B0D4FF') +
    // wings spread
    pa('M30,100 Q40,75 70,90 Q90,98 100,105', brown, '#4A2808', 1.5) +
    pa('M170,100 Q160,75 130,90 Q110,98 100,105', brown, '#4A2808', 1.5) +
    pa('M30,110 Q38,120 65,108 Q85,102 100,108', brown, '#4A2808', 1) +
    pa('M170,110 Q162,120 135,108 Q115,102 100,108', brown, '#4A2808', 1) +
    el(100, 130, 32, 28, brown) +                         // body
    ci(100, 82, 28, white) +                             // white head
    // beak
    pa('M90,92 Q100,105 110,92 Q104,98 100,100 Q96,98 90,92', yellow, '#C0A000') +
    eyes(85, 78, 115, 78, 7) +
    // tail
    pa('M86,155 Q100,172 114,155 L118,165 Q100,178 82,165 Z', brown, '#4A2808', 1);
}

function draw_vlk() {
  const gray = '#888888'; const lgray = '#CCCCCC'; const dark = '#2C2C2C';
  return bg('#2A4020') +
    pa('M145,155 Q175,125 168,100 Q160,118 150,132 Q142,145 145,155', gray, '#606060', 1.5) + // tail
    el(100, 148, 46, 36, gray) +                          // body
    el(100, 148, 28, 22, lgray, gray, 1) +                // belly
    po('72,44 82,74 62,74', gray, dark) +                 // left ear pointed
    po('128,44 138,74 118,74', gray, dark) +              // right ear pointed
    ci(100, 82, 32, gray) +                              // head
    el(100, 96, 20, 13, lgray, gray, 1) +                 // muzzle (wolf has longer snout)
    pa('M86,96 Q100,88 114,96', 'none', gray, 1) +        // snout top
    ci(100, 93, 5, dark, 'none', 0) +                    // nose
    // amber wolf eyes
    eyes(83, 73, 117, 73, 7, '#806000') +
    smile(100, 100, 7, 3);
}

function draw_rys() {
  const tan = '#C0944C'; const spot = '#8B5E20'; const ear = '#F8C8A0';
  return bg('#D8E8C0') +
    // short tail
    pa('M140,158 Q158,148 155,135', 'none', tan, 6) +
    el(100, 148, 44, 34, tan) +                           // body
    // spots on body
    el(80, 138, 8, 6, spot, 'none', 0) + el(100, 130, 8, 6, spot, 'none', 0) + el(120, 142, 8, 6, spot, 'none', 0) +
    // ears with TUFTS (key feature)
    po('70,44 78,72 62,72', tan, spot) +
    po('130,44 138,72 122,72', tan, spot) +
    po('72,44 76,58 68,58', '#1A1A1A', 'none', 0) +      // left tuft
    po('128,44 132,58 124,58', '#1A1A1A', 'none', 0) +   // right tuft
    ci(100, 80, 32, tan) +                               // head
    el(100, 93, 18, 11, ear, tan, 1) +                   // muzzle
    ci(100, 89, 5, '#3A2010', 'none', 0) +               // nose
    // spots on face
    el(86, 78, 5, 4, spot, 'none', 0) + el(114, 78, 5, 4, spot, 'none', 0) +
    eyes(83, 72, 117, 72, 7) +
    smile(100, 99, 7, 3);
}

function draw_jelen() {
  const brown = '#8B5E30'; const light = '#C8A870';
  return bg('#C8E8A0') +
    // antlers (key feature)
    pa('M82,55 Q70,35 58,28 Q62,38 68,42 Q58,30 55,38 Q63,44 69,46 Q60,36 63,46 Q70,44 72,52', 'none', '#6A3C10', 3) +
    pa('M118,55 Q130,35 142,28 Q138,38 132,42 Q142,30 145,38 Q137,44 131,46 Q140,36 137,46 Q130,44 128,52', 'none', '#6A3C10', 3) +
    pa('M148,155 Q170,130 164,108 Q157,122 150,136 Q145,148 148,155', brown, '#6A3C10', 1.5) + // tail
    el(100, 148, 46, 36, brown) +                         // body
    // white rump
    el(125, 155, 18, 14, '#F8F0E0', 'none', 0) +
    ci(100, 82, 30, brown) +                             // head
    el(76, 84, 12, 8, brown, '#6A3C10', 1) +              // left ear
    el(124, 84, 12, 8, brown, '#6A3C10', 1) +             // right ear
    el(100, 93, 15, 10, light, brown, 1) +                // muzzle
    ci(100, 89, 5, '#2C1A08', 'none', 0) +               // nose
    eyes(83, 74, 117, 74, 7) +
    smile(100, 99, 7, 3);
}

function draw_srna() {
  const brown = '#C0905C'; const spot = '#FFFFF0';
  return bg('#D0E8A0') +
    pa('M148,155 Q168,132 162,108 Q156,122 150,136 Q146,148 148,155', brown, '#906840', 1.5) +
    el(100, 148, 44, 36, brown) +                         // body
    // white spots (fawn)
    ci(82, 138, 5, spot, 'none', 0) + ci(96, 132, 5, spot, 'none', 0) + ci(112, 138, 5, spot, 'none', 0) +
    ci(86, 150, 4, spot, 'none', 0) + ci(104, 148, 4, spot, 'none', 0) + ci(120, 150, 4, spot, 'none', 0) +
    el(118, 156, 16, 12, '#F0E8D8', 'none', 0) +          // white rump
    ci(100, 82, 28, brown) +                             // head
    el(76, 84, 14, 9, brown, '#906840', 1) +              // left ear (large)
    el(76, 84, 9, 5, '#FFD0C0', 'none', 0) +              // ear inner
    el(124, 84, 14, 9, brown, '#906840', 1) +             // right ear
    el(124, 84, 9, 5, '#FFD0C0', 'none', 0) +
    el(100, 90, 14, 9, '#D4AC80', brown, 1) +             // muzzle
    ci(100, 87, 4, '#2C1A08', 'none', 0) +               // nose
    eyes(83, 74, 117, 74, 7) +
    smile(100, 96, 7, 3);
}

function draw_prase() {
  const pink = '#F4A0B0'; const dpink = '#C07090';
  return bg('#FFE8F0') +
    // curly tail
    pa('M148,145 Q165,135 162,122 Q158,130 152,138 Q148,143 148,145', 'none', dpink, 3) +
    el(100, 148, 50, 40, pink) +                          // body
    ci(100, 82, 36, pink) +                              // head
    // ears (round pig ears)
    el(72, 65, 16, 12, pink, dpink, 1.5) +
    el(128, 65, 16, 12, pink, dpink, 1.5) +
    // big round snout (key feature)
    ci(100, 98, 20, '#F8C0CC', dpink, 2) +
    ci(93, 97, 5, dpink, 'none', 0) +                    // left nostril
    ci(107, 97, 5, dpink, 'none', 0) +                   // right nostril
    eyes(82, 74, 118, 74, 8) +
    smile(100, 112, 8, 4);
}

function draw_ovce() {
  const wool = '#F0EEE8'; const face = '#C8B090'; const dark = '#2C2C2C';
  return bg('#D8F0FF') +
    // fluffy wool body (irregular blob)
    pa('M50,155 Q42,130 50,112 Q58,95 70,105 Q62,85 80,80 Q90,70 100,75 Q110,70 120,80 Q138,85 130,105 Q142,95 150,112 Q158,130 150,155 Z', wool, dark, 1.5) +
    // extra fluff bumps
    ci(65, 108, 15, wool, dark, 1) + ci(85, 90, 16, wool, dark, 1) + ci(100, 84, 16, wool, dark, 1) + ci(115, 90, 16, wool, dark, 1) + ci(135, 108, 15, wool, dark, 1) +
    // head
    ci(100, 84, 24, face) +
    el(74, 86, 10, 8, face, dark, 1) +                    // left ear
    el(126, 86, 10, 8, face, dark, 1) +                   // right ear
    el(100, 93, 13, 8, '#D8C0A0', face, 1) +              // muzzle
    ci(100, 90, 4, dark, 'none', 0) +                    // nose
    eyes(88, 80, 112, 80, 6) +
    // legs
    re(76, 170, 12, 20, 3, face) + re(92, 170, 12, 20, 3, face) + re(108, 170, 12, 20, 3, face) + re(122, 170, 12, 20, 3, face);
}

function draw_koza() {
  const white = '#E8E4D8'; const dark = '#6A6050';
  return bg('#F0F8E0') +
    // curved horns (shorter than cap)
    pa('M80,56 Q64,38 58,48', 'none', '#A09060', 3.5) +
    pa('M120,56 Q136,38 142,48', 'none', '#A09060', 3.5) +
    el(100, 148, 44, 36, white) +                         // body
    ci(100, 82, 30, white) +                             // head
    el(76, 84, 12, 8, white, dark, 1) +                   // left ear
    el(124, 84, 12, 8, white, dark, 1) +                  // right ear
    el(100, 93, 15, 10, '#D8D0B8', dark, 1) +             // muzzle
    // small beard
    pa('M96,104 Q100,115 104,104 Q102,112 100,114 Q98,112 96,104', '#D8D0B8', dark, 1) +
    ci(100, 89, 5, '#3A3020', 'none', 0) +               // nose
    eyes(83, 74, 117, 74, 7) +
    // udder
    el(90, 176, 14, 8, '#F4B0C0', '#E09090', 1) +
    smile(100, 99, 7, 3);
}

function draw_kohout() {
  const body = '#A04820'; const comb = '#CC2020'; const tail = '#E8A030';
  return bg('#FFF0D8') +
    // colorful tail feathers (key feature)
    pa('M130,120 Q168,90 172,70', 'none', '#E84080', 3) +
    pa('M132,128 Q172,106 178,88', 'none', '#4080E8', 3) +
    pa('M130,138 Q170,125 172,112', 'none', tail, 3) +
    pa('M128,148 Q165,142 164,130', 'none', '#60C040', 3) +
    el(100, 148, 40, 34, body) +                          // body
    ci(100, 84, 26, body) +                              // head
    // comb (triple peak - key feature)
    po('84,58 88,76 92,58 96,76 100,58 104,76 108,58 112,76 116,58', comb, '#AA1818', 1.5) +
    // wattle
    el(100, 102, 8, 7, comb, '#AA1818', 1) +
    // beak
    po('94,88 100,98 106,88 100,92', '#E8A020', '#C07800') +
    eyes(86, 78, 114, 78, 6) +
    li(85, 172, 80, 185, '#8B4010', 2) + li(115, 172, 120, 185, '#8B4010', 2); // feet
}

function draw_slepice() {
  const body = '#C07040'; const comb = '#CC2020';
  return bg('#FFF8E0') +
    // small tail
    pa('M130,130 Q152,118 148,102', 'none', body, 4) +
    pa('M130,138 Q154,130 152,116', 'none', '#A05830', 3) +
    el(100, 148, 40, 32, body) +                          // body
    ci(100, 86, 26, body) +                              // head
    // small comb
    po('88,64 92,78 96,64 100,78 104,64 108,78 112,64', comb, '#AA1818', 1.5) +
    // wattle
    el(100, 100, 6, 6, comb, '#AA1818', 1) +
    po('94,90 100,100 106,90 100,95', '#E8A020', '#C07800') + // beak
    eyes(86, 80, 114, 80, 6) +
    li(85, 172, 80, 185, '#8B4010', 2) + li(115, 172, 120, 185, '#8B4010', 2);
}

function draw_kachna() {
  const bodyCol = '#E8E4D8'; const headCol = '#2C7A20'; const beak = '#E8A020';
  return bg('#D0EEFF') +
    // tail
    pa('M128,140 Q148,125 144,108', 'none', '#C0B898', 3) +
    el(100, 150, 44, 30, bodyCol) +                       // body
    el(100, 150, 30, 18, '#FFFAF0', 'none', 0) +          // belly
    ci(100, 85, 26, headCol) +                           // green head (key)
    // white neck ring
    el(100, 106, 12, 4, '#EEEEEE', '#AAAAAA', 1) +
    po('88,92 100,104 112,92 100,97', beak, '#C07800') +  // beak
    ci(88, 80, 6, '#FFF') + ci(88.5, 80.5, 3.5, '#2C2C2C', 'none', 0) + ci(87, 79, 1.2, '#FFF', 'none', 0) + // eye
    // feet
    el(83, 174, 14, 7, beak, '#C07800', 1) +
    el(117, 174, 14, 7, beak, '#C07800', 1);
}

function draw_husa() {
  const white = '#F4F0E8'; const beak = '#E8A020';
  return bg('#C8ECFF') +
    // tail
    pa('M125,140 Q148,128 142,110', 'none', '#D8D4C8', 3) +
    el(100, 152, 44, 30, white) +                         // body
    // long neck (key feature)
    pa('M90,132 Q84,108 88,84 Q94,68 100,62 Q106,68 112,84 Q116,108 110,132', white, '#C0BCB0', 1.5) +
    ci(100, 62, 22, white) +                             // head
    po('88,70 100,82 112,70 100,76', beak, '#C07800') +   // beak
    ci(88, 58, 5, '#FFF') + ci(88.5, 58.5, 3, '#2C2C2C', 'none', 0) + ci(87, 57, 1, '#FFF', 'none', 0) + // eye
    el(83, 176, 14, 7, beak, '#C07800', 1) +
    el(117, 176, 14, 7, beak, '#C07800', 1);
}

function draw_kralik() {
  const fur = '#D4D0C8'; const pink = '#F4A0B0'; const eye = '#FF8090';
  return bg('#E8FFE8') +
    // cotton tail
    ci(140, 155, 10, '#FFFFF0', '#CCCCCC', 1) +
    el(100, 148, 42, 36, fur) +                           // body
    // LONG ears (key feature)
    el(80, 52, 14, 40, fur, '#AAAAAA', 1.5) +
    el(80, 52, 8, 30, pink, 'none', 0) +                  // ear inner
    el(120, 52, 14, 40, fur, '#AAAAAA', 1.5) +
    el(120, 52, 8, 30, pink, 'none', 0) +
    ci(100, 86, 30, fur) +                               // head
    el(100, 97, 16, 10, '#E8C4D0', '#AAAAAA', 1) +        // muzzle
    ci(100, 93, 5, pink, '#CC7080', 1) +                  // nose (pink)
    eyes(83, 78, 117, 78, 7, '#800020') +                 // pink/red eyes
    smile(100, 102, 7, 3);
}

function draw_mys() {
  const gray = '#A0A0A0'; const pink = '#F4B0C0';
  return bg('#E8E8F4') +
    // long tail
    pa('M135,160 Q168,145 170,118 Q165,130 155,145 Q145,158 135,160', gray, '#707070', 1.5) +
    el(100, 148, 40, 34, gray) +                          // body
    // round ears (key - like Mickey)
    ci(72, 68, 20, gray) + ci(72, 68, 13, pink) +
    ci(128, 68, 20, gray) + ci(128, 68, 13, pink) +
    ci(100, 84, 28, gray) +                              // head
    el(100, 93, 13, 9, '#C0C0C0', gray, 1) +              // muzzle
    ci(100, 89, 4, pink, '#C07080', 1) +                  // nose
    li(86, 93, 72, 90, gray, 1) + li(86, 95, 72, 95, gray, 1) + // whiskers
    li(114, 93, 128, 90, gray, 1) + li(114, 95, 128, 95, gray, 1) +
    eyes(86, 78, 114, 78, 6);
}

function draw_krysa() {
  const gray = '#787878'; const lgray = '#B0B0B0';
  return bg('#D0D0D8') +
    // long tail
    pa('M138,158 Q175,140 178,108 Q170,124 160,140 Q150,156 138,158', gray, '#505050', 1.5) +
    el(100, 148, 42, 34, gray) +                          // body
    el(100, 148, 26, 20, lgray, 'none', 0) +              // belly
    // rounder ears (not as prominent as mouse)
    ci(74, 72, 16, gray) + ci(74, 72, 10, '#C0A0A0') +
    ci(126, 72, 16, gray) + ci(126, 72, 10, '#C0A0A0') +
    ci(100, 84, 28, gray) +                              // head
    // longer snout
    el(100, 97, 16, 11, lgray, gray, 1) +
    ci(100, 92, 5, '#CC5050', '#AA3030', 1) +             // nose (rat-like)
    li(84, 97, 68, 94, gray, 1) + li(84, 99, 68, 99, gray, 1) + // whiskers
    li(116, 97, 132, 94, gray, 1) + li(116, 99, 132, 99, gray, 1) +
    eyes(84, 77, 116, 77, 6);
}

function draw_tygr() {
  const orange = '#E87020'; const dark = '#2C2C2C';
  return bg('#FFF0D0') +
    // tail with stripes
    pa('M148,148 Q174,120 168,95 Q162,112 154,128 Q148,142 148,148', orange, '#C05010', 2) +
    li(150, 148, 168, 125, dark, 2) + li(153, 138, 170, 118, dark, 2) +
    el(100, 148, 46, 36, orange) +                        // body
    // body stripes
    li(70, 140, 66, 120, dark, 2.5) + li(82, 148, 78, 125, dark, 2.5) + li(95, 150, 95, 126, dark, 2.5) +
    li(118, 148, 118, 126, dark, 2.5) + li(130, 148, 126, 125, dark, 2.5) +
    ci(100, 82, 34, orange) +                            // head
    el(100, 95, 20, 13, '#F0D0A0', orange, 1) +           // muzzle
    // head stripes
    li(86, 64, 84, 76, dark, 2) + li(94, 60, 93, 74, dark, 2) + li(102, 60, 103, 74, dark, 2) + li(110, 60, 109, 74, dark, 2) +
    ci(100, 90, 5, dark, 'none', 0) +                    // nose
    eyes(82, 74, 118, 74, 7) +
    li(86, 97, 70, 94, '#C05010', 1) + li(86, 99, 70, 99, '#C05010', 1) + // whiskers
    li(114, 97, 130, 94, '#C05010', 1) + li(114, 99, 130, 99, '#C05010', 1);
}

function draw_opice() {
  const brown = '#8B5030'; const face = '#D4A870';
  return bg('#60A040') +
    // long tail
    pa('M142,155 Q175,135 178,105 Q168,125 158,142 Q150,154 142,155', brown, '#6A3820', 2) +
    el(100, 148, 44, 36, brown) +                         // body
    el(100, 148, 30, 22, face, brown, 1) +                // belly
    // large round ears (key feature)
    ci(66, 82, 18, brown) + ci(66, 82, 12, face) +
    ci(134, 82, 18, brown) + ci(134, 82, 12, face) +
    ci(100, 82, 32, brown) +                             // head
    // lighter face center (key feature)
    el(100, 88, 22, 20, face, brown, 1) +
    el(100, 96, 16, 11, '#E8C090', face, 1) +             // muzzle
    ci(100, 92, 5, '#3A2010', 'none', 0) +               // nose
    eyes(85, 79, 115, 79, 7) +
    smile(100, 103, 8, 4);
}

function draw_zirafa() {
  const yellow = '#E8C040'; const spot = '#8B5C10'; const horn = '#D0A030';
  return bg('#F8ECC0') +
    // long neck + body (key feature - fills most of height)
    pa('M78,182 Q74,155 76,130 Q80,100 88,72 Q94,50 100,40 Q106,50 112,72 Q120,100 124,130 Q126,155 122,182', yellow, spot, 1.5) +
    // spots on body and neck
    el(90, 165, 9, 7, spot, 'none', 0) + el(110, 158, 8, 6, spot, 'none', 0) +
    el(84, 140, 8, 10, spot, 'none', 0) + el(115, 135, 9, 7, spot, 'none', 0) +
    el(92, 115, 7, 9, spot, 'none', 0) + el(108, 110, 8, 7, spot, 'none', 0) +
    el(86, 90, 7, 8, spot, 'none', 0) + el(114, 92, 7, 7, spot, 'none', 0) +
    ci(100, 38, 22, yellow) +                            // head
    // ossicones (key feature)
    li(92, 18, 88, 8, horn, 3) + ci(88, 7, 3, horn) +
    li(108, 18, 112, 8, horn, 3) + ci(112, 7, 3, horn) +
    el(76, 38, 10, 6, yellow, spot, 1) +                  // left ear
    el(124, 38, 10, 6, yellow, spot, 1) +                 // right ear
    el(100, 46, 12, 8, '#E0B848', spot, 1) +              // muzzle
    ci(100, 43, 4, spot, 'none', 0) +                    // nose
    ci(91, 32, 5, '#FFF') + ci(91.5, 32.5, 3, '#2C2C2C', 'none', 0) +  // left eye
    ci(109, 32, 5, '#FFF') + ci(109.5, 32.5, 3, '#2C2C2C', 'none', 0); // right eye
}

function draw_velbloud() {
  const tan = '#D4A050'; const dark = '#8B5E20';
  return bg('#F8E8B0') +
    // two humps (key feature)
    pa('M72,90 Q72,52 90,52 Q108,52 108,90', tan, dark, 1.5) +
    pa('M92,95 Q92,58 110,58 Q128,58 128,95', tan, dark, 1.5) +
    el(100, 148, 50, 38, tan) +                           // body
    // neck
    pa('M86,118 Q82,90 86,68 Q92,58 100,54 Q108,58 114,68 Q118,90 114,118', tan, dark, 1.5) +
    ci(100, 52, 22, tan) +                               // head
    el(76, 54, 10, 6, tan, dark, 1) +                     // left ear
    el(124, 54, 10, 6, tan, dark, 1) +                    // right ear
    el(100, 62, 14, 9, '#E0B848', dark, 1) +              // muzzle
    ci(97, 59, 3, dark, 'none', 0) + ci(103, 59, 3, dark, 'none', 0) + // nostrils
    eyes(90, 44, 110, 44, 6) +
    // eyelashes
    li(87, 37, 86, 33, dark, 1.5) + li(90, 36, 90, 32, dark, 1.5) + li(93, 37, 93, 33, dark, 1.5) +
    li(107, 37, 106, 33, dark, 1.5) + li(110, 36, 110, 32, dark, 1.5) + li(113, 37, 113, 33, dark, 1.5);
}

function draw_tucnak() {
  const black = '#2C2C2C'; const beak = '#E89020';
  return bg('#C0DCFF') +
    el(100, 145, 40, 50, black) +                         // body
    el(100, 148, 26, 38, '#F4F0E8', 'none', 0) +          // white belly
    ci(100, 80, 30, black) +                             // head
    // eye patches
    el(84, 78, 14, 10, '#F4F0E8', 'none', 0) + el(116, 78, 14, 10, '#F4F0E8', 'none', 0) +
    // eyes on white patches
    ci(84, 79, 6, '#FFF') + ci(84.5, 79.5, 3.5, '#2C2C2C', 'none', 0) + ci(83, 78, 1.2, '#FFF', 'none', 0) +
    ci(116, 79, 6, '#FFF') + ci(116.5, 79.5, 3.5, '#2C2C2C', 'none', 0) + ci(115, 78, 1.2, '#FFF', 'none', 0) +
    po('92,94 100,106 108,94 100,100', beak, '#C07000') + // beak
    // flippers
    el(64, 125, 16, 30, black, '#1A1A1A', 1.5, 'rotate(-20 64 125)') +
    el(136, 125, 16, 30, black, '#1A1A1A', 1.5, 'rotate(20 136 125)') +
    // feet
    el(86, 188, 14, 7, beak, '#C07000', 1) + el(114, 188, 14, 7, beak, '#C07000', 1);
}

function draw_tulen() {
  const gray = '#7090A8'; const lgray = '#A8C0CC'; const dark = '#2C2C2C';
  return bg('#B0D8F0') +
    el(100, 145, 52, 44, gray) +                          // body
    el(100, 148, 35, 28, lgray, 'none', 0) +              // belly
    // flippers (key feature)
    pa('M52,148 Q30,140 28,162 Q40,158 52,155', gray, '#506070', 1.5) +
    pa('M148,148 Q170,140 172,162 Q160,158 148,155', gray, '#506070', 1.5) +
    // tail flipper
    pa('M82,185 Q100,192 118,185 Q108,183 100,185 Q92,183 82,185', gray, '#506070', 1.5) +
    ci(100, 85, 30, gray) +                              // head
    // whiskers
    li(82, 93, 65, 90, lgray, 1.5) + li(82, 95, 65, 96, lgray, 1.5) + li(82, 97, 65, 102, lgray, 1.5) +
    li(118, 93, 135, 90, lgray, 1.5) + li(118, 95, 135, 96, lgray, 1.5) + li(118, 97, 135, 102, lgray, 1.5) +
    el(100, 92, 14, 10, lgray, gray, 1) +                 // muzzle
    ci(100, 88, 5, dark, 'none', 0) +                    // nose
    eyes(84, 77, 116, 77, 8, '#1A4060') +
    smile(100, 99, 7, 4);
}

function draw_delfin() {
  const blue = '#6090C0'; const lblue = '#A0C4E0';
  return bg('#80C0F0') +
    // dorsal fin (key)
    pa('M105,60 Q112,35 118,60', blue, '#4070A0', 2) +
    // streamlined body (horizontal)
    el(100, 110, 65, 28, blue) +
    el(100, 114, 45, 18, lblue, 'none', 0) +             // belly
    // tail fin (key)
    pa('M162,100 Q185,85 188,100 Q185,114 162,118 Q172,108 162,110 Z', blue, '#4070A0', 1.5) +
    // rostrum
    pa('M37,106 Q22,108 22,112 Q30,114 37,112', blue, '#4070A0', 1.5) +
    // eye
    ci(55, 100, 8, '#FFF') + ci(55.5, 100.5, 5, '#2C2C2C', 'none', 0) + ci(54, 99, 1.5, '#FFF', 'none', 0) +
    // smile (key - dolphin always smiles)
    pa('M37,112 Q55,125 75,115', 'none', '#2C2C2C', 2) +
    // pectoral fin
    pa('M80,126 Q70,145 88,142 Q84,135 80,126', blue, '#4070A0', 1.5) +
    // blowhole
    el(90, 82, 5, 3, '#4070A0', 'none', 0);
}

function draw_velryba() {
  const blue = '#4878B0'; const lblue = '#80B0D8';
  return bg('#2050A0') +
    // large body (horizontal)
    el(90, 110, 72, 38, blue) +
    el(88, 118, 50, 24, lblue, 'none', 0) +              // belly
    // tail fin (key)
    pa('M158,95 Q188,75 192,96 Q188,118 158,124 Q170,108 158,110 Z', blue, '#304878', 2) +
    // mouth/head
    pa('M18,105 Q15,95 18,88 Q28,78 45,95 Q32,100 18,105 Z', blue, '#304878', 1.5) +
    // eye
    ci(35, 92, 7, '#FFF') + ci(35.5, 92.5, 4.5, '#2C2C2C', 'none', 0) + ci(34, 91, 1.5, '#FFF', 'none', 0) +
    // dorsal fin
    pa('M106,72 Q112,48 120,72', blue, '#304878', 2) +
    // blowhole + spout
    ci(100, 75, 4, '#4070A0', 'none', 0) +
    pa('M97,72 Q90,55 93,40', 'none', '#A0D0F0', 2) + pa('M100,70 Q96,52 100,36', 'none', '#A0D0F0', 2) + pa('M103,72 Q108,55 107,40', 'none', '#A0D0F0', 2) + // spout
    // smile
    pa('M20,105 Q40,118 65,110', 'none', '#A0D0F0', 2);
}

function draw_zelva() {
  const shell = '#5A8A40'; const dshell = '#3A6020'; const skin = '#80B060';
  return bg('#B0D890') +
    // shell (key feature)
    el(100, 120, 50, 44, shell) +
    // shell pattern (hexagons approximated as arcs)
    pa('M100,80 L110,88 L110,102 L100,110 L90,102 L90,88 Z', dshell, dshell, 1) +
    pa('M118,92 L128,100 L128,112 L118,120 L108,112 L108,100 Z', dshell, dshell, 1) +
    pa('M82,92 L92,100 L92,112 L82,120 L72,112 L72,100 Z', dshell, dshell, 1) +
    pa('M100,112 L110,120 L110,132 L100,140 L90,132 L90,120 Z', dshell, dshell, 1) +
    // rim of shell
    el(100, 120, 50, 44, 'none', dshell, 2) +
    // head sticking out
    ci(70, 90, 20, skin) +
    ci(68, 90, 14, skin, dshell, 1) +
    el(58, 96, 10, 7, skin, dshell, 1) +                  // muzzle
    ci(56, 93, 4, dshell, 'none', 0) +                   // nose
    eyes(62, 83, 78, 83, 6) +
    // legs sticking out
    el(68, 152, 16, 9, skin, dshell, 1) +
    el(132, 152, 16, 9, skin, dshell, 1) +
    el(82, 162, 16, 9, skin, dshell, 1) +
    el(118, 162, 16, 9, skin, dshell, 1) +
    // tail
    pa('M148,130 Q160,128 162,136', 'none', skin, 3);
}

function draw_ryba() {
  const blue = '#5090D0'; const lblue = '#90C0E8'; const fin = '#4070B0';
  return bg('#A0D0F8') +
    el(100, 110, 58, 30, blue) +                          // body
    el(95, 116, 42, 20, lblue, 'none', 0) +               // belly / shine
    // tail fin (key feature)
    pa('M155,86 Q185,96 185,124 Q158,114 155,132 Q155,108 155,110 Z', fin, '#305090', 1.5) +
    // dorsal fin
    pa('M88,80 Q95,60 110,80', fin, '#305090', 1.5) +
    // pectoral fin
    pa('M90,118 Q78,132 90,136 Q90,128 90,118', fin, '#305090', 1.5) +
    // scales
    pa('M80,100 Q88,93 88,108', 'none', fin, 1) +
    pa('M95,97 Q103,90 103,105', 'none', fin, 1) +
    pa('M110,98 Q118,91 118,106', 'none', fin, 1) +
    pa('M125,100 Q133,93 133,108', 'none', fin, 1) +
    // eye
    ci(58, 106, 9, '#FFF') + ci(58.5, 106.5, 5.5, '#2C2C2C', 'none', 0) + ci(57, 105, 1.5, '#FFF', 'none', 0) +
    // mouth
    pa('M40,110 Q45,116 40,122', 'none', '#2C2C2C', 2);
}

function draw_kapr() {
  const gold = '#D4900C'; const lgold = '#F0C050'; const fin = '#A06010';
  return bg('#88C878') +
    el(100, 110, 58, 30, gold) +                          // body
    el(95, 116, 42, 20, lgold, 'none', 0) +               // belly
    // tail fin
    pa('M155,86 Q185,96 185,124 Q158,114 155,132 Q155,108 155,110 Z', fin, '#804808', 1.5) +
    // dorsal fin
    pa('M88,80 Q95,60 112,80', fin, '#804808', 1.5) +
    // scales
    pa('M80,100 Q88,92 88,108', 'none', fin, 1.5) +
    pa('M95,97 Q103,89 103,105', 'none', fin, 1.5) +
    pa('M110,97 Q118,89 118,105', 'none', fin, 1.5) +
    pa('M125,100 Q133,92 133,108', 'none', fin, 1.5) +
    // barbels (key feature - carp whiskers)
    pa('M42,112 Q35,104 30,96', 'none', gold, 2) +
    pa('M42,112 Q35,118 30,126', 'none', gold, 2) +
    // eye
    ci(58, 106, 9, '#FFF') + ci(58.5, 106.5, 5.5, '#2C2C2C', 'none', 0) + ci(57, 105, 1.5, '#FFF', 'none', 0) +
    pa('M40,112 Q46,116 40,120', 'none', '#2C2C2C', 2);
}

function draw_cmelak() {
  const yellow = '#F0C020'; const black = '#2C2C2C';
  return bg('#C8F0A0') +
    // wings (transparent/light)
    el(72, 90, 28, 18, '#D0E8FF', '#90B0D0', 1.5, 'rotate(-20 72 90)') +
    el(128, 90, 28, 18, '#D0E8FF', '#90B0D0', 1.5, 'rotate(20 128 90)') +
    // round fuzzy body (key - bumble bees are ROUND)
    ci(100, 128, 36, yellow) +
    // stripes
    re(64, 115, 72, 11, 2, black, 'none', 0) +
    re(64, 130, 72, 11, 2, black, 'none', 0) +
    re(64, 115, 72, 11, 0, 'none', black, 1) + re(64, 130, 72, 11, 0, 'none', black, 1) +
    // clip to body shape with overlay
    ci(100, 128, 36, 'none', black, 2) +
    // head
    ci(100, 85, 22, yellow) +
    // antennae
    pa('M88,64 Q80,48 76,40', 'none', black, 2) + ci(76, 39, 4, black) +
    pa('M112,64 Q120,48 124,40', 'none', black, 2) + ci(124, 39, 4, black) +
    eyes(89, 84, 111, 84, 7) +
    // stinger
    pa('M100,163 Q100,172 100,175', 'none', black, 2.5);
}

function draw_vcela() {
  const yellow = '#F0C020'; const black = '#2C2C2C';
  return bg('#F8F0B0') +
    // wings (more elongated than cmelak)
    el(70, 86, 32, 15, '#D0E8FF', '#90B0D0', 1.5, 'rotate(-15 70 86)') +
    el(130, 86, 32, 15, '#D0E8FF', '#90B0D0', 1.5, 'rotate(15 130 86)') +
    el(100, 118, 22, 38, yellow) +                        // abdomen (slender)
    // bee stripes
    re(78, 104, 44, 9, 1, black, 'none', 0) + re(78, 118, 44, 9, 1, black, 'none', 0) + re(78, 132, 44, 9, 1, black, 'none', 0) +
    el(100, 118, 22, 38, 'none', black, 1.5) +
    el(100, 92, 16, 18, yellow) +                         // thorax
    ci(100, 70, 18, yellow) +                            // head
    pa('M87,52 Q80,38 76,30', 'none', black, 2) + ci(76, 29, 3.5, black) +
    pa('M113,52 Q120,38 124,30', 'none', black, 2) + ci(124, 29, 3.5, black) +
    eyes(91, 68, 109, 68, 6) +
    pa('M100,155 L100,162 L96,168', 'none', black, 2.5);  // stinger
}

function draw_mravenec() {
  const red = '#8B2020'; const dred = '#5A1010';
  return bg('#D4B890') +
    // three segments (key feature)
    // abdomen
    el(100, 155, 20, 26, red) +
    // thorax
    ci(100, 120, 15, red) +
    // head
    ci(100, 88, 16, red) +
    // 6 legs (key)
    li(86, 118, 65, 105, dred, 2) + li(65, 105, 55, 115, dred, 2) +  // left front
    li(86, 122, 65, 118, dred, 2) + li(65, 118, 55, 130, dred, 2) +  // left mid
    li(86, 126, 68, 135, dred, 2) + li(68, 135, 62, 148, dred, 2) +  // left rear
    li(114, 118, 135, 105, dred, 2) + li(135, 105, 145, 115, dred, 2) + // right front
    li(114, 122, 135, 118, dred, 2) + li(135, 118, 145, 130, dred, 2) + // right mid
    li(114, 126, 132, 135, dred, 2) + li(132, 135, 138, 148, dred, 2) + // right rear
    // antennae
    pa('M90,73 Q78,58 72,48', 'none', dred, 2) + ci(72, 47, 3, dred) +
    pa('M110,73 Q122,58 128,48', 'none', dred, 2) + ci(128, 47, 3, dred) +
    eyes(90, 86, 110, 86, 6) +
    // mandibles
    li(88, 99, 82, 106, dred, 2) + li(112, 99, 118, 106, dred, 2);
}

function draw_motyl() {
  const wing1 = '#E87030'; const wing2 = '#F0C040'; const body = '#4A2C10';
  return bg('#C0F0C0') +
    // upper wings (large - key feature)
    pa('M100,90 Q68,60 42,78 Q30,98 50,118 Q72,132 100,108', wing1, '#C05020', 1.5) +
    pa('M100,90 Q132,60 158,78 Q170,98 150,118 Q128,132 100,108', wing1, '#C05020', 1.5) +
    // lower wings
    pa('M100,108 Q74,118 60,140 Q68,158 90,152 Q106,148 100,128', wing2, '#C0A020', 1.5) +
    pa('M100,108 Q126,118 140,140 Q132,158 110,152 Q94,148 100,128', wing2, '#C0A020', 1.5) +
    // wing patterns
    ci(68, 95, 8, '#2C2C2C', 'none', 0) + ci(132, 95, 8, '#2C2C2C', 'none', 0) +
    ci(76, 100, 5, wing2, 'none', 0) + ci(124, 100, 5, wing2, 'none', 0) +
    // body (thin - key)
    el(100, 110, 6, 28, body) +
    ci(100, 80, 8, body) +                               // head
    // antennae
    pa('M95,73 Q82,52 78,40', 'none', body, 2) + ci(78, 39, 4, wing1, body, 1) +
    pa('M105,73 Q118,52 122,40', 'none', body, 2) + ci(122, 39, 4, wing1, body, 1) +
    eyes(94, 79, 106, 79, 4);
}

function draw_moucha() {
  const dark = '#404840'; const wing = '#D0E8D8';
  return bg('#D0D8C0') +
    // wings (transparent)
    el(72, 86, 32, 16, wing, '#90A890', 1.5, 'rotate(-10 72 86)') +
    el(128, 86, 32, 16, wing, '#90A890', 1.5, 'rotate(10 128 86)') +
    el(100, 118, 20, 28, dark) +                          // abdomen
    el(100, 92, 16, 16, dark) +                           // thorax
    ci(100, 68, 18, dark) +                              // head
    // COMPOUND EYES (key feature - very large, red)
    ci(85, 64, 12, '#CC2020', '#AA0000', 1.5) +
    ci(115, 64, 12, '#CC2020', '#AA0000', 1.5) +
    // facets on eyes
    pa('M78,60 Q85,55 92,60', 'none', '#880000', 0.5) +
    pa('M108,60 Q115,55 122,60', 'none', '#880000', 0.5) +
    // proboscis
    pa('M100,80 L100,90', 'none', dark, 2) +
    // 6 legs
    li(86, 92, 65, 80, dark, 1.5) + li(65, 80, 58, 90, dark, 1.5) +
    li(86, 95, 64, 94, dark, 1.5) + li(64, 94, 58, 106, dark, 1.5) +
    li(86, 100, 66, 108, dark, 1.5) + li(66, 108, 62, 120, dark, 1.5) +
    li(114, 92, 135, 80, dark, 1.5) + li(135, 80, 142, 90, dark, 1.5) +
    li(114, 95, 136, 94, dark, 1.5) + li(136, 94, 142, 106, dark, 1.5) +
    li(114, 100, 134, 108, dark, 1.5) + li(134, 108, 138, 120, dark, 1.5);
}

function draw_pavouk() {
  const black = '#2C2C2C'; const dark = '#484848';
  return bg('#C0C8D0') +
    // web in background
    li(100, 20, 100, 180, '#CCCCCC', 0.5) + li(20, 100, 180, 100, '#CCCCCC', 0.5) +
    li(42, 42, 158, 158, '#CCCCCC', 0.5) + li(158, 42, 42, 158, '#CCCCCC', 0.5) +
    pa('M100,40 Q130,55 130,100 Q115,130 100,130 Q85,130 70,100 Q70,55 100,40', '#CCCCCC', '#CCCCCC', 0.5) +
    pa('M100,65 Q118,74 118,100 Q111,116 100,116 Q89,116 82,100 Q82,74 100,65', '#CCCCCC', '#CCCCCC', 0.5) +
    // 8 legs (key feature)
    li(74, 100, 45, 75, dark, 2.5) + li(45, 75, 32, 55, dark, 2.5) + // L1
    li(72, 112, 44, 100, dark, 2.5) + li(44, 100, 30, 85, dark, 2.5) + // L2
    li(75, 124, 50, 120, dark, 2.5) + li(50, 120, 35, 115, dark, 2.5) + // L3
    li(82, 134, 62, 148, dark, 2.5) + li(62, 148, 50, 162, dark, 2.5) + // L4
    li(126, 100, 155, 75, dark, 2.5) + li(155, 75, 168, 55, dark, 2.5) + // R1
    li(128, 112, 156, 100, dark, 2.5) + li(156, 100, 170, 85, dark, 2.5) + // R2
    li(125, 124, 150, 120, dark, 2.5) + li(150, 120, 165, 115, dark, 2.5) + // R3
    li(118, 134, 138, 148, dark, 2.5) + li(138, 148, 150, 162, dark, 2.5) + // R4
    el(100, 132, 22, 30, black) +                         // abdomen
    ci(100, 96, 20, black) +                             // cephalothorax
    // multiple eyes (row of 4)
    ci(88, 90, 4, '#FFF') + ci(96, 88, 4, '#FFF') + ci(104, 88, 4, '#FFF') + ci(112, 90, 4, '#FFF') +
    ci(88, 90, 2.5, black, 'none', 0) + ci(96, 88, 2.5, black, 'none', 0) + ci(104, 88, 2.5, black, 'none', 0) + ci(112, 90, 2.5, black, 'none', 0);
}

function draw_snek() {
  const shell = '#A07840'; const dshell = '#6A4820'; const body = '#C0A060';
  return bg('#C8E8B0') +
    // shell spiral (key feature)
    ci(100, 98, 48, shell) +
    ci(100, 98, 36, dshell) +
    ci(100, 98, 24, shell) +
    ci(100, 98, 12, dshell) +
    // shell opening + body
    pa('M52,118 Q40,145 52,165 Q70,180 100,175 Q130,180 148,165 Q160,145 148,118', body, dshell, 1.5) +
    // head (eyestalks - key feature)
    ci(78, 118, 14, body, dshell, 1.5) +
    // eyestalks
    li(72, 106, 62, 90, dshell, 3) + ci(62, 88, 5, '#FFF') + ci(62.5, 88.5, 3, '#2C2C2C', 'none', 0) +
    li(82, 104, 78, 88, dshell, 3) + ci(78, 86, 5, '#FFF') + ci(78.5, 86.5, 3, '#2C2C2C', 'none', 0) +
    el(82, 122, 8, 5, '#D4B880', dshell, 1) +             // mouth area
    smile(82, 124, 5, 3);
}

function draw_jezek() {
  const fur = '#8B5E30'; const spine = '#4A3010'; const face = '#D4A870';
  return bg('#C0D890') +
    // spiny back (key feature) - drawn as many triangles
    pa('M52,130 Q60,108 72,90 Q82,74 94,66 Q100,62 106,66 Q118,74 128,90 Q140,108 148,130', spine, '#3A2008', 1.5) +
    // spines
    li(72, 90, 66, 72, spine, 2) + li(78, 82, 72, 64, spine, 2) + li(86, 74, 82, 56, spine, 2) +
    li(94, 68, 92, 50, spine, 2) + li(100, 65, 100, 46, spine, 2) + li(106, 68, 108, 50, spine, 2) +
    li(114, 74, 118, 56, spine, 2) + li(122, 82, 128, 64, spine, 2) + li(128, 90, 134, 72, spine, 2) +
    li(75, 95, 68, 78, spine, 1.5) + li(82, 78, 78, 62, spine, 1.5) + li(90, 70, 88, 54, spine, 1.5) +
    li(108, 70, 112, 54, spine, 1.5) + li(118, 78, 122, 62, spine, 1.5) + li(125, 95, 132, 78, spine, 1.5) +
    // round body
    el(100, 148, 50, 30, fur) +
    // belly
    el(100, 152, 36, 20, face, fur, 1) +
    // small pointed face
    el(64, 140, 24, 18, face, fur, 1.5) +
    el(56, 146, 12, 8, '#E8C8A0', fur, 1) +               // snout
    ci(56, 143, 3.5, '#2C1A08', 'none', 0) +              // nose
    ci(63, 133, 5, '#FFF') + ci(63.5, 133.5, 3, '#2C2C2C', 'none', 0) + ci(62, 132, 1, '#FFF', 'none', 0) + // eye
    // tiny feet
    li(76, 175, 72, 185, fur, 3) + li(88, 178, 86, 188, fur, 3) + li(112, 178, 114, 188, fur, 3) + li(124, 175, 128, 185, fur, 3);
}

function draw_bobr() {
  const brown = '#7A4820'; const dbrown = '#4A2C10';
  return bg('#88B8D0') +
    // flat paddle tail (key feature)
    el(100, 178, 40, 15, dbrown) +
    // cross-hatch on tail
    li(70, 178, 130, 178, brown, 1) + li(70, 170, 130, 170, brown, 1) + li(70, 186, 130, 186, brown, 1) +
    li(80, 164, 80, 192, brown, 1) + li(90, 164, 90, 192, brown, 1) + li(100, 163, 100, 192, brown, 1) +
    li(110, 164, 110, 192, brown, 1) + li(120, 164, 120, 192, brown, 1) +
    el(100, 150, 48, 32, brown) +                         // body
    el(100, 150, 32, 20, '#A06840', 'none', 0) +          // belly
    ci(100, 86, 30, brown) +                             // head
    el(76, 88, 11, 8, brown, dbrown, 1) +                 // left ear
    el(124, 88, 11, 8, brown, dbrown, 1) +                // right ear
    el(100, 97, 16, 11, '#C0905C', brown, 1) +            // muzzle
    // buck teeth (key feature)
    re(94, 102, 6, 8, 1, '#F4F0DC', dbrown, 1.5) +
    re(100, 102, 6, 8, 1, '#F4F0DC', dbrown, 1.5) +
    ci(100, 93, 5, dbrown, 'none', 0) +                  // nose
    eyes(84, 78, 116, 78, 7) +
    smile(100, 104, 5, 3);
}

function draw_vydra() {
  const brown = '#6A4020'; const light = '#C09060'; const dark = '#3C2010';
  return bg('#70A8C8') +
    // streamlined horizontal body (key)
    el(100, 120, 62, 28, brown) +
    el(95, 125, 42, 18, light, 'none', 0) +              // belly
    // tail
    pa('M158,112 Q185,105 185,130 Q165,130 158,128', brown, dark, 1.5) +
    // webbed feet
    el(74, 140, 14, 9, brown, dark, 1) +
    el(126, 140, 14, 9, brown, dark, 1) +
    // head
    ci(52, 110, 24, brown) +
    el(52, 110, 18, 16, brown, dark, 1) +
    el(42, 116, 12, 8, light, brown, 1) +                 // muzzle
    ci(41, 113, 4, dark, 'none', 0) +                    // nose
    // whiskers (key)
    li(36, 115, 22, 112, light, 1.5) + li(36, 117, 22, 118, light, 1.5) + li(36, 119, 22, 124, light, 1.5) +
    li(50, 115, 36, 112, light, 1) + li(50, 117, 36, 118, light, 1) +
    ci(52, 103, 7, '#FFF') + ci(52.5, 103.5, 4.5, dark, 'none', 0) + ci(51, 102, 1.5, '#FFF', 'none', 0) + // eye
    smile(52, 120, 6, 3);
}

// ---------------------------------------------------------------------------
// Animal metadata
// ---------------------------------------------------------------------------
const ANIMALS = [
  { id: 'pes',      name: 'Pes',      category: 'savec',        biome: 'domov',   readingLevel: 1, wordDifficulty: 1, sentence: 'Pes štěká.',         fact: 'Pes je nejlepší přítel člověka.', tags: ['domaci', 'srst', 'steka'] },
  { id: 'kocka',    name: 'Kočka',    category: 'savec',        biome: 'domov',   readingLevel: 2, wordDifficulty: 3, sentence: 'Kočka mňouká.',      fact: 'Kočka má ostré drápy a vousky.', tags: ['domaci', 'vousky', 'domy'] },
  { id: 'lev',      name: 'Lev',      category: 'savec',        biome: 'savana',  readingLevel: 1, wordDifficulty: 1, sentence: 'Lev řve.',           fact: 'Lev je největší africká kočkovitá šelma.', tags: ['kral', 'hriva', 'afrika'] },
  { id: 'sova',     name: 'Sova',     category: 'ptak',         biome: 'les',     readingLevel: 1, wordDifficulty: 2, sentence: 'Sova houkne.',       fact: 'Sova vidí dokonale i ve tmě.', tags: ['nocni', 'velke-oci', 'les'] },
  { id: 'liska',    name: 'Liška',    category: 'savec',        biome: 'les',     readingLevel: 2, wordDifficulty: 3, sentence: 'Liška běží.',        fact: 'Liška má hustou rezavou srst.', tags: ['ruda', 'ocas', 'les'] },
  { id: 'zebra',    name: 'Zebra',    category: 'savec',        biome: 'savana',  readingLevel: 2, wordDifficulty: 3, sentence: 'Zebra má pruhy.',    fact: 'Každá zebra má jedinečný vzor pruhů.', tags: ['pruhy', 'afrika', 'savana'] },
  { id: 'kos',      name: 'Kos',      category: 'ptak',         biome: 'les',     readingLevel: 1, wordDifficulty: 1, sentence: 'Kos zpívá.',         fact: 'Kos má žlutý zobák a hezky zpívá.', tags: ['cerny', 'zobak', 'zpev'] },
  { id: 'krava',    name: 'Kráva',    category: 'savec',        biome: 'statek',  readingLevel: 2, wordDifficulty: 3, sentence: 'Kráva bučí.',        fact: 'Kráva nám dává mléko a smetanu.', tags: ['mleko', 'statek', 'rohy'] },
  { id: 'kun',      name: 'Kůň',      category: 'savec',        biome: 'statek',  readingLevel: 1, wordDifficulty: 2, sentence: 'Kůň klusá.',         fact: 'Kůň je velmi rychlý a silný.', tags: ['hriva', 'rychly', 'statek'] },
  { id: 'zaba',     name: 'Žába',     category: 'obojzivelnik', biome: 'rybnik',  readingLevel: 1, wordDifficulty: 2, sentence: 'Žába skáče.',        fact: 'Žába umí skákat i plavat.', tags: ['zelena', 'skace', 'rybnik'] },
  { id: 'slon',     name: 'Slon',     category: 'savec',        biome: 'savana',  readingLevel: 1, wordDifficulty: 2, sentence: 'Slon troubí.',       fact: 'Slon má nejdelší nos ze všech zvířat.', tags: ['chobot', 'velky', 'afrika'] },
  { id: 'medved',   name: 'Medvěd',   category: 'savec',        biome: 'les',     readingLevel: 2, wordDifficulty: 4, sentence: 'Medvěd spí.',        fact: 'Medvěd v zimě hibernuje v brlohů.', tags: ['velky', 'hnedy', 'les'] },
  { id: 'had',      name: 'Had',      category: 'plaz',         biome: 'les',     readingLevel: 1, wordDifficulty: 1, sentence: 'Had se plazí.',      fact: 'Had nemá nohy a pohybuje se vlněním.', tags: ['plaz', 'jazyk', 'bez-noh'] },
  { id: 'cap',      name: 'Kozel',    category: 'savec',        biome: 'statek',  readingLevel: 1, wordDifficulty: 2, sentence: 'Kozel mečí.',        fact: 'Kozel má rohy a hustou bradku.', tags: ['kozel', 'rohy', 'bradka'] },
  { id: 'orel',     name: 'Orel',     category: 'ptak',         biome: 'hory',    readingLevel: 1, wordDifficulty: 2, sentence: 'Orel letí.',         fact: 'Orel vidí svou kořist z velké výšky.', tags: ['kridla', 'hory', 'zobak'] },
  { id: 'vlk',      name: 'Vlk',      category: 'savec',        biome: 'les',     readingLevel: 1, wordDifficulty: 1, sentence: 'Vlk vyje.',          fact: 'Vlk žije v tlupě zvané smečka.', tags: ['smedka', 'les', 'sedy'] },
  { id: 'rys',      name: 'Rys',      category: 'savec',        biome: 'les',     readingLevel: 1, wordDifficulty: 1, sentence: 'Rys se plíží.',      fact: 'Rys má charakteristické chocholy na uších.', tags: ['chocholy', 'skvrnity', 'les'] },
  { id: 'jelen',    name: 'Jelen',    category: 'savec',        biome: 'les',     readingLevel: 2, wordDifficulty: 3, sentence: 'Jelen běží.',        fact: 'Jelen nosí velkolepé parohy.', tags: ['parohy', 'les', 'hnedy'] },
  { id: 'srna',     name: 'Srna',     category: 'savec',        biome: 'les',     readingLevel: 1, wordDifficulty: 2, sentence: 'Srna skáče.',        fact: 'Srna je samice jelena, bez parohů.', tags: ['skvrny', 'les', 'fena'] },
  { id: 'prase',    name: 'Prase',    category: 'savec',        biome: 'statek',  readingLevel: 2, wordDifficulty: 3, sentence: 'Prase chrochtá.',    fact: 'Prase se rád válí v bahně.', tags: ['ruzove', 'statek', 'rypak'] },
  { id: 'ovce',     name: 'Ovce',     category: 'savec',        biome: 'louka',   readingLevel: 2, wordDifficulty: 3, sentence: 'Ovce bečí.',         fact: 'Z vlny ovce se vyrábí teplé oblečení.', tags: ['vlna', 'bila', 'louka'] },
  { id: 'koza',     name: 'Koza',     category: 'savec',        biome: 'statek',  readingLevel: 2, wordDifficulty: 2, sentence: 'Koza mečí.',         fact: 'Koza dává mléko a umí lézt do kopce.', tags: ['rohy', 'mleko', 'statek'] },
  { id: 'kohout',   name: 'Kohout',   category: 'ptak',         biome: 'statek',  readingLevel: 2, wordDifficulty: 4, sentence: 'Kohout kokrhá.',     fact: 'Kohout svým kokrháním oznamuje ráno.', tags: ['hrebenek', 'pero', 'rano'] },
  { id: 'slepice',  name: 'Slepice',  category: 'ptak',         biome: 'statek',  readingLevel: 2, wordDifficulty: 4, sentence: 'Slepice kdáká.',     fact: 'Slepice snáší vajíčka.', tags: ['vejce', 'statek', 'kur'] },
  { id: 'kachna',   name: 'Kachna',   category: 'ptak',         biome: 'rybnik',  readingLevel: 2, wordDifficulty: 4, sentence: 'Kachna kváká.',      fact: 'Kachna má nepromokavé peří.', tags: ['zobak', 'rybnik', 'zelena-hlava'] },
  { id: 'husa',     name: 'Husa',     category: 'ptak',         biome: 'statek',  readingLevel: 2, wordDifficulty: 2, sentence: 'Husa syčí.',         fact: 'Husa je větší než kachna a hlasitě syčí.', tags: ['bila', 'krik', 'dlahy'] },
  { id: 'kralik',   name: 'Králík',   category: 'savec',        biome: 'louka',   readingLevel: 2, wordDifficulty: 4, sentence: 'Králík skáče.',      fact: 'Králík má dlouhé uši a rád žere mrkev.', tags: ['usi', 'bila', 'mrkev'] },
  { id: 'mys',      name: 'Myš',      category: 'savec',        biome: 'domov',   readingLevel: 1, wordDifficulty: 1, sentence: 'Myš pípá.',          fact: 'Myš je malá a velmi rychlá.', tags: ['mala', 'ocas', 'seda'] },
  { id: 'krysa',    name: 'Krysa',    category: 'savec',        biome: 'domov',   readingLevel: 2, wordDifficulty: 3, sentence: 'Krysa leze.',        fact: 'Krysa je chytrá a dobře se přizpůsobuje.', tags: ['seda', 'ocas', 'chytra'] },
  { id: 'tygr',     name: 'Tygr',     category: 'savec',        biome: 'les',     readingLevel: 1, wordDifficulty: 2, sentence: 'Tygr řve.',          fact: 'Tygr má pruhovanou srst a je velmi rychlý.', tags: ['pruhy', 'oranzovy', 'asie'] },
  { id: 'opice',    name: 'Opice',    category: 'savec',        biome: 'les',     readingLevel: 2, wordDifficulty: 3, sentence: 'Opice skáče.',       fact: 'Opice umí používat nástroje.', tags: ['stromy', 'ocas', 'chytra'] },
  { id: 'zirafa',   name: 'Žirafa',   category: 'savec',        biome: 'savana',  readingLevel: 2, wordDifficulty: 4, sentence: 'Žirafa žere listí.', fact: 'Žirafa je nejvyšší zvíře na světě.', tags: ['krk', 'skvrny', 'vysoky'] },
  { id: 'velbloud', name: 'Velbloud', category: 'savec',        biome: 'poust',   readingLevel: 3, wordDifficulty: 5, sentence: 'Velbloud kráčí.',    fact: 'Velbloud vydrží dlouho bez vody.', tags: ['hrb', 'poust', 'voda'] },
  { id: 'tucnak',   name: 'Tučňák',   category: 'ptak',         biome: 'ocean',   readingLevel: 2, wordDifficulty: 4, sentence: 'Tučňák plave.',      fact: 'Tučňák neumí létat, ale skvěle plave.', tags: ['led', 'smoki', 'plava'] },
  { id: 'tulen',    name: 'Tuleň',    category: 'savec',        biome: 'ocean',   readingLevel: 2, wordDifficulty: 3, sentence: 'Tuleň plave.',       fact: 'Tuleň je výborný plavec a potápěč.', tags: ['ploutve', 'vousky', 'more'] },
  { id: 'delfin',   name: 'Delfín',   category: 'savec',        biome: 'ocean',   readingLevel: 2, wordDifficulty: 4, sentence: 'Delfín skáče.',      fact: 'Delfín je velmi inteligentní mořský savec.', tags: ['more', 'pluta', 'chytry'] },
  { id: 'velryba',  name: 'Velryba',  category: 'savec',        biome: 'ocean',   readingLevel: 3, wordDifficulty: 5, sentence: 'Velryba plave.',     fact: 'Velryba je největší zvíře na Zemi.', tags: ['velka', 'more', 'vodotrysk'] },
  { id: 'zelva',    name: 'Želva',    category: 'plaz',         biome: 'rybnik',  readingLevel: 2, wordDifficulty: 3, sentence: 'Želva leze.',        fact: 'Želva může žít přes sto let.', tags: ['ulita', 'pomala', 'stara'] },
  { id: 'ryba',     name: 'Ryba',     category: 'ryba',         biome: 'reka',    readingLevel: 1, wordDifficulty: 2, sentence: 'Ryba plave.',        fact: 'Ryba dýchá žábrami pod vodou.', tags: ['pluta', 'skrupule', 'voda'] },
  { id: 'kapr',     name: 'Kapr',     category: 'ryba',         biome: 'rybnik',  readingLevel: 1, wordDifficulty: 2, sentence: 'Kapr plave.',        fact: 'Kapr žije v řekách a rybnících.', tags: ['zlaty', 'rybnik', 'vousky'] },
  { id: 'cmelak',   name: 'Čmelák',   category: 'hmyz',         biome: 'louka',   readingLevel: 2, wordDifficulty: 4, sentence: 'Čmelák bzučí.',      fact: 'Čmelák opyluje květiny a vyrábí med.', tags: ['kridla', 'med', 'louka'] },
  { id: 'vcela',    name: 'Včela',    category: 'hmyz',         biome: 'louka',   readingLevel: 2, wordDifficulty: 3, sentence: 'Včela sbírá med.',   fact: 'Včely žijí v úlech a vyrábějí med.', tags: ['med', 'ul', 'kridla'] },
  { id: 'mravenec', name: 'Mravenec', category: 'hmyz',         biome: 'les',     readingLevel: 3, wordDifficulty: 5, sentence: 'Mravenec nese zrno.', fact: 'Mravenec je jeden z nejsilnějších živočichů.', tags: ['silny', 'tykadla', 'clanek'] },
  { id: 'motyl',    name: 'Motýl',    category: 'hmyz',         biome: 'louka',   readingLevel: 2, wordDifficulty: 3, sentence: 'Motýl letí.',        fact: 'Motýl vychází z kukly.', tags: ['kridla', 'pestry', 'louka'] },
  { id: 'moucha',   name: 'Moucha',   category: 'hmyz',         biome: 'domov',   readingLevel: 2, wordDifficulty: 4, sentence: 'Moucha bzučí.',      fact: 'Moucha mává křídly 200krát za sekundu.', tags: ['kridla', 'oci', 'rychla'] },
  { id: 'pavouk',   name: 'Pavouk',   category: 'pavoukovec',   biome: 'domov',   readingLevel: 2, wordDifficulty: 4, sentence: 'Pavouk tká síť.',    fact: 'Pavouk tká pavučinu, která je velmi pevná.', tags: ['8-noh', 'pavucina', 'temny'] },
  { id: 'snek',     name: 'Šnek',     category: 'mekkys',       biome: 'louka',   readingLevel: 1, wordDifficulty: 2, sentence: 'Šnek leze.',         fact: 'Šnek nosí svůj dům na zádech.', tags: ['ulita', 'pomaly', 'sliz'] },
  { id: 'jezek',    name: 'Ježek',    category: 'savec',        biome: 'les',     readingLevel: 2, wordDifficulty: 3, sentence: 'Ježek se krčí.',     fact: 'Ježek se brání tím, že se stočí do klubíčka.', tags: ['trny', 'les', 'nocni'] },
  { id: 'bobr',     name: 'Bobr',     category: 'savec',        biome: 'reka',    readingLevel: 1, wordDifficulty: 2, sentence: 'Bobr staví hráz.',   fact: 'Bobr staví hráze z větví a bláta.', tags: ['hraz', 'ocas', 'zuby'] },
  { id: 'vydra',    name: 'Vydra',    category: 'savec',        biome: 'reka',    readingLevel: 2, wordDifficulty: 3, sentence: 'Vydra loví.',        fact: 'Vydra je výborný plavec a loví ryby.', tags: ['voda', 'ryby', 'vousky'] },
];

// ---------------------------------------------------------------------------
// SVG dispatch
// ---------------------------------------------------------------------------
const DRAW_FN = {
  pes: draw_pes, kocka: draw_kocka, lev: draw_lev, sova: draw_sova, liska: draw_liska,
  zebra: draw_zebra, kos: draw_kos, krava: draw_krava, kun: draw_kun, zaba: draw_zaba,
  slon: draw_slon, medved: draw_medved, had: draw_had, cap: draw_cap, orel: draw_orel,
  vlk: draw_vlk, rys: draw_rys, jelen: draw_jelen, srna: draw_srna, prase: draw_prase,
  ovce: draw_ovce, koza: draw_koza, kohout: draw_kohout, slepice: draw_slepice, kachna: draw_kachna,
  husa: draw_husa, kralik: draw_kralik, mys: draw_mys, krysa: draw_krysa, tygr: draw_tygr,
  opice: draw_opice, zirafa: draw_zirafa, velbloud: draw_velbloud, tucnak: draw_tucnak, tulen: draw_tulen,
  delfin: draw_delfin, velryba: draw_velryba, zelva: draw_zelva, ryba: draw_ryba, kapr: draw_kapr,
  cmelak: draw_cmelak, vcela: draw_vcela, mravenec: draw_mravenec, motyl: draw_motyl, moucha: draw_moucha,
  pavouk: draw_pavouk, snek: draw_snek, jezek: draw_jezek, bobr: draw_bobr, vydra: draw_vydra,
};

// ---------------------------------------------------------------------------
// JSON schema
// ---------------------------------------------------------------------------
const SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'reading-zoo.animals.seed.v1',
  title: 'Čtecí ZOO – Animals seed schema',
  type: 'object',
  required: ['schema', 'version', 'language', 'count', 'animals'],
  properties: {
    schema: { type: 'string' },
    version: { type: 'string' },
    language: { type: 'string' },
    count: { type: 'integer', minimum: 1 },
    licenseNote: { type: 'string' },
    animals: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'category', 'biome', 'readingLevel', 'wordDifficulty', 'sentence', 'fact', 'imagePath', 'tags'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string', enum: ['savec', 'ptak', 'plaz', 'obojzivelnik', 'ryba', 'hmyz', 'pavoukovec', 'mekkys'] },
          biome: { type: 'string', enum: ['domov', 'statek', 'les', 'louka', 'savana', 'poust', 'reka', 'rybnik', 'ocean', 'hory', 'zoo'] },
          readingLevel: { type: 'integer', enum: [1, 2, 3] },
          wordDifficulty: { type: 'integer', minimum: 1, maximum: 5 },
          sentence: { type: 'string' },
          fact: { type: 'string' },
          imagePath: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------
const SVG_DIR = join(ROOT, 'assets', 'animals-illustrated');
const DATA_DIR = join(ROOT, 'data', 'content');

ensureDir(SVG_DIR);
ensureDir(DATA_DIR);

let svgCount = 0;
for (const animal of ANIMALS) {
  const drawFn = DRAW_FN[animal.id];
  if (!drawFn) { console.error(`MISSING draw function for: ${animal.id}`); continue; }
  const content = svg(drawFn());
  writeFileSync(join(SVG_DIR, `${animal.id}.svg`), content, 'utf8');
  svgCount++;
}
console.log(`✅ SVG: ${svgCount} soubory zapsány do assets/animals-illustrated/`);

// JSON manifest
const animalsWithPath = ANIMALS.map(a => ({ ...a, imagePath: `assets/animals-illustrated/${a.id}.svg` }));
const manifest = {
  schema: 'reading-zoo.animals.seed.v1',
  version: '1.0.0',
  language: 'cs-CZ',
  count: ANIMALS.length,
  licenseNote: 'Illustrations are original prototype SVG assets created for this project.',
  animals: animalsWithPath,
};
writeFileSync(join(DATA_DIR, 'animals_50_seed.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`✅ JSON manifest: data/content/animals_50_seed.json (${ANIMALS.length} zvířat)`);

// CSV manifest
const csvHeader = 'id,name,category,biome,readingLevel,wordDifficulty,sentence,fact,imagePath,tags';
const csvRows = animalsWithPath.map(a =>
  [a.id, a.name, a.category, a.biome, a.readingLevel, a.wordDifficulty,
    `"${a.sentence}"`, `"${a.fact}"`, a.imagePath, `"${a.tags.join(';')}"`].join(',')
);
writeFileSync(join(DATA_DIR, 'animals_50_seed.csv'), [csvHeader, ...csvRows].join('\n'), 'utf8');
console.log(`✅ CSV manifest: data/content/animals_50_seed.csv`);

// JSON schema
writeFileSync(join(DATA_DIR, 'animals_50.schema.json'), JSON.stringify(SCHEMA, null, 2), 'utf8');
console.log(`✅ JSON schema: data/content/animals_50.schema.json`);

console.log('\n🦁 Generování dokončeno!');
