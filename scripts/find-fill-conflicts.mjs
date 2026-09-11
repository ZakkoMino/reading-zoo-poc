// Read-only inventory of potentially ambiguous one-letter masks.
// Not a Czech dictionary: reports conflicts present in the shipped vocabulary.
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../data/content/curriculum_v2.json', import.meta.url), 'utf8'));
const words = [...new Set(data.levels.filter((l) => l.kind === 'word').flatMap((l) => l.items.map((i) => i.text.toLowerCase())))];
const vocabulary = new Set(words);
const alphabet = [...'aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž'];
const conflicts = [];
for (const word of words.filter((w) => w.length > 2)) {
  const vowelIndices = [...word].map((ch, i) => 'aáeéěiíoóuúůyý'.includes(ch) ? i : -1).filter((i) => i >= 0);
  const indices = vowelIndices.length ? vowelIndices : [...word].map((_, i) => i);
  for (const i of indices) for (const letter of alphabet.filter((ch) => !word.includes(ch))) {
    const alternative = word.slice(0, i) + letter + word.slice(i + 1);
    if (vocabulary.has(alternative)) conflicts.push({ target: word, mask: word.slice(0, i) + '_' + word.slice(i + 1), alternative });
  }
}
console.log(JSON.stringify({ scope: 'Shipped word vocabulary; eligible missing-letter distractors, not all Czech words', count: conflicts.length, conflicts }, null, 2));
