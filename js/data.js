/* Reading Zoo — content data
 *
 * Two sources of content exist:
 *   1. An inline minimal dataset (12 animals + 4 small levels). This keeps
 *      the app usable when opened via file:// or when the seed JSON cannot
 *      be fetched for any reason.
 *   2. The seed JSON in data/content/{vocabulary_200_seed,animals_50_seed}.json.
 *      When the app runs on a local HTTP server, these are fetched at boot
 *      and replace the inline dataset (in place — see note below).
 *
 * Why in-place mutation: lessons.js, tasks.js and views.js destructure
 * `App.data.ANIMALS`/`LEVELS` at script-load time. Reassigning the property
 * would orphan those bindings. Mutating the same array (`.length = 0` then
 * push) keeps every consumer pointing at the live data.
 */
(function () {
  const App = window.App || (window.App = {});

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

  const INLINE_SYLLABLES = [
    'ma','pa','ta','sa','la',
    'mo','po','to','so','lo',
    'mi','pi','ti'
  ].map((t) => ({ text: t }));

  const INLINE_LEVELS = [
    {
      id: 'syllables', label: 'Písmena a slabiky',
      hint: 'Krátké slabiky pro úplný začátek.',
      items: INLINE_SYLLABLES
    },
    {
      id: 'short', label: 'Krátká slova',
      hint: 'Krátká slova, většinou tři až čtyři písmena.',
      items: [
        { text: 'pes',  animalId: 'pes'  },
        { text: 'kos',  animalId: 'kos'  },
        { text: 'lev',  animalId: 'lev'  },
        { text: 'kůň',  animalId: 'kun'  },
        { text: 'slon', animalId: 'slon' },
        { text: 'sova', animalId: 'sova' },
        { text: 'žába', animalId: 'zaba' },
        { text: 'oko' }, { text: 'ucho' }, { text: 'ruka' }
      ]
    },
    {
      id: 'longer', label: 'Delší slova',
      hint: 'Delší slova, pět a více písmen.',
      items: [
        { text: 'kočka',  animalId: 'kocka'  },
        { text: 'liška',  animalId: 'liska'  },
        { text: 'zebra',  animalId: 'zebra'  },
        { text: 'kráva',  animalId: 'krava'  },
        { text: 'medvěd', animalId: 'medved' },
        { text: 'motýl' }, { text: 'slunce' },
        { text: 'kytka' }, { text: 'voda' }, { text: 'domek' }
      ]
    },
    {
      id: 'sentences', label: 'Krátké věty',
      hint: 'Krátké jednoduché věty se zvířátky.',
      items: [
        { text: 'Pes štěká.',  animalId: 'pes'    },
        { text: 'Kočka spí.',  animalId: 'kocka'  },
        { text: 'Liška běží.', animalId: 'liska'  },
        { text: 'Sova houká.', animalId: 'sova'   },
        { text: 'Lev řve.',    animalId: 'lev'    },
        { text: 'Kráva bučí.', animalId: 'krava'  },
        { text: 'Žába skáče.', animalId: 'zaba'   },
        { text: 'Kůň cválá.',  animalId: 'kun'    }
      ]
    }
  ];

  /* Live arrays — populated with inline data so the app works before fetch
   * resolves (and as a permanent fallback when fetch fails). */
  const ANIMALS = INLINE_ANIMALS.slice();
  const LEVELS = INLINE_LEVELS.map((l) => ({ ...l, items: l.items.slice() }));
  const LESSON_LENGTHS = [
    { id: 'short',  label: 'Krátká',  tasks: 5  },
    { id: 'medium', label: 'Střední', tasks: 8  },
    { id: 'long',   label: 'Delší',   tasks: 10 }
  ];

  let dataSource = 'inline';

  /* ---------- helpers ---------- */
  function animalImg(id) {
    const a = ANIMALS.find((x) => x.id === id);
    if (a && a.imagePath) return a.imagePath;
    return `assets/animals/${id}.svg`;
  }
  function getLevel(id) { return LEVELS.find((l) => l.id === id) || LEVELS[0]; }
  function getAnimal(id) { return ANIMALS.find((a) => a.id === id) || null; }
  function itemKey(item) { return item.text; }

  function countWords() {
    return LEVELS.reduce((acc, l) => acc + l.items.length, 0);
  }
  function getStats() {
    return {
      source: dataSource,
      animals: ANIMALS.length,
      words: countWords(),
      levels: LEVELS.length
    };
  }

  /* ---------- mapper: seed JSON → runtime model ---------- */
  const SEED_LEVEL_MAP = {
    L1_short:         { id: 'short',            label: 'Krátká slova' },
    L2_simple:        { id: 'simple',           label: 'Jednoduchá slova' },
    L3_animals:       { id: 'animals',          label: 'Zvířátka' },
    L4_nature:        { id: 'nature',           label: 'Příroda' },
    L5_home_school:   { id: 'home_school',      label: 'Doma a ve škole' },
    L6_actions_traits:{ id: 'actions_traits',   label: 'Děje a vlastnosti' },
    L7_sentences:     { id: 'world_sentences',  label: 'Věty o světě kolem nás' }
  };

  function mapSeed(vocab, animalsDoc) {
    const animals = (animalsDoc && animalsDoc.animals) || [];
    const entries = (vocab && vocab.entries) || [];
    const vocabLevels = (vocab && vocab.levels) || [];

    const mappedAnimals = animals.map((a) => ({
      id: a.id,
      name: a.name,
      fact: a.fact,
      imagePath: a.imagePath
    }));

    const nameToId = new Map();
    for (const a of animals) nameToId.set(a.name.toLowerCase(), a.id);

    const byLevel = new Map();
    for (const e of entries) {
      if (!byLevel.has(e.level)) byLevel.set(e.level, []);
      byLevel.get(e.level).push(e);
    }

    const syllables = {
      id: 'syllables', label: 'Písmena a slabiky',
      hint: 'Krátké slabiky pro úplný začátek.',
      items: INLINE_SYLLABLES.slice()
    };

    const seedLevels = vocabLevels.map((lvl) => {
      const meta = SEED_LEVEL_MAP[lvl.id] || { id: lvl.id, label: lvl.label };
      const items = (byLevel.get(lvl.id) || []).map((e) => {
        const item = { text: e.text };
        const aid = nameToId.get(e.text.toLowerCase());
        if (aid) item.animalId = aid;
        return item;
      });
      return { id: meta.id, label: meta.label, hint: lvl.note || lvl.label, items };
    });

    const sentences = {
      id: 'sentences', label: 'Krátké věty',
      hint: 'Jednoduché věty se zvířátky.',
      items: animals
        .filter((a) => a.sentence)
        .map((a) => ({ text: a.sentence, animalId: a.id }))
    };

    const levels = [syllables, ...seedLevels];
    if (sentences.items.length) levels.push(sentences);
    return { animals: mappedAnimals, levels };
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
    // fetch() is unavailable on file://; bail fast with a clear message.
    if (typeof fetch !== 'function') {
      console.info('[ReadingZOO] fetch unavailable, using inline data', getStats());
      return getStats();
    }
    try {
      const [vocab, animalsDoc] = await Promise.all([
        fetchJSON('data/content/vocabulary_200_seed.json'),
        fetchJSON('data/content/animals_50_seed.json')
      ]);
      const mapped = mapSeed(vocab, animalsDoc);
      if (!mapped.animals.length || !mapped.levels.length) {
        throw new Error('mapper produced empty dataset');
      }
      replaceInPlace(ANIMALS, mapped.animals);
      replaceInPlace(LEVELS, mapped.levels);
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
    LESSON_LENGTHS,
    animalImg,
    getLevel,
    getAnimal,
    itemKey,
    getStats,
    ready: loadFromSeed()
  };
})();
