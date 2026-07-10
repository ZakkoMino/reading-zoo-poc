/* Reading Zoo — content data
 *
 * Two sources of content exist:
 *   1. An inline minimal dataset (12 animals + 4 small levels). This keeps
 *      the app usable when opened via file:// or when the seed JSON cannot
 *      be fetched for any reason.
 *   2. The curriculum/seed JSONs in data/content/ (curriculum_v2, animals,
 *      stories). When the app runs on a local HTTP server, these are
 *      fetched at boot and replace the inline dataset in place.
 *
 * Why in-place mutation: lessons.js, tasks.js and views.js destructure
 * `App.data.ANIMALS`/`LEVELS` at script-load time. Reassigning the property
 * would orphan those bindings. Mutating the same array (`.length = 0` then
 * push) keeps every consumer pointing at the live data.
 *
 * Level model (curriculum v2): 8 levels in a fixed unlock order, each with
 * a `kind` that drives which task types apply:
 *   letter | syllable | word | sentence | story
 */
(function () {
  const App = window.App || (window.App = {});

  /* Fixed progression order — also used by state.js for locking. */
  const LEVEL_ORDER = [
    'letters', 'syllables', 'words1', 'words2',
    'words3', 'sentences1', 'sentences2', 'stories'
  ];

  /* ---------- inline fallback ---------- */
  const INLINE_ANIMALS = [
    { id: 'pes',     name: 'Pes',     fact: 'Pes je věrný kamarád a hlasitě štěká.' },
    { id: 'kocka',   name: 'Kočka',   fact: 'Kočka má jemnou srst a ráda přede.' },
    { id: 'lev',     name: 'Lev',     fact: 'Lev je král zvířat a má hustou hřívu.' },
    { id: 'sova',    name: 'Sova',    fact: 'Sova je moudrá a vidí v noci.' },
    { id: 'liska',   name: 'Liška',   fact: 'Liška má rezavou srst a je velmi chytrá.' },
    { id: 'zebra',   name: 'Zebra',   fact: 'Zebra má krásné černobílé pruhy.' },
    { id: 'kos',     name: 'Kos',     fact: 'Kos je černý pták, který krásně zpívá.' },
    { id: 'krava',   name: 'Kráva',   fact: 'Kráva nám dává mléko a říká „bú“.' },
    { id: 'kun',     name: 'Kůň',     fact: 'Kůň umí běhat velmi rychle.' },
    { id: 'zaba',    name: 'Žába',    fact: 'Žába skáče a ráda sedí u vody.' },
    { id: 'slon',    name: 'Slon',    fact: 'Slon je největší zvíře na souši.' },
    { id: 'medved',  name: 'Medvěd',  fact: 'Medvěd má rád med a v zimě spí.' }
  ];

  const INLINE_LEVELS = [
    {
      id: 'letters', label: 'Lovec písmen', badge: '🔤', kind: 'letter',
      hint: 'Písmena – poznávej, čti a obtahuj.',
      items: ['A', 'M', 'L', 'S', 'P', 'K', 'Z'].map((t) => {
        const map = { M: ['mys', 'medved'], L: ['lev', 'liska'], S: ['sova', 'slon'], P: ['pes'], K: ['kocka', 'kun'], Z: ['zebra', 'zaba'] };
        const item = { text: t };
        if (map[t]) item.animalIds = map[t];
        return item;
      })
    },
    {
      id: 'syllables', label: 'Slabikové mládě', badge: '🧩', kind: 'syllable',
      hint: 'Krátké slabiky pro první čtení.',
      items: ['ma', 'pa', 'ta', 'sa', 'la', 'mo', 'po', 'to', 'so', 'lo', 'mi', 'pi', 'ti'].map((t) => ({ text: t }))
    },
    {
      id: 'words1', label: 'První slova', badge: '🐾', kind: 'word',
      hint: 'Krátká slova bez záludností.',
      items: [
        { text: 'pes',  animalId: 'pes'  },
        { text: 'kos',  animalId: 'kos'  },
        { text: 'lev',  animalId: 'lev'  },
        { text: 'kůň',  animalId: 'kun'  },
        { text: 'sova', animalId: 'sova' },
        { text: 'žába', animalId: 'zaba' },
        { text: 'oko' }, { text: 'ucho' }, { text: 'ruka' }, { text: 'les' }
      ]
    },
    {
      id: 'sentences1', label: 'Krátké věty', badge: '✏️', kind: 'sentence',
      hint: 'Věty o dvou a třech slovech.',
      items: [
        { text: 'Pes štěká.',  animalId: 'pes'    },
        { text: 'Kočka spí.',  animalId: 'kocka'  },
        { text: 'Liška běží.', animalId: 'liska'  },
        { text: 'Sova houká.', animalId: 'sova'   },
        { text: 'Lev řve.',    animalId: 'lev'    },
        { text: 'Kráva bučí.', animalId: 'krava'  },
        { text: 'Žába skáče.', animalId: 'zaba'   }
      ]
    }
  ];

  /* Live arrays — populated with inline data so the app works before fetch
   * resolves (and as a permanent fallback when fetch fails). */
  const ANIMALS = INLINE_ANIMALS.slice();
  const LEVELS = INLINE_LEVELS.map((l) => ({ ...l, items: l.items.slice() }));
  const STORIES = [];
  /* One fixed lesson length, no picker. Decision 2026-07-05: kids offered
   * a shorter option always took it (less reading for the same reward),
   * and a full lesson still runs only a minute or two. 8 matches the
   * Velká výzva, so the challenge feels like a normal lesson. */
  const LESSON_LENGTH = 8;

  /* Themes apply only to sentence levels — they filter the lesson pool by
   * the item's `category` field (preserved from the thematic seed
   * sentences). Mix means no filter. */
  const SENTENCE_THEMES = [
    { id: 'mix',        label: 'Mix',          icon: '🎲', categories: null },
    { id: 'pets',       label: 'Mazlíčci',     icon: '🐶', categories: ['Věty o mazlíčcích'] },
    { id: 'food',       label: 'Jídlo',        icon: '🍎', categories: ['Věty o jídle'] },
    { id: 'movement',   label: 'Pohyb',        icon: '🏃', categories: ['Věty o pohybu'] },
    { id: 'fairytales', label: 'Pohádky',      icon: '📚', categories: ['Věty o pohádkách'] },
    { id: 'nature',     label: 'Příroda',      icon: '🌳', categories: ['Věty o přírodě'] },
    { id: 'family',     label: 'Rodina',       icon: '👨‍👩‍👧', categories: ['Věty o rodině'] },
    { id: 'school',     label: 'Škola',        icon: '🏫', categories: ['Věty o škole'] },
    { id: 'seasons',    label: 'Roční období', icon: '🍂', categories: ['Věty o ročních obdobích'] }
  ];

  function getTheme(id) {
    return SENTENCE_THEMES.find((t) => t.id === id) || SENTENCE_THEMES[0];
  }

  function levelHasThemes(level) {
    if (!level || !level.items) return false;
    const known = new Set();
    for (const t of SENTENCE_THEMES) {
      if (!t.categories) continue;
      for (const c of t.categories) known.add(c);
    }
    return level.items.some((it) => it.category && known.has(it.category));
  }

  function availableThemes(level) {
    if (!levelHasThemes(level)) return [];
    const present = new Set();
    level.items.forEach((it) => { if (it.category) present.add(it.category); });
    return SENTENCE_THEMES.filter((t) =>
      !t.categories || t.categories.some((c) => present.has(c))
    );
  }

  let dataSource = 'inline';

  /* ---------- helpers ---------- */
  function animalImg(id) {
    const a = ANIMALS.find((x) => x.id === id);
    if (a && a.imagePath) return a.imagePath;
    return `assets/animals/${id}.svg`;
  }
  function getLevel(id) { return LEVELS.find((l) => l.id === id) || LEVELS[0]; }
  function getAnimal(id) { return ANIMALS.find((a) => a.id === id) || null; }
  function getStory(id) { return STORIES.find((s) => s.id === id) || null; }
  function levelIndex(id) { return LEVEL_ORDER.indexOf(id); }
  function nextLevelId(id) {
    // Walk the order but only return levels that exist in the loaded data
    // (the inline fallback ships a subset of the full curriculum).
    const i = levelIndex(id);
    if (i === -1) return null;
    for (let j = i + 1; j < LEVEL_ORDER.length; j++) {
      const candidate = LEVEL_ORDER[j];
      if (LEVELS.some((l) => l.id === candidate)) return candidate;
    }
    return null;
  }
  function itemKey(item) { return item.text; }

  function countWords() {
    return LEVELS.reduce((acc, l) => acc + l.items.length, 0);
  }
  function getStats() {
    return {
      source: dataSource,
      animals: ANIMALS.length,
      words: countWords(),
      levels: LEVELS.length,
      stories: STORIES.length
    };
  }

  /* ---------- async loader ---------- */
  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  function replaceInPlace(target, next) {
    target.length = 0;
    for (const x of next) target.push(x);
  }

  async function loadFromSeed() {
    if (typeof fetch !== 'function') {
      console.info('[ReadingZOO] fetch unavailable, using inline data', getStats());
      return getStats();
    }
    try {
      const [curriculum, animalsDoc, storiesDoc] = await Promise.all([
        fetchJSON('data/content/curriculum_v2.json'),
        fetchJSON('data/content/animals_50_seed.json'),
        fetchJSON('data/content/stories.json')
      ]);
      const animals = (animalsDoc.animals || []).map((a) => ({
        id: a.id, name: a.name, fact: a.fact, imagePath: a.imagePath
      }));
      const levels = curriculum.levels || [];
      if (!animals.length || !levels.length) {
        throw new Error('seed produced empty dataset');
      }
      replaceInPlace(ANIMALS, animals);
      replaceInPlace(LEVELS, levels);
      replaceInPlace(STORIES, storiesDoc.stories || []);
      dataSource = 'seed';
      const stats = getStats();
      console.info('[ReadingZOO] data loaded from seed', stats);
      return stats;
    } catch (err) {
      console.warn('[ReadingZOO] seed load failed, using inline fallback', err);
      return getStats();
    }
  }

  App.data = {
    ANIMALS,
    LEVELS,
    STORIES,
    LEVEL_ORDER,
    LESSON_LENGTH,
    SENTENCE_THEMES,
    animalImg,
    getLevel,
    getAnimal,
    getStory,
    getTheme,
    levelIndex,
    nextLevelId,
    levelHasThemes,
    availableThemes,
    itemKey,
    getStats,
    ready: loadFromSeed()
  };
})();
