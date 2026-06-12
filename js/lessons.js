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
  const { SCORE_MAX, scoreOf, get, starsOf, STAR_MAX } = App.state;

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

  function allowedTasksFor(item, kind) {
    const text = item.text;
    if (kind === 'letter') {
      const types = ['read', 'trace'];
      if (item.animalIds && item.animalIds.length) types.push('matchLetter');
      return types;
    }
    if (kind === 'syllable') return ['read', 'compose', 'trace'];

    const isSentence = kind === 'sentence' || / |\./.test(text);
    if (isSentence) {
      // The compose UI handles at most 3 words; longer sentences would fall
      // into a tap-through screen that isn't a real task, so they only get
      // genuine task types.
      const wordCount = text.trim().split(/\s+/).length;
      const types = wordCount <= 3 ? ['read', 'compose', 'fill'] : ['read', 'fill'];
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

  function buildPlanFromLevel(level, count) {
    const kind = level.kind || 'word';
    const items = pickItems(level, count);
    const plan = [];
    let prev = null;
    for (const item of items) {
      let allowed = allowedTasksFor(item, kind);
      const filtered = prev ? allowed.filter((t) => t !== prev) : allowed;
      const choices = filtered.length ? filtered : allowed;
      const type = choices[Math.floor(Math.random() * choices.length)];
      // Copy with the level kind so task renderers can adapt (e.g. syllables
      // are spoken letter-by-letter first, then blended).
      plan.push({ item: Object.assign({ kind }, item), type });
      prev = type;
    }

    // UX rule from prototype feedback: if the selected level contains words
    // that can be composed, every lesson should visibly include at least one
    // full word-building task — not only "fill one missing letter".
    if (kind !== 'letter' && !plan.some((step) => step.type === 'compose')) {
      const idx = plan.findIndex((step, i) => {
        if (!allowedTasksFor(step.item, kind).includes('compose')) return false;
        const before = i > 0 ? plan[i - 1].type : null;
        const after = i < plan.length - 1 ? plan[i + 1].type : null;
        return before !== 'compose' && after !== 'compose';
      });
      if (idx !== -1) plan[idx].type = 'compose';
    }

    return plan;
  }

  function buildLessonPlan(levelId, count) {
    const baseLevel = getLevel(levelId);
    const themeId = (get().settings || {}).themeId || 'mix';
    const level = applyTheme(baseLevel, themeId);
    return buildPlanFromLevel(level, count);
  }

  /* Velká výzva: a plan drawn from the NEXT level, no theme filter. */
  function buildChallengePlan(nextLevelId, count) {
    return buildPlanFromLevel(getLevel(nextLevelId), count || 8);
  }

  /* Mastery check that drives the level-up offer: at least MIN_LESSONS
   * lessons on this level, a reasonable share of its items practiced, and
   * 80 % of the practiced items at score >= 4. Story level never masters
   * (nothing above it). */
  const MASTERY = { MIN_LESSONS: 5, MIN_PRACTICED: 10, RATIO: 0.8, SCORE: 4 };

  function masteryOf(levelId) {
    const level = getLevel(levelId);
    const lessons = (get().stats.lessonsByLevel || {})[levelId] || 0;
    const items = level.items || [];
    const practiced = items.filter((it) => scoreOf(it.text) > 0);
    const strong = practiced.filter((it) => scoreOf(it.text) >= MASTERY.SCORE);
    const needPracticed = Math.min(MASTERY.MIN_PRACTICED, items.length);
    const mastered =
      level.kind !== 'story' &&
      lessons >= MASTERY.MIN_LESSONS &&
      practiced.length >= needPracticed &&
      practiced.length > 0 &&
      strong.length / practiced.length >= MASTERY.RATIO;
    return {
      mastered,
      lessons,
      practiced: practiced.length,
      strong: strong.length,
      total: items.length
    };
  }

  /* Reward = a choice of (up to) two animals the child picks from.
   *
   * Choice kinds:
   *   'new'  — animal not yet in the zoo; picking it adds it with 1 star.
   *   'star' — animal already owned below STAR_MAX; picking it grows it
   *            by one star (1★ mládě → 5★ nejsilnější).
   *   'bonus'— everything collected at max stars; pure celebration.
   *
   * Pools are tried in priority order so the pair ideally mixes one new
   * animal with one to grow, both preferring animals that actually
   * appeared in the lesson (thematic reward).
   */
  function pickRewardChoices(plan) {
    const zoo = get().zoo;
    const lessonIds = new Set();
    for (const step of plan) {
      if (step.item.animalId) lessonIds.add(step.item.animalId);
      // letter items carry a list of animals (the "find" task pool)
      (step.item.animalIds || []).forEach((id) => lessonIds.add(id));
    }

    const isNew = (a) => !zoo.includes(a.id);
    const canStar = (a) => zoo.includes(a.id) && starsOf(a.id) < STAR_MAX;

    const pools = [
      ANIMALS.filter((a) => isNew(a) && lessonIds.has(a.id)),
      ANIMALS.filter((a) => canStar(a) && lessonIds.has(a.id)),
      ANIMALS.filter((a) => isNew(a) && !lessonIds.has(a.id)),
      ANIMALS.filter((a) => canStar(a) && !lessonIds.has(a.id))
    ];

    const choices = [];
    const used = new Set();
    // Two passes over the pools: the first takes at most one animal from
    // each pool (mix of new + grow), the second fills a remaining slot.
    for (let pass = 0; pass < 2 && choices.length < 2; pass++) {
      for (const pool of pools) {
        if (choices.length >= 2) break;
        const open = pool.filter((a) => !used.has(a.id));
        if (!open.length) continue;
        const a = open[Math.floor(Math.random() * open.length)];
        used.add(a.id);
        choices.push({ animal: a, kind: isNew(a) ? 'new' : 'star', stars: starsOf(a.id) });
      }
    }

    if (!choices.length) {
      // Zoo complete and every animal at max stars — celebrate anyway.
      const a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      choices.push({ animal: a, kind: 'bonus', stars: starsOf(a.id) });
    }
    return choices;
  }

  App.lessons = { buildLessonPlan, buildChallengePlan, masteryOf, pickRewardChoices };
})();
