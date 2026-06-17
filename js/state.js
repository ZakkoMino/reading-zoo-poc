/* State + persistence.
 *
 * Everything is stored under a single localStorage key so the model is easy
 * to inspect (DevTools → Application → Local Storage → reading-zoo-state).
 * The "knowledge score" per item is a small integer 0..5, with a single
 * tunable: items with low scores are picked more often by the lesson
 * generator. Reset wipes the whole blob.
 */
(function () {
  const App = window.App || (window.App = {});

  const STORAGE_KEY = 'reading-zoo-state';
  const SCORE_MIN = 0;
  const SCORE_MAX = 5;
  const STAR_MAX = 5; // 1★ mládě → 5★ nejsilnější

  const defaultState = () => ({
    settings: {
      levelId: 'letters',
      lessonLength: 8,
      themeId: 'mix'   // only applied to sentence-style levels; 'mix' = no filter
    },
    scores: {},        // { [itemText]: 0..5 }
    zoo: [],           // animal ids in order earned
    zooStars: {},      // { [animalId]: 1..STAR_MAX }
    // TESTING BUILD: every level is unlocked from the start so a teacher can
    // jump straight to any phase. (In the normal build only the first three
    // are open and the rest unlock by winning the Velká výzva. Because all
    // levels are open here, the challenge offer + its progress bar stay
    // dormant.)
    unlockedLevels: (App.data && App.data.LEVEL_ORDER)
      ? App.data.LEVEL_ORDER.slice()
      : ['letters', 'syllables', 'words1', 'words2', 'words3', 'sentences1', 'sentences2', 'stories'],
    badges: [],        // level ids whose Velká výzva was won
    storiesRead: {},   // { [storyId]: true }
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
      const parsed = JSON.parse(raw);
      // Shallow merge so newly-added fields don't crash on old saves.
      const merged = Object.assign(defaultState(), parsed, {
        settings: Object.assign(defaultState().settings, parsed.settings || {}),
        stats: Object.assign(defaultState().stats, parsed.stats || {})
      });
      if (!merged.stats.lessonsByLevel) merged.stats.lessonsByLevel = {};
      // Saves from before star levels: every owned animal starts at 1 star.
      for (const id of merged.zoo) {
        if (!merged.zooStars[id]) merged.zooStars[id] = 1;
      }
      // Legacy level id → new curriculum id, unlocking everything up to it.
      const order = (App.data && App.data.LEVEL_ORDER) || [];
      if (merged.settings.levelId && !order.includes(merged.settings.levelId)) {
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
      return merged;
    } catch (err) {
      console.warn('Nepodařilo se načíst stav, použiji výchozí.', err);
      return defaultState();
    }
  }

  function save() {
    state.lastSeen = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Nepodařilo se uložit stav.', err);
    }
  }

  function reset() {
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
    return state.scores[itemKey] ?? 0;
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

  App.state = {
    SCORE_MIN,
    SCORE_MAX,
    STAR_MAX,
    STORAGE_KEY,
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
