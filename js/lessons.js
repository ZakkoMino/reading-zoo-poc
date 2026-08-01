/* Lesson planner.
 *
 * Inputs : a level id + how many tasks to run.
 * Output : an ordered list of { item, type } steps for views.js to execute.
 *
 * Four small rules drive the planner:
 *   1. Pick items weighted toward those with a low knowledge score. The
 *      mapping is `weight = 1 + (SCORE_MAX - score)`, so a never-seen item
 *      with score 0 is six times more likely than a mastered item with score
 *      5. No ML, intentionally inspectable.
 *   2. Never repeat a word/sentence within a session: texts used by earlier
 *      lessons since the page loaded are excluded until the level's fresh
 *      items run out (see pickItems for the exact fallback order).
 *   3. Never use the same task type twice in a row, so the lesson feels
 *      varied. If the only allowed type for an item matches the previous
 *      one we let it through rather than skipping the item.
 *   4. Sentence levels get a gentler task mix: mostly plain reading with a
 *      few effortful steps sprinkled in (see pickSentenceType).
 *
 * A small `pickReward(plan)` helper picks the animal handed out at the end
 * of the lesson — preferring something that appeared in the lesson and
 * isn't already in the zoo, so the reward feels thematic.
 */
(function () {
  const App = window.App || (window.App = {});
  const { getLevel, getAnimal, ANIMALS, getTheme, levelHasThemes, LESSON_LENGTH } = App.data;
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

  /* Session no-repeat memory: texts already planned since the page loaded,
   * mapped to the sequence number of their last use. Deliberately NOT
   * persisted — closing/reloading the app starts a fresh session, and the
   * long-term adaptivity still lives in the knowledge scores. */
  const sessionHistory = new Map();
  let sessionSeq = 0;

  function markPlanned(texts) {
    for (const t of texts) sessionHistory.set(t, ++sessionSeq);
  }

  /* Pick `count` items with three guarantees:
   *   1. Within one lesson a text never repeats while the pool has enough
   *      distinct items; with a pool smaller than the lesson, repeats are
   *      cycled so every text appears once before any second showing and
   *      the same text never lands twice in a row.
   *   2. Across lessons in the same session, texts the child already saw
   *      are excluded until the level's fresh items run out; only then do
   *      the least-recently-used ones return (oldest first).
   *   3. The knowledge-score weighting still applies inside each of those
   *      candidate groups.
   */
  function pickItems(level, count) {
    // Duplicate texts in the source data would defeat the no-repeat rule.
    const seenTexts = new Set();
    const all = level.items.filter((it) => !seenTexts.has(it.text) && seenTexts.add(it.text));
    if (!all.length) return [];

    const out = [];

    // 1) weighted draw from items not seen this session
    const fresh = all.filter((it) => !sessionHistory.has(it.text));
    while (out.length < count && fresh.length) {
      const idx = weightedPick(fresh);
      out.push(fresh.splice(idx, 1)[0]);
    }

    // 2) top up from already-seen items, least recently used first, with a
    //    small weighted window so adaptivity survives pool exhaustion
    if (out.length < count) {
      const usedByAge = all
        .filter((it) => sessionHistory.has(it.text) && !out.includes(it))
        .sort((a, b) => sessionHistory.get(a.text) - sessionHistory.get(b.text));
      while (out.length < count && usedByAge.length) {
        const windowSize = Math.min(usedByAge.length, Math.max(4, count - out.length));
        const idx = weightedPick(usedByAge.slice(0, windowSize));
        out.push(usedByAge.splice(idx, 1)[0]);
      }
    }

    // 3) pool genuinely smaller than the lesson: cycle the picked sequence
    //    (max spacing between repeats, never the same text back to back)
    const base = out.slice();
    for (let i = 0; out.length < count; i++) {
      out.push(base[i % base.length]);
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

  /* ---------- task type mix ----------
   *
   * Sentence levels only (feedback 2026-08): building a whole sentence out
   * of letter tiles is the hardest thing the app asks for, and filling in a
   * missing letter is not far behind. Stacking them turns a lesson into
   * homework — on long sentences the old rules were the worst case, because
   * with only `read`/`fill` available the "no same type twice in a row" rule
   * forced a strict read/fill alternation (4 fills out of 8 steps).
   *
   * So on sentence levels four extra rules apply:
   *   a) at most ONE compose step per lesson (two only in a lesson twice the
   *      normal length),
   *   b) at most a third of the steps are effortful (compose or fill),
   *   c) never two effortful steps back to back,
   *   d) plain reading MAY repeat back to back — it is the intended filler
   *      between the effortful steps, so a typical lesson reads
   *      read → fill → read → compose → read → read → fill → read.
   * Word, syllable and letter levels keep the original uniform mix; the
   * tasks there are short enough that nobody complained.
   */
  const EFFORTFUL = new Set(['compose', 'fill']);
  const SENTENCE_WEIGHT = { read: 3, match: 2, fill: 1, compose: 1 };

  function sentenceLimits(count) {
    return {
      compose: count >= 2 * LESSON_LENGTH ? 2 : 1,
      effortful: Math.max(1, Math.round(count / 3))
    };
  }

  function weightedChoice(pool, weights) {
    const w = pool.map((t) => weights[t] || 1);
    const total = w.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function pickVariedType(allowed, prev) {
    const filtered = prev ? allowed.filter((t) => t !== prev) : allowed;
    const pool = filtered.length ? filtered : allowed;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickSentenceType(allowed, prev, used, limits) {
    // rule (d): reading may repeat, every other type keeps rule 3
    let pool = allowed.filter((t) => t === 'read' || t !== prev);
    // rule (a)
    if (used.compose >= limits.compose) pool = pool.filter((t) => t !== 'compose');
    // rules (b) + (c) — drop the effortful types, but never empty the pool
    if (used.effortful >= limits.effortful || EFFORTFUL.has(prev)) {
      const easy = pool.filter((t) => !EFFORTFUL.has(t));
      if (easy.length) pool = easy;
    }
    if (!pool.length) pool = allowed.includes('read') ? ['read'] : allowed;
    return weightedChoice(pool, SENTENCE_WEIGHT);
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
    const isSentenceLevel = kind === 'sentence';
    const limits = sentenceLimits(count);
    const used = { compose: 0, effortful: 0 };
    const items = pickItems(level, count);
    const plan = [];
    let prev = null;
    for (const item of items) {
      const allowed = allowedTasksFor(item, kind);
      const type = isSentenceLevel
        ? pickSentenceType(allowed, prev, used, limits)
        : pickVariedType(allowed, prev);
      if (EFFORTFUL.has(type)) {
        used.effortful++;
        if (type === 'compose') used.compose++;
      }
      // Copy with the level kind so task renderers can adapt (e.g. syllables
      // are spoken letter-by-letter first, then blended).
      plan.push({ item: Object.assign({ kind }, item), type });
      prev = type;
    }

    // UX rule from prototype feedback: if the selected level contains words
    // that can be composed, every lesson should visibly include at least one
    // full word-building task — not only "fill one missing letter". Combined
    // with the compose cap above this means sentence lessons get exactly one
    // (long-sentence levels none — nothing there is composable).
    if (kind !== 'letter' && !plan.some((step) => step.type === 'compose')) {
      const fits = (i) => {
        if (!allowedTasksFor(plan[i].item, kind).includes('compose')) return false;
        const before = i > 0 ? plan[i - 1].type : null;
        const after = i < plan.length - 1 ? plan[i + 1].type : null;
        // On sentence levels rule (c) applies to the injected step too.
        const clashes = isSentenceLevel
          ? (t) => t !== null && EFFORTFUL.has(t)
          : (t) => t === 'compose';
        return !clashes(before) && !clashes(after);
      };
      // Prefer turning a fill into the compose on sentence levels: the lesson
      // then keeps the same number of effortful steps instead of gaining one.
      let idx = isSentenceLevel
        ? plan.findIndex((step, i) => step.type === 'fill' && fits(i))
        : -1;
      if (idx === -1) idx = plan.findIndex((step, i) => fits(i));
      if (idx !== -1) plan[idx].type = 'compose';
    }

    // The flip side of the caps above: a sentence lesson that came out as
    // pure reading has no practice in it. Long-sentence levels hit this the
    // most — nothing there is composable, so the block above cannot help.
    // Turn one step into a single-letter fill, never the opening one, so the
    // lesson still starts with plain reading.
    if (isSentenceLevel && !plan.some((step) => EFFORTFUL.has(step.type))) {
      const idx = plan.findIndex(
        (step, i) => i > 0 && allowedTasksFor(step.item, kind).includes('fill')
      );
      if (idx !== -1) plan[idx].type = 'fill';
    }

    // Remember what this lesson used so the next one avoids it (see
    // pickItems). Challenge plans go through here too, on purpose.
    markPlanned(plan.map((step) => step.item.text));

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

  /* Progress toward the Velká výzva offer, expressed for the UI as a single
   * 0..100 % bar plus the three sub-goals behind it. The bar hits 100 %
   * exactly when masteryOf().mastered flips true, so the same rule drives
   * both — no thresholds are duplicated in the views. */
  function challengeProgress(levelId) {
    const m = masteryOf(levelId);
    const needPracticed = Math.min(MASTERY.MIN_PRACTICED, m.total);
    const strongRatio = m.practiced ? m.strong / m.practiced : 0;
    const goals = [
      { key: 'lessons', label: 'Dokončené lekce', have: m.lessons, need: MASTERY.MIN_LESSONS, suffix: '',
        ratio: Math.min(1, m.lessons / MASTERY.MIN_LESSONS) },
      { key: 'practiced', label: 'Procvičená slova', have: m.practiced, need: needPracticed, suffix: '',
        ratio: needPracticed ? Math.min(1, m.practiced / needPracticed) : 1 },
      { key: 'strong', label: 'Silná slova', have: Math.round(strongRatio * 100),
        need: Math.round(MASTERY.RATIO * 100), suffix: ' %',
        ratio: Math.min(1, strongRatio / MASTERY.RATIO) }
    ];
    goals.forEach((g) => { g.done = g.have >= g.need; });
    const overall = goals.reduce((sum, g) => sum + g.ratio, 0) / goals.length;
    return { mastered: m.mastered, percent: Math.round(overall * 100), goals };
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

  App.lessons = { buildLessonPlan, buildChallengePlan, masteryOf, challengeProgress, pickRewardChoices };
})();
