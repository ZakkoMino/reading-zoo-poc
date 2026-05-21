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

  const defaultState = () => ({
    settings: {
      levelId: 'short',
      lessonLength: 8,
      themeId: 'mix'   // only applied to sentence-style levels; 'mix' = no filter
    },
    scores: {},        // { [itemText]: 0..5 }
    zoo: [],           // animal ids in order earned
    stats: {
      lessonsCompleted: 0,
      tasksCorrect: 0,
      tasksTotal: 0
    },
    lastSeen: 0        // millisecond timestamp; used for trivial freshness
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // Shallow merge so newly-added fields don't crash on old saves.
      return Object.assign(defaultState(), parsed, {
        settings: Object.assign(defaultState().settings, parsed.settings || {}),
        stats: Object.assign(defaultState().stats, parsed.stats || {})
      });
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
    save();
    return true;
  }

  function recordLessonResult({ correct, total }) {
    state.stats.lessonsCompleted += 1;
    state.stats.tasksCorrect += correct;
    state.stats.tasksTotal += total;
    save();
  }

  App.state = {
    SCORE_MIN,
    SCORE_MAX,
    STORAGE_KEY,
    get,
    reset,
    setSettings,
    scoreOf,
    bumpScore,
    addToZoo,
    recordLessonResult
  };
})();
