/* Screens (views).
 *
 * Single-page app, no framework. There are exactly five screens we paint:
 *   onboarding  — level + length picker
 *   lesson      — runs through the task plan, then shows the reward summary
 *   zoo         — grid of earned animals
 *   animal      — detail card with pronunciation + fact
 *   progress    — simple "parent" panel: stats + per-word knowledge scores
 *
 * Every screen renders into the shared #screen mount. The top header is
 * static; only the body content swaps. This keeps the DOM small and easy
 * to inspect, which was an explicit goal of the brief.
 */
(function () {
  const App = window.App || (window.App = {});
  const { LEVELS, STORIES, LESSON_LENGTHS, ANIMALS, getLevel, getAnimal, getStory, animalImg, availableThemes, levelHasThemes, nextLevelId } = App.data;
  const { get, setSettings, scoreOf, SCORE_MAX, addToZoo, bumpScore, starsOf, bumpStars, STAR_MAX, recordLessonResult, reset,
          isUnlocked, unlockLevel, hasBadge, markStoryRead, isStoryRead } = App.state;
  const { buildLessonPlan, buildChallengePlan, masteryOf, pickRewardChoices } = App.lessons;
  const { speak, isAvailable: speechAvailable } = App.speech;

  /* ---------- DOM helpers (same minimal kit as tasks.js) ---------- */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'on') for (const ev in attrs.on) n.addEventListener(ev, attrs.on[ev]);
        else if (k in n) n[k] = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    (kids || []).forEach((c) => c != null && n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* ---------- star helpers ---------- */
  // Index = star count; 0 unused (an owned animal always has ≥ 1 star).
  const STAR_STAGES = ['', 'Mládě', 'Vyrůstá', 'Dospělé', 'Silné', 'Nejsilnější'];

  function stageName(stars) {
    return STAR_STAGES[Math.max(0, Math.min(STAR_MAX, stars))] || '';
  }

  function starRow(stars, cls) {
    return el('span', {
      class: cls || 'star-row',
      'aria-label': `${stars} z ${STAR_MAX} hvězd`,
      text: '★'.repeat(stars) + '☆'.repeat(Math.max(0, STAR_MAX - stars))
    });
  }

  /* Stage presentation: the same base illustration "grows" with stars —
   * scaled-down baby at 1★ up to full size at 3★, then a silver (4★) and
   * gold + crown (5★) frame. Works with any art set, no per-stage drawings
   * needed; if per-stage artwork is added later, only animalImg changes. */
  function stageClass(stars) {
    return ' stage-' + Math.max(1, Math.min(STAR_MAX, stars));
  }

  function stageBadge(stars) {
    if (stars >= 5) return el('span', { class: 'stage-badge', 'aria-hidden': 'true', text: '👑' });
    if (stars === 4) return el('span', { class: 'stage-badge', 'aria-hidden': 'true', text: '🥈' });
    return null;
  }

  /* ---------- onboarding ---------- */
  function renderOnboarding(mount) {
    const settings = get().settings;

    const levelChips = el('div', { class: 'chips' });
    LEVELS.forEach((lvl) => {
      const unlocked = isUnlocked(lvl.id);
      const earned = hasBadge(lvl.id);
      const chip = el('button', {
        class: 'chip'
          + (lvl.id === settings.levelId ? ' chip-selected' : '')
          + (unlocked ? '' : ' chip-locked'),
        'aria-disabled': unlocked ? 'false' : 'true',
        on: {
          click: () => {
            if (!unlocked) {
              chip.classList.remove('chip-shake');
              void chip.offsetWidth; // restart the animation
              chip.classList.add('chip-shake');
              speak('Tahle úroveň se teprve odemkne. Splň Velkou výzvu!');
              return;
            }
            setSettings({ levelId: lvl.id });
            App.nav('onboarding');
          }
        }
      }, [
        el('div', { class: 'chip-title' }, [
          el('span', { text: (unlocked ? '' : '🔒 ') + lvl.label + ' ' }),
          el('span', { class: 'chip-badge', 'aria-hidden': 'true', text: (lvl.badge || '') + (earned ? ' 🏅' : '') })
        ]),
        el('div', { class: 'chip-hint', text: unlocked ? lvl.hint : 'Odemkne se Velkou výzvou.' })
      ]);
      levelChips.appendChild(chip);
    });

    /* Velká výzva banner: shown once the current level is mastered and a
     * locked next level exists. Winning it (8/8) unlocks the next level. */
    const mastery = masteryOf(settings.levelId);
    const nextId = nextLevelId(settings.levelId);
    const nextLevel = nextId ? getLevel(nextId) : null;
    const showChallenge = mastery.mastered && nextId && !isUnlocked(nextId);
    const challengeBanner = showChallenge
      ? el('div', { class: 'challenge-banner' }, [
          el('div', { class: 'challenge-text' }, [
            el('strong', { text: 'Velká výzva 🏆 ' }),
            el('span', { text: `Zvládáš úroveň ${getLevel(settings.levelId).label}! Odemkni „${nextLevel.label}".` })
          ]),
          el('button', {
            class: 'btn btn-primary',
            on: { click: () => App.nav('challenge') }
          }, [el('span', { text: 'Jdu do toho! ▶' })])
        ])
      : null;

    const lengthChips = el('div', { class: 'chips chips-row' });
    LESSON_LENGTHS.forEach((opt) => {
      const chip = el('button', {
        class: 'chip chip-small' + (opt.tasks === settings.lessonLength ? ' chip-selected' : ''),
        on: {
          click: () => {
            setSettings({ lessonLength: opt.tasks });
            App.nav('onboarding');
          }
        }
      }, [
        el('div', { class: 'chip-title', text: opt.label }),
        el('div', { class: 'chip-hint', text: `${opt.tasks} úkolů` })
      ]);
      lengthChips.appendChild(chip);
    });

    /* Theme picker — only visible when the chosen level actually carries
     * sentence categories. Other levels skip this step entirely so the UI
     * doesn't grow for word-level lessons. */
    const currentLevel = getLevel(settings.levelId);
    const showThemes = levelHasThemes(currentLevel);
    const themes = showThemes ? availableThemes(currentLevel) : [];
    const themeId = settings.themeId || 'mix';
    const themeChips = el('div', {
      class: 'chips chips-row theme-chips',
      role: 'group',
      'aria-label': 'Téma věty'
    });
    themes.forEach((t) => {
      const selected = t.id === themeId;
      const chip = el('button', {
        class: 'chip chip-theme' + (selected ? ' chip-selected' : ''),
        'aria-pressed': selected ? 'true' : 'false',
        on: {
          click: () => {
            setSettings({ themeId: t.id });
            App.nav('onboarding');
          }
        }
      }, [
        el('span', { class: 'chip-icon', 'aria-hidden': 'true', text: t.icon || '' }),
        el('span', { class: 'chip-title', text: t.label })
      ]);
      themeChips.appendChild(chip);
    });

    const card = el('section', { class: 'screen onboarding' }, [
      el('h1', { text: 'Vítej ve Čtecí ZOO! 🦁' }),
      el('p', { class: 'lead', text: 'Vyber si, kde chceš začít. Pak si můžeš vybírat zvířátka do své zoo.' }),

      challengeBanner,

      el('h2', { text: '1. Co budeme dnes číst?' }),
      levelChips,

      showThemes ? el('h2', { text: '2. O čem dnes?' }) : null,
      showThemes ? themeChips : null,

      el('h2', { text: showThemes ? '3. Jak dlouho?' : '2. Jak dlouho?' }),
      lengthChips,

      el('p', { class: 'pedagogy' }, [
        el('strong', { text: 'Tip pro rodiče: ' }),
        document.createTextNode('Klidně začni jednodušší úrovní. Aplikace si pamatuje, co už dítě umí, a postupně přidává obtížnost.')
      ]),

      el('div', { class: 'cta-row' }, [
        el('button', {
          class: 'btn btn-primary btn-huge',
          on: { click: () => App.nav('lesson') }
        }, [el('span', { text: 'Začít lekci ▶' })])
      ])
    ]);

    mount.appendChild(card);
  }

  /* ---------- lesson ---------- */
  async function renderLesson(mount) {
    const { levelId, lessonLength } = get().settings;
    // The story level has no tasks — it opens the story library instead.
    if (getLevel(levelId).kind === 'story') {
      renderStoryLibrary(mount);
      return;
    }
    const plan = buildLessonPlan(levelId, lessonLength);

    const progress = el('div', { class: 'progress' });
    const progressFill = el('div', { class: 'progress-fill' });
    progress.appendChild(progressFill);

    const counter = el('div', { class: 'progress-counter' });
    const taskMount = el('div', { class: 'task-mount' });
    const feedback = el('div', { class: 'feedback hidden', 'aria-live': 'polite' });

    const screen = el('section', { class: 'screen lesson' }, [
      el('div', { class: 'lesson-header' }, [counter, progress]),
      taskMount,
      feedback
    ]);
    mount.appendChild(screen);

    function setProgress(i, total) {
      progressFill.style.width = ((i / total) * 100) + '%';
      counter.textContent = `Úkol ${Math.min(i + 1, total)} z ${total}`;
    }

    function showFeedback(correct) {
      const messages = correct
        ? ['Skvělé! 🌟', 'Super! ✨', 'Výborně! 💫', 'Šikulka! ⭐', 'Krásně! 🎉']
        : ['Pokračujeme dál. 🌱', 'To nevadí, jde to. 🌱', 'Učíme se. 💪'];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      feedback.textContent = msg;
      feedback.classList.remove('hidden', 'feedback-good', 'feedback-soft');
      feedback.classList.add(correct ? 'feedback-good' : 'feedback-soft');
      return new Promise((r) => setTimeout(() => {
        feedback.classList.add('hidden');
        r();
      }, 800));
    }

    let correctCount = 0;
    for (let i = 0; i < plan.length; i++) {
      setProgress(i, plan.length);
      const { item, type } = plan[i];
      const result = await App.tasks[type](item, taskMount);
      bumpScore(item.text, result.correct ? +1 : -1);
      if (result.correct) correctCount += 1;
      await showFeedback(result.correct);
    }
    setProgress(plan.length, plan.length);

    // Reward + summary.
    recordLessonResult({ correct: correctCount, total: plan.length, levelId });
    renderRewardChoice(taskMount, pickRewardChoices(plan), correctCount, plan.length);
  }

  /* ---------- Velká výzva (challenge lesson, 8/8 unlocks next level) ---------- */
  async function renderChallenge(mount) {
    const { levelId } = get().settings;
    const nextId = nextLevelId(levelId);
    if (!nextId || isUnlocked(nextId)) { App.nav('onboarding'); return; }
    const nextLevel = getLevel(nextId);
    const plan = buildChallengePlan(nextId, 8);

    const counter = el('div', { class: 'progress-counter' });
    const progress = el('div', { class: 'progress' });
    const progressFill = el('div', { class: 'progress-fill progress-fill-challenge' });
    progress.appendChild(progressFill);
    const taskMount = el('div', { class: 'task-mount' });
    const feedback = el('div', { class: 'feedback hidden', 'aria-live': 'polite' });

    mount.appendChild(el('section', { class: 'screen lesson challenge' }, [
      el('div', { class: 'lesson-header' }, [
        el('div', { class: 'challenge-title', text: `🏆 Velká výzva: ${nextLevel.label}` }),
        counter, progress
      ]),
      taskMount,
      feedback
    ]));

    function setProgress(i, total) {
      progressFill.style.width = ((i / total) * 100) + '%';
      counter.textContent = `Úkol ${Math.min(i + 1, total)} z ${total} — vše musí být napoprvé!`;
    }

    let correctCount = 0;
    for (let i = 0; i < plan.length; i++) {
      setProgress(i, plan.length);
      const { item, type } = plan[i];
      const result = await App.tasks[type](item, taskMount);
      bumpScore(item.text, result.correct ? +1 : -1);
      if (result.correct) correctCount += 1;
    }
    setProgress(plan.length, plan.length);

    clear(taskMount);
    if (correctCount === plan.length) {
      unlockLevel(nextId, levelId);
      setSettings({ levelId: nextId });
      speak(`Výborně! Odemkl jsi úroveň ${nextLevel.label}.`);
      taskMount.appendChild(el('div', { class: 'result-card challenge-won' }, [
        el('h2', { text: `🏆 ${plan.length} z ${plan.length}! Nová úroveň odemčena!` }),
        el('p', { class: 'challenge-unlock', text: `${nextLevel.badge || ''} ${nextLevel.label}` }),
        el('p', { class: 'result-summary', text: `Získáváš odznak za úroveň ${getLevel(levelId).label} 🏅` }),
        el('div', { class: 'cta-row' }, [
          el('button', {
            class: 'btn btn-primary btn-huge',
            on: { click: () => App.nav('lesson') }
          }, [el('span', { text: 'První lekce nové úrovně ▶' })])
        ])
      ]));
    } else {
      taskMount.appendChild(el('div', { class: 'result-card' }, [
        el('h2', { text: `Ještě trénujeme! 🌱` }),
        el('p', { class: 'result-summary',
          text: `Měl/a jsi ${correctCount} z ${plan.length} napoprvé. Výzva potřebuje všech ${plan.length}. Zkus to zase brzy!` }),
        el('div', { class: 'cta-row' }, [
          el('button', {
            class: 'btn btn-primary btn-large',
            on: { click: () => App.nav('lesson') }
          }, [el('span', { text: 'Trénovat dál ▶' })]),
          el('button', {
            class: 'btn btn-ghost btn-large',
            on: { click: () => App.nav('challenge') }
          }, [el('span', { text: 'Zkusit znovu 🏆' })])
        ])
      ]));
    }
  }

  /* ---------- stories: library + reader ---------- */
  function renderStoryLibrary(mount) {
    const zoo = get().zoo;
    const screen = el('section', { class: 'screen stories' }, [
      el('h1', { text: 'Čtenář příběhů 👑' }),
      el('p', { class: 'lead', text: 'Příběh se odemkne, když má zvíře ve své ZOO.' })
    ]);

    const grid = el('div', { class: 'story-grid' });
    STORIES.forEach((story) => {
      const animal = getAnimal(story.animalId);
      const owned = zoo.includes(story.animalId);
      const read = isStoryRead(story.id);
      const tile = el('button', {
        class: 'story-tile' + (owned ? '' : ' story-tile-locked'),
        on: {
          click: () => {
            if (owned) App.nav('story', { storyId: story.id });
            else speak(`Nejdřív získej zvíře ${animal ? animal.name : ''}.`);
          }
        }
      }, [
        animal ? el('img', { src: animalImg(animal.id), alt: '' }) : null,
        el('span', { class: 'story-title', text: owned ? story.title : '???' }),
        el('span', { class: 'story-state', text: owned ? (read ? 'Přečteno ✓' : 'Číst ▶') : `🔒 ${animal ? animal.name : ''}` })
      ]);
      grid.appendChild(tile);
    });
    screen.appendChild(grid);
    mount.appendChild(screen);
  }

  function renderStory(mount, ctx) {
    const story = getStory(ctx.storyId);
    if (!story) { App.nav('lesson'); return; }
    const animal = getAnimal(story.animalId);
    let idx = 0;

    const sentenceEl = el('div', { class: 'big-word story-sentence', lang: 'cs' });
    const counter = el('p', { class: 'story-counter' });
    const nextBtn = el('button', { class: 'btn btn-primary btn-large' }, [el('span', { text: 'Další ▶' })]);

    function paint() {
      if (idx < story.sentences.length) {
        sentenceEl.textContent = story.sentences[idx];
        counter.textContent = `Věta ${idx + 1} z ${story.sentences.length}`;
      } else {
        markStoryRead(story.id);
        sentenceEl.textContent = 'Přečteno! 🎉';
        counter.textContent = 'Celý příběh je tvůj.';
        nextBtn.replaceChildren(el('span', { text: 'Další příběh 📚' }));
        nextBtn.onclick = () => App.nav('lesson');
        speak('Výborně! Přečetl jsi celý příběh.');
        return;
      }
    }
    nextBtn.onclick = () => { idx += 1; paint(); };

    mount.appendChild(el('section', { class: 'screen story-screen' }, [
      el('button', { class: 'btn-link', on: { click: () => App.nav('lesson') } },
        [el('span', { text: '← zpět na příběhy' })]),
      el('div', { class: 'story-card' }, [
        animal ? el('img', { class: 'story-hero', src: animalImg(animal.id), alt: animal.name }) : null,
        el('h1', { text: story.title }),
        sentenceEl,
        counter,
        el('p', { class: 'task-hint task-hint-soft', text: 'Čteš ty — nahlas a sám.' }),
        el('div', { class: 'cta-row' }, [nextBtn])
      ])
    ]));
    paint();
  }

  /* Reward screen: the child picks one of two animals — either a new one
   * for the zoo or growing an owned one by a star. With a single candidate
   * (almost everything collected) the reward applies immediately. */
  function renderRewardChoice(mount, choices, correct, total) {
    if (choices.length < 2) {
      renderLessonResult(mount, applyReward(choices[0]), correct, total);
      return;
    }

    clear(mount);
    const grid = el('div', { class: 'reward-choice-grid' });
    choices.forEach((choice) => {
      const isNew = choice.kind === 'new';
      const card = el('button', {
        class: 'reward-choice-card',
        on: {
          click: () => {
            speak(choice.animal.name);
            renderLessonResult(mount, applyReward(choice), correct, total);
          }
        }
      }, [
        el('img', { src: animalImg(choice.animal.id), alt: choice.animal.name }),
        el('span', { class: 'reward-choice-name', text: choice.animal.name }),
        isNew
          ? el('span', { class: 'reward-kind reward-kind-new', text: 'Nové zvíře!' })
          : el('span', { class: 'reward-kind' }, [
              starRow(choice.stars, 'star-row star-row-small'),
              el('span', { text: ' → ' }),
              starRow(choice.stars + 1, 'star-row star-row-small')
            ])
      ]);
      grid.appendChild(card);
    });

    mount.appendChild(el('div', { class: 'result-card' }, [
      el('h2', { text: 'Vyber si odměnu! 🎁' }),
      el('p', { class: 'result-summary',
        text: `Lekce dokončena: ${correct} z ${total} správně na první pokus.` }),
      grid
    ]));
  }

  function applyReward(choice) {
    if (choice.kind === 'new') {
      addToZoo(choice.animal.id);
      return Object.assign({}, choice, { stars: starsOf(choice.animal.id) });
    }
    if (choice.kind === 'star') {
      return Object.assign({}, choice, { stars: bumpStars(choice.animal.id) });
    }
    return choice; // bonus — no state change
  }

  function renderLessonResult(mount, reward, correct, total) {
    clear(mount);
    const animal = reward.animal;
    const headline = reward.kind === 'new'
      ? `Získal/a jsi nové zvíře: ${animal.name}!`
      : reward.kind === 'star'
        ? `${animal.name} má teď ${reward.stars} ⭐!`
        : `Bonus! ${animal.name} ti zamává znovu.`;

    const card = el('div', { class: 'result-card' }, [
      el('h2', { text: headline }),
      el('div', { class: 'result-illustration' }, [
        el('img', { src: animalImg(animal.id), alt: animal.name })
      ]),
      reward.stars
        ? el('p', { class: 'result-stage' }, [
            starRow(reward.stars),
            el('span', { class: 'stage-label', text: ` ${stageName(reward.stars)}` })
          ])
        : null,
      el('p', { class: 'result-fact', text: animal.fact }),
      el('p', { class: 'result-summary',
        text: `Lekce dokončena: ${correct} z ${total} správně na první pokus.` }),
      el('div', { class: 'cta-row' }, [
        el('button', {
          class: 'btn btn-secondary btn-large',
          on: { click: () => speak(animal.name) }
        }, [el('span', { text: '🔊 Vyslov' })]),
        el('button', {
          class: 'btn btn-primary btn-large',
          on: { click: () => App.nav('zoo') }
        }, [el('span', { text: 'Do ZOO 🦒' })]),
        el('button', {
          class: 'btn btn-ghost btn-large',
          on: { click: () => App.nav('onboarding') }
        }, [el('span', { text: 'Další lekce ↻' })])
      ])
    ]);
    mount.appendChild(card);
  }

  /* ---------- zoo ---------- */
  function renderZoo(mount) {
    const zoo = get().zoo;
    const screen = el('section', { class: 'screen zoo' }, [
      el('h1', { text: 'Moje ZOO' }),
      el('p', { class: 'lead',
        text: zoo.length
          ? `Máš ${zoo.length} z ${ANIMALS.length} zvířátek. Klepni na zvíře a poslechni si jeho jméno.`
          : 'Tvá ZOO je zatím prázdná. Dokonči lekci a získej první zvíře!' })
    ]);

    const grid = el('div', { class: 'zoo-grid' });
    ANIMALS.forEach((animal) => {
      const owned = zoo.includes(animal.id);
      const stars = starsOf(animal.id);
      const tile = el('button', {
        class: 'zoo-tile' + (owned ? stageClass(stars) : ' zoo-tile-locked'),
        on: {
          click: () => {
            if (owned) App.nav('animal', { animalId: animal.id });
            else speak('Toto zvíře ještě nemáš.');
          }
        }
      }, [
        el('div', { class: 'zoo-img-wrap' }, [
          el('img', { src: animalImg(animal.id), alt: animal.name }),
          owned ? stageBadge(stars) : null
        ]),
        el('div', { class: 'zoo-name', text: owned ? animal.name : '?' }),
        owned ? el('div', { class: 'zoo-stars' }, [starRow(starsOf(animal.id), 'star-row star-row-small')]) : null
      ]);
      grid.appendChild(tile);
    });
    screen.appendChild(grid);

    screen.appendChild(el('div', { class: 'cta-row' }, [
      el('button', {
        class: 'btn btn-primary btn-large',
        on: { click: () => App.nav('onboarding') }
      }, [el('span', { text: 'Nová lekce ▶' })])
    ]));

    mount.appendChild(screen);
  }

  /* ---------- animal detail ---------- */
  function renderAnimal(mount, ctx) {
    const animal = getAnimal(ctx.animalId);
    if (!animal) { App.nav('zoo'); return; }

    const stars = starsOf(animal.id);
    const card = el('section', { class: 'screen animal-screen' }, [
      el('button', {
        class: 'btn-link',
        on: { click: () => App.nav('zoo') }
      }, [el('span', { text: '← zpět do ZOO' })]),

      el('div', { class: 'animal-card' + stageClass(stars) }, [
        el('div', { class: 'animal-illustration' }, [
          el('img', { src: animalImg(animal.id), alt: animal.name }),
          stageBadge(stars)
        ]),
        el('h1', { class: 'animal-name', text: animal.name }),
        el('p', { class: 'animal-stage' }, [
          starRow(starsOf(animal.id)),
          el('span', { class: 'stage-label', text: ` ${stageName(starsOf(animal.id))}` })
        ]),
        el('p', { class: 'animal-fact', text: animal.fact }),
        el('div', { class: 'cta-row' }, [
          el('button', {
            class: 'btn btn-primary btn-large',
            on: { click: () => speak(animal.name) }
          }, [el('span', { text: '🔊 Vyslov jméno' })])
        ]),
        speechAvailable() ? null : el('p', { class: 'speech-fallback',
          text: 'Tip: prohlížeč zatím nemá český hlas. Zkus to v Chrome nebo Edge.' })
      ])
    ]);

    mount.appendChild(card);
  }

  /* ---------- progress (parent panel) ---------- */
  function renderProgress(mount) {
    const state = get();
    const accuracy = state.stats.tasksTotal === 0
      ? '—'
      : Math.round(100 * state.stats.tasksCorrect / state.stats.tasksTotal) + ' %';

    const overview = el('div', { class: 'progress-cards' }, [
      statCard('Dokončené lekce', state.stats.lessonsCompleted),
      statCard('Správně na první pokus', state.stats.tasksCorrect),
      statCard('Úspěšnost', accuracy),
      statCard('Zvířátka v ZOO', `${state.zoo.length} / ${ANIMALS.length}`),
      statCard('Odznaky', state.badges.length
        ? state.badges.map((id) => getLevel(id).badge || '🏅').join(' ')
        : '—'),
      statCard('Přečtené příběhy', `${Object.keys(state.storiesRead || {}).length} / ${STORIES.length || '–'}`)
    ]);

    const screen = el('section', { class: 'screen progress-screen' }, [
      el('h1', { text: 'Pokrok' }),
      el('p', { class: 'lead', text: 'Přehled pro rodiče. Vše se ukládá pouze do prohlížeče.' }),
      overview
    ]);

    /* Per-level sections are collapsed by default: the summary row shows
     * only the mastery percentage (average knowledge score across the
     * level's items). Expanding reveals the per-word detail rows. */
    LEVELS.forEach((lvl) => {
      if (!lvl.items || !lvl.items.length) return; // story level has no word rows
      const scores = lvl.items.map((item) => scoreOf(item.text));
      const pct = Math.round(100 * scores.reduce((a, b) => a + b, 0) / (lvl.items.length * SCORE_MAX));
      const mastered = scores.filter((s) => s >= SCORE_MAX).length;

      const list = el('div', { class: 'word-rows' });
      lvl.items.forEach((item) => {
        const score = scoreOf(item.text);
        const row = el('div', { class: 'word-row' }, [
          el('div', { class: 'word-row-text', text: item.text }),
          el('div', { class: 'word-row-bar' }, [
            ...Array.from({ length: SCORE_MAX }, (_, i) =>
              el('span', { class: 'pip' + (i < score ? ' pip-on' : '') }))
          ]),
          el('div', { class: 'word-row-score', text: `${score}/${SCORE_MAX}` })
        ]);
        list.appendChild(row);
      });

      const barFill = el('div', { class: 'level-bar-fill' });
      barFill.style.width = pct + '%';

      const section = el('details', { class: 'level-progress' }, [
        el('summary', { class: 'level-summary' }, [
          el('h2', { text: `${lvl.badge || ''} ${lvl.label}${hasBadge(lvl.id) ? ' 🏅' : ''}${isUnlocked(lvl.id) ? '' : ' (zamčeno)'}` }),
          el('span', { class: 'level-bar', 'aria-hidden': 'true' }, [barFill]),
          el('span', { class: 'level-pct', text: pct + ' %' }),
          el('span', { class: 'level-chevron', 'aria-hidden': 'true', text: '▾' })
        ]),
        el('div', { class: 'level-detail' }, [
          el('p', { class: 'level-detail-meta', text: `Plně zvládnuto ${mastered} z ${lvl.items.length}.` }),
          list
        ])
      ]);
      screen.appendChild(section);
    });

    screen.appendChild(el('div', { class: 'cta-row' }, [
      el('button', {
        class: 'btn btn-warning btn-large',
        on: {
          click: () => {
            if (confirm('Opravdu chceš smazat veškerý pokrok? Tato akce je nevratná.')) {
              reset();
              App.nav('onboarding');
            }
          }
        }
      }, [el('span', { text: 'Resetovat pokrok' })])
    ]));

    mount.appendChild(screen);
  }
  function statCard(label, value) {
    return el('div', { class: 'stat-card' }, [
      el('div', { class: 'stat-value', text: String(value) }),
      el('div', { class: 'stat-label', text: label })
    ]);
  }

  /* ---------- public ---------- */
  App.views = {
    renderOnboarding,
    renderLesson,
    renderChallenge,
    renderStory,
    renderZoo,
    renderAnimal,
    renderProgress
  };
})();
