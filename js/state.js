/* Versioned local practice history, rewards and resumable lesson.
 * Legacy scores are preserved for migration only, never used as assessment. */
(function () {
  const App = window.App || (window.App = {});

  const STORAGE_KEY = 'reading-zoo-state';
  const BACKUP_KEY = STORAGE_KEY + '-backup';
  const RECOVERY_KEY = STORAGE_KEY + '-recovery';
  const SCHEMA = 2;
  // Deliberate testing configuration, NOT the production unlocking policy.
  const TESTING_ALL_LEVELS = true;
  let storageError = '';
  let writeBlocked = false;
  const SCORE_MIN = 0;
  const SCORE_MAX = 5;
  const STAR_MAX = 5; // 1★ mládě → 5★ nejsilnější

  const defaultState = () => ({
    schema: SCHEMA,
    settings: {
      levelId: 'letters',
      themeId: 'mix'   // only applied to sentence-style levels; 'mix' = no filter
    },
    scores: {},        // { [itemText]: 0..5 }
    zoo: [],           // animal ids in order earned
    zooStars: {},      // { [animalId]: 1..STAR_MAX }
    // Testing-only access; production start/progression still requires implementation.
    unlockedLevels: !TESTING_ALL_LEVELS ? ['letters'] : (App.data && App.data.LEVEL_ORDER)
      ? App.data.LEVEL_ORDER.slice()
      : ['letters', 'syllables', 'words1', 'words2', 'words3', 'sentences1', 'sentences2', 'stories'],
    badges: [],        // level ids whose Velká výzva was won
    storiesRead: {},   // { [storyId]: true }
    storyRewards: {},  // separate from reading: an unsuccessful attempt never forfeits a reward
    practice: {},      // levelId + text -> completed practice count, NOT a reading grade
    lesson: null,
    pendingReward: null,
    stats: {
      lessonsCompleted: 0,
      tasksCorrect: 0,
      tasksTotal: 0,
      lessonsByLevel: {}   // { [levelId]: lessons completed on that level }
    },
    lastSeen: 0        // millisecond timestamp; used for trivial freshness
  });

  /* Saves from before curriculum v2 used different level ids. Map them to
   * the closest new level and unlock everything up to it, so nobody loses
   * access to content they were already practicing. */
  const LEGACY_LEVEL_MAP = {
    short: 'words1', simple: 'words1', longer: 'words2', animals: 'words2',
    nature: 'words2', home_school: 'words2', actions_traits: 'words2',
    sentences: 'sentences1', world_sentences: 'sentences1'
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (err) {
        // Keep the exact damaged value before recovering; never silently overwrite it.
        localStorage.setItem(RECOVERY_KEY, raw);
        parsed = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null');
        storageError = 'Uložený pokrok byl poškozen. Použita záloha, pokud byla dostupná. Původní data jsou zachována pro obnovu.';
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        localStorage.setItem(RECOVERY_KEY, raw);
        storageError = 'Uložený pokrok nemá platný formát. Původní data jsou zachována pro obnovu.';
        return defaultState();
      }
      if (parsed.schema > SCHEMA) { writeBlocked = true; throw new Error('Novější verze uložených dat'); }
      // Merge defaults, then normalize every persisted collection and count.
      const merged = Object.assign(defaultState(), parsed, {
        settings: Object.assign(defaultState().settings, parsed.settings || {}),
        stats: Object.assign(defaultState().stats, parsed.stats || {})
      });
      const dictionary = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      const counts = (value, max = Number.MAX_SAFE_INTEGER) => Object.fromEntries(
        Object.entries(dictionary(value)).filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key))
          .map(([key, count]) => [key, Number.isSafeInteger(count) && count >= 0 ? Math.min(count, max) : 0]));
      const flags = (value) => Object.fromEntries(Object.entries(dictionary(value)).filter(([, v]) => v === true));
      merged.schema = SCHEMA;
      merged.zoo = Array.isArray(merged.zoo) ? [...new Set(merged.zoo.filter((id) => typeof id === 'string'))] : [];
      merged.zooStars = counts(merged.zooStars, STAR_MAX);
      merged.scores = counts(merged.scores, SCORE_MAX);
      merged.practice = counts(merged.practice);
      merged.storiesRead = flags(merged.storiesRead);
      merged.storyRewards = flags(merged.storyRewards);
      merged.stats.lessonsByLevel = counts(merged.stats.lessonsByLevel);
      for (const key of ['lessonsCompleted', 'tasksCorrect', 'tasksTotal']) {
        merged.stats[key] = Number.isSafeInteger(merged.stats[key]) && merged.stats[key] >= 0 ? merged.stats[key] : 0;
      }
      if (typeof merged.settings.themeId !== 'string') merged.settings.themeId = 'mix';
      // Checkpoint data is revalidated against current content by the lesson view.
      if (!merged.lesson || !Array.isArray(merged.lesson.plan) || !Number.isInteger(merged.lesson.index)
          || merged.lesson.index < 0 || merged.lesson.index > merged.lesson.plan.length
          || !Number.isInteger(merged.lesson.correctCount) || merged.lesson.correctCount < 0) merged.lesson = null;
      if (!merged.pendingReward || !Array.isArray(merged.pendingReward.choices)
          || !merged.pendingReward.choices.length || merged.pendingReward.choices.length > 2
          || !merged.pendingReward.choices.every((c) => c && ['new', 'star', 'bonus'].includes(c.kind)
            && c.animal && typeof c.animal.id === 'string')
          || !Number.isInteger(merged.pendingReward.total) || merged.pendingReward.total < 1 || merged.pendingReward.total > 100) merged.pendingReward = null;
      // Saves from before star levels: every owned animal starts at 1 star.
      for (const id of merged.zoo) {
        if (!merged.zooStars[id]) merged.zooStars[id] = 1;
      }
      // Legacy level id → new curriculum id, unlocking everything up to it.
      const order = (App.data && App.data.LEVEL_ORDER) || [];
      if (!order.includes(merged.settings.levelId)) {
        merged.settings.levelId = LEGACY_LEVEL_MAP[merged.settings.levelId] || 'letters';
      }
      if (!Array.isArray(merged.unlockedLevels)) merged.unlockedLevels = [];
      if (!Array.isArray(merged.badges)) merged.badges = [];
      // The baseline unlocks also apply to saves created before this change.
      const baseline = defaultState().unlockedLevels;
      for (const id of baseline) {
        if (!merged.unlockedLevels.includes(id)) merged.unlockedLevels.push(id);
      }
      // An unlock beyond the baseline is legitimate only when the previous
      // level's badge was earned (Velká výzva won). This also strips the
      // over-generous unlocks that an earlier migration granted to old saves.
      if (order.length) {
        merged.unlockedLevels = merged.unlockedLevels.filter((id) => {
          if (baseline.includes(id)) return true;
          const i = order.indexOf(id);
          return i > 0 && merged.badges.includes(order[i - 1]);
        });
        // The selected level must be unlocked; fall back to the highest one.
        if (!merged.unlockedLevels.includes(merged.settings.levelId)) {
          for (let i = order.length - 1; i >= 0; i--) {
            if (merged.unlockedLevels.includes(order[i])) {
              merged.settings.levelId = order[i];
              break;
            }
          }
        }
      }
      for (const key of ['zoo', 'scores', 'practice', 'stats', 'lesson', 'pendingReward', 'settings']) {
        if (parsed[key] !== undefined && JSON.stringify(parsed[key]) !== JSON.stringify(merged[key])) {
          localStorage.setItem(RECOVERY_KEY, raw);
          storageError = 'Formát uloženého pokroku byl opraven. Původní data jsou zachována pro obnovu.';
          break;
        }
      }
      return merged;
    } catch (err) {
      console.warn('Nepodařilo se načíst stav, použiji výchozí.', err);
      storageError = writeBlocked
        ? 'Pokrok pochází z novější verze aplikace. Zápis je zablokován, aby se data nepřepsala. Aktualizuj aplikaci; reset použij pouze při vědomém začátku od nuly.'
        : 'Pokrok nelze načíst. Nezavírej aplikaci, dokud neověříš úložiště prohlížeče.';
      return defaultState();
    }
  }

  function save() {
    state.lastSeen = Date.now();
    try {
      if (writeBlocked) throw new Error('Novější data nesmí starší aplikace přepsat');
      const previous = localStorage.getItem(STORAGE_KEY);
      if (previous) {
        try {
          const doc = JSON.parse(previous);
          if (doc && typeof doc === 'object' && !Array.isArray(doc)) localStorage.setItem(BACKUP_KEY, previous);
        } catch (_) { localStorage.setItem(RECOVERY_KEY, previous); }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageError = '';
      notifyStorage();
      return true;
    } catch (err) {
      console.warn('Nepodařilo se uložit stav.', err);
      storageError = writeBlocked
        ? 'Pokrok se NEUKLÁDÁ: data jsou z novější verze. Aktualizuj aplikaci; původní data zůstávají chráněná.'
        : 'Pokrok se nyní NEUKLÁDÁ. Nezavírej aplikaci. Uvolni místo nebo povol místní úložiště a zkus další akci.';
      notifyStorage();
      return false;
    }
  }

  function notifyStorage() {
    const node = document.getElementById('storage-status');
    if (node) { node.textContent = storageError; node.hidden = !storageError; }
  }

  function reset() {
    if (App.lifecycle) App.lifecycle.cancel();
    writeBlocked = false;
    state = defaultState();
    save();
  }

  function get() {
    return state;
  }

  function setSettings(patch) {
    state.settings = Object.assign({}, state.settings, patch);
    save();
  }

  function scoreOf(itemKey) {
    const value = state.scores[itemKey];
    return Number.isFinite(value) ? value : 0;
  }

  function bumpScore(itemKey, delta) {
    const next = Math.max(SCORE_MIN, Math.min(SCORE_MAX, scoreOf(itemKey) + delta));
    state.scores[itemKey] = next;
    save();
    return next;
  }

  function addToZoo(animalId) {
    if (!animalId) return false;
    if (state.zoo.includes(animalId)) return false;
    state.zoo.push(animalId);
    state.zooStars[animalId] = state.zooStars[animalId] || 1;
    save();
    return true;
  }

  function starsOf(animalId) {
    return state.zooStars[animalId] || 0;
  }

  /* Grow an owned animal by one star (capped at STAR_MAX). For an animal
   * not yet owned it behaves like addToZoo. Returns the new star count. */
  function bumpStars(animalId) {
    if (!state.zoo.includes(animalId)) {
      addToZoo(animalId);
      return starsOf(animalId);
    }
    const next = Math.min(STAR_MAX, starsOf(animalId) + 1);
    state.zooStars[animalId] = next;
    save();
    return next;
  }

  function recordLessonResult({ correct, total, levelId }) {
    state.stats.lessonsCompleted += 1;
    state.stats.tasksCorrect += correct;
    state.stats.tasksTotal += total;
    if (levelId) {
      state.stats.lessonsByLevel[levelId] = (state.stats.lessonsByLevel[levelId] || 0) + 1;
    }
    save();
  }

  function isUnlocked(levelId) {
    return state.unlockedLevels.includes(levelId);
  }

  /* Unlock a level won through the Velká výzva; the badge belongs to the
   * level that was MASTERED (the one before the newly unlocked one). */
  function unlockLevel(levelId, masteredLevelId) {
    if (!state.unlockedLevels.includes(levelId)) state.unlockedLevels.push(levelId);
    if (masteredLevelId && !state.badges.includes(masteredLevelId)) {
      state.badges.push(masteredLevelId);
    }
    save();
  }

  function hasBadge(levelId) {
    return state.badges.includes(levelId);
  }

  function markStoryRead(storyId) {
    if (!storyId) return;
    state.storiesRead[storyId] = true;
    save();
  }

  function isStoryRead(storyId) {
    return !!state.storiesRead[storyId];
  }

  function practiceKey(levelId, text) { return JSON.stringify([levelId, text]); }
  function practiceOf(levelId, text) { return state.practice[practiceKey(levelId, text)] || 0; }
  function checkpoint(lesson, practicedText) {
    state.lesson = lesson ? JSON.parse(JSON.stringify(lesson)) : null;
    if (lesson && practicedText) {
      const key = practiceKey(lesson.levelId, practicedText);
      state.practice[key] = Math.min(Number.MAX_SAFE_INTEGER, practiceOf(lesson.levelId, practicedText) + 1);
    }
    save();
  }
  function completeLesson(choices, total, levelId) {
    state.lesson = null;
    state.pendingReward = { choices: JSON.parse(JSON.stringify(choices)), total };
    recordLessonResult({ correct: 0, total, levelId });
  }
  function claimReward(choice) {
    const pending = state.pendingReward;
    if (!pending || !pending.choices.some((c) => c.animal.id === choice.animal.id && c.kind === choice.kind)) return null;
    const id = choice.animal.id;
    if (choice.kind === 'new' && !state.zoo.includes(id)) { state.zoo.push(id); state.zooStars[id] = 1; }
    else if (choice.kind === 'star') state.zooStars[id] = Math.min(STAR_MAX, starsOf(id) + 1);
    state.pendingReward = null;
    save(); // reward and consumed claim are one persisted snapshot
    return Object.assign({}, choice, { stars: starsOf(id) });
  }
  function completeStory(storyId, animalId, solved) {
    state.storiesRead[storyId] = true;
    let awarded = false;
    if (solved && !state.storyRewards[storyId] && state.zoo.includes(animalId) && starsOf(animalId) < STAR_MAX) {
      state.storyRewards[storyId] = true;
      state.zooStars[animalId] = Math.min(STAR_MAX, starsOf(animalId) + 1);
      awarded = true;
    }
    save();
    return awarded;
  }

  App.state = {
    SCORE_MIN,
    SCORE_MAX,
    STAR_MAX,
    STORAGE_KEY,
    TESTING_ALL_LEVELS,
    notifyStorage,
    practiceOf,
    checkpoint,
    completeLesson,
    claimReward,
    completeStory,
    get,
    reset,
    setSettings,
    scoreOf,
    bumpScore,
    addToZoo,
    starsOf,
    bumpStars,
    recordLessonResult,
    isUnlocked,
    unlockLevel,
    hasBadge,
    markStoryRead,
    isStoryRead
  };
})();
