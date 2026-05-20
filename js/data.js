/* Reading Zoo — content data
 * All Czech words/sentences live here. Each animal has a stable id (ASCII for
 * the SVG filename) plus a display name with proper diacritics. Words on
 * levels 2 and 3 reference an animal id whenever possible so the lesson can
 * award a "themed" animal at the end.
 */
(function () {
  const App = window.App || (window.App = {});

  const ANIMALS = [
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

  // Image filenames live in assets/animals/<id>.svg
  const animalImg = (id) => `assets/animals/${id}.svg`;

  /* Levels and their teaching items.
   * `text` is what the child reads. `animalId` (optional) links to ANIMALS so
   * tasks like "match the word with the picture" can render the right image,
   * and lesson-end rewards prefer animals that appeared in the lesson.
   */
  const LEVELS = [
    {
      id: 'syllables',
      label: 'Písmena a slabiky',
      hint: 'Krátké slabiky pro úplný začátek.',
      items: [
        { text: 'ma' }, { text: 'pa' }, { text: 'ta' }, { text: 'sa' }, { text: 'la' },
        { text: 'mo' }, { text: 'po' }, { text: 'to' }, { text: 'so' }, { text: 'lo' },
        { text: 'mi' }, { text: 'pi' }, { text: 'ti' }
      ]
    },
    {
      id: 'short',
      label: 'Krátká slova',
      hint: 'Krátká slova, většinou tři až čtyři písmena.',
      items: [
        { text: 'pes',  animalId: 'pes'  },
        { text: 'kos',  animalId: 'kos'  },
        { text: 'lev',  animalId: 'lev'  },
        { text: 'kůň',  animalId: 'kun'  },
        { text: 'slon', animalId: 'slon' },
        { text: 'sova', animalId: 'sova' },
        { text: 'žába', animalId: 'zaba' },
        { text: 'oko' },
        { text: 'ucho' },
        { text: 'ruka' }
      ]
    },
    {
      id: 'longer',
      label: 'Delší slova',
      hint: 'Delší slova, pět a více písmen.',
      items: [
        { text: 'kočka',  animalId: 'kocka'  },
        { text: 'liška',  animalId: 'liska'  },
        { text: 'zebra',  animalId: 'zebra'  },
        { text: 'kráva',  animalId: 'krava'  },
        { text: 'medvěd', animalId: 'medved' },
        { text: 'motýl' },
        { text: 'slunce' },
        { text: 'kytka' },
        { text: 'voda' },
        { text: 'domek' }
      ]
    },
    {
      id: 'sentences',
      label: 'Krátké věty',
      hint: 'Krátké jednoduché věty se zvířátky.',
      items: [
        { text: 'Pes štěká.',    animalId: 'pes'    },
        { text: 'Kočka spí.',    animalId: 'kocka'  },
        { text: 'Liška běží.',   animalId: 'liska'  },
        { text: 'Sova houká.',   animalId: 'sova'   },
        { text: 'Lev řve.',      animalId: 'lev'    },
        { text: 'Kráva bučí.',   animalId: 'krava'  },
        { text: 'Žába skáče.',   animalId: 'zaba'   },
        { text: 'Kůň cválá.',    animalId: 'kun'    }
      ]
    }
  ];

  /* Length presets — UI sugar over a plain number of tasks. */
  const LESSON_LENGTHS = [
    { id: 'short',  label: 'Krátká',  tasks: 5  },
    { id: 'medium', label: 'Střední', tasks: 8  },
    { id: 'long',   label: 'Delší',   tasks: 10 }
  ];

  function getLevel(id) {
    return LEVELS.find((l) => l.id === id) || LEVELS[0];
  }
  function getAnimal(id) {
    return ANIMALS.find((a) => a.id === id) || null;
  }
  function itemKey(item) {
    // localStorage key used for the knowledge score of a given teaching item.
    return item.text;
  }

  App.data = {
    ANIMALS,
    LEVELS,
    LESSON_LENGTHS,
    animalImg,
    getLevel,
    getAnimal,
    itemKey
  };
})();
