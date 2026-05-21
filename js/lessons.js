/* Lesson planner.
 *
 * Inputs : a level id + how many tasks to run.
 * Output : an ordered list of { item, type } steps for views.js to execute.
 *
 * Two small rules drive the planner:
 *   1. Pick items weighted toward those with a low knowledge score. The
 *      mapping is `weight = 1 + (SCORE_MAX - score)`, so a never-seen item
 *      with score 0 is six times more likely than a mastered item with score
 *      5. No ML, intentionally inspectable.
 *   2. Never use the same task type twice in a row, so the lesson feels
 *      varied. If the only allowed type for an item matches the previous
 *      one we let it through rather than skipping the item.
 *
 * A small `pickReward(plan)` helper picks the animal handed out at the end
 * of the lesson — preferring something that appeared in the lesson and
 * isn't already in the zoo, so the reward feels thematic.
 */
(function () {
  const App = window.App || (window.App = {});
  const { getLevel, getAnimal, ANIMALS, getTheme, levelHasThemes } = App.data;
  const { SCORE_MAX, scoreOf, get } = App.state;

  function weightedPick(items) {
    const weights = items.map((it) => 1 + (SCORE_MAX - scoreOf(it.text)));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }

  function pickItems(level, count) {
    const pool = level.items.slice();
    const out = [];
    while (out.length < count && pool.length) {
      const idx = weightedPick(pool);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    // If the level is small, allow repeats by drawing from a fresh pool.
    while (out.length < count) {
      const idx = weightedPick(level.items);
      out.push(level.items[idx]);
    }
    return out;
  }

  function allowedTasksFor(item) {
    const text = item.text;
    const isSentence = / |\./.test(text);
    if (isSentence) {
      const types = ['read', 'compose', 'fill'];
      if (item.animalId) types.push('match');
      return types;
    }
    if (text.length <= 2) return ['read', 'compose'];
    const types = ['read', 'compose', 'fill'];
    if (item.animalId) types.push('match');
    return types;
  }

  /* If the level supports themes and the user picked a non-mix theme,
   * narrow the item pool to that theme's categories. Empty result falls
   * back to the full pool so the lesson never crashes on a stale theme. */
  function applyTheme(level, themeId) {
    if (!themeId || themeId === 'mix') return level;
    if (!levelHasThemes(level)) return level;
    const theme = getTheme(themeId);
    if (!theme || !theme.categories) return level;
    const allowed = new Set(theme.categories);
    const filtered = level.items.filter((it) => it.category && allowed.has(it.category));
    if (!filtered.length) return level;
    return Object.assign({}, level, { items: filtered });
  }

  function buildLessonPlan(levelId, count) {
    const baseLevel = getLevel(levelId);
    const themeId = (get().settings || {}).themeId || 'mix';
    const level = applyTheme(baseLevel, themeId);
    const items = pickItems(level, count);
    const plan = [];
    let prev = null;
    for (const item of items) {
      let allowed = allowedTasksFor(item);
      const filtered = prev ? allowed.filter((t) => t !== prev) : allowed;
      const choices = filtered.length ? filtered : allowed;
      const type = choices[Math.floor(Math.random() * choices.length)];
      plan.push({ item, type });
      prev = type;
    }

    // UX rule from prototype feedback: if the selected level contains words
    // that can be composed, every lesson should visibly include at least one
    // full word-building task — not only "fill one missing letter".
    if (!plan.some((step) => step.type === 'compose')) {
      const idx = plan.findIndex((step, i) => {
        if (!allowedTasksFor(step.item).includes('compose')) return false;
        const before = i > 0 ? plan[i - 1].type : null;
        const after = i < plan.length - 1 ? plan[i + 1].type : null;
        return before !== 'compose' && after !== 'compose';
      });
      if (idx !== -1) plan[idx].type = 'compose';
    }

    return plan;
  }

  function pickReward(plan) {
    const zoo = get().zoo;
    const inLesson = [];
    const seen = new Set();
    for (const step of plan) {
      const id = step.item.animalId;
      if (id && !seen.has(id) && !zoo.includes(id)) {
        seen.add(id);
        inLesson.push(id);
      }
    }
    if (inLesson.length) {
      const id = inLesson[Math.floor(Math.random() * inLesson.length)];
      return { animal: getAnimal(id), isNew: true };
    }
    const missing = ANIMALS.filter((a) => !zoo.includes(a.id));
    if (missing.length) {
      const a = missing[Math.floor(Math.random() * missing.length)];
      return { animal: a, isNew: true };
    }
    // Zoo complete — return a duplicate so the child still gets a celebration.
    const a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return { animal: a, isNew: false };
  }

  App.lessons = { buildLessonPlan, pickReward };
})();
