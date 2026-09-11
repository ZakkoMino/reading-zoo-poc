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
  const { LEVELS, STORIES, LESSON_LENGTH, ANIMALS, getLevel, getAnimal, getStory, animalImg, availableThemes, levelHasThemes, nextLevelId } = App.data;
  const { get, setSettings, starsOf, STAR_MAX, reset, isUnlocked, hasBadge, isStoryRead } = App.state;
  const { buildLessonPlan, pickRewardChoices } = App.lessons;
  const { speak, isAvailable: speechAvailable } = App.speech;
  const setTimeout = App.lifecycle.later;

  /* ---------- DOM helpers (same minimal kit as tasks.js) ---------- */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'on') for (const ev in attrs.on) n.addEventListener(ev, App.lifecycle.guard(attrs.on[ev]));
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
      el('p', { class: 'task-hint', text: 'Testovací verze: všechny úrovně jsou otevřené. Na začátku vybírá a pomáhá rodič.' }),
      el('button', { class: 'btn btn-primary btn-large', on: { click: () => App.nav('lesson') } },
        [el('span', { text: get().pendingReward ? 'Vyzvednout odměnu 🎁' : get().lesson ? 'Pokračovat v lekci ▶' : 'Začít lekci ▶' })]),


      el('h2', { text: '1. Co budeme dnes číst?' }),
      levelChips,

      showThemes ? el('h2', { text: '2. O čem dnes?' }) : null,
      showThemes ? themeChips : null,

      el('p', { class: 'pedagogy' }, [
        el('strong', { text: 'Tip pro rodiče: ' }),
        document.createTextNode('Nejprve dítě čte samo, potom si poslechne vzor a s vámi porovná čtení. Aplikace čtení nehodnotí ani nenahrává; ukládá jen procvičování a odměny.')
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
    const owner = App.lifecycle.token();
    const pending = get().pendingReward;
    if (pending && pending.choices.every((c) => c && ['new', 'star', 'bonus'].includes(c.kind) && c.animal && getAnimal(c.animal.id))) {
      renderRewardChoice(mount, pending.choices.map((c) => ({ ...c, animal: getAnimal(c.animal.id) })), 0, pending.total);
      return;
    }
    const { levelId } = get().settings;
    // The story level has no tasks — it opens the story library instead.
    if (getLevel(levelId).kind === 'story') {
      renderStoryLibrary(mount);
      return;
    }
    const saved = get().lesson;
    const valid = saved && saved.levelId === levelId && saved.plan.length === LESSON_LENGTH
      && saved.plan.every((step) => step && step.item && App.tasks[step.type]
        && getLevel(levelId).items.some((item) => item.text === step.item.text
          && (item.kind || getLevel(levelId).kind) === step.item.kind
          && App.lessons.allowedTasksFor(item, getLevel(levelId).kind).includes(step.type)));
    const plan = valid ? saved.plan.map((step) => ({ type: step.type,
      item: Object.assign({ kind: getLevel(levelId).kind }, getLevel(levelId).items.find((item) => item.text === step.item.text)) }))
      : buildLessonPlan(levelId, LESSON_LENGTH);
    const startIndex = valid ? saved.index : 0;
    App.state.checkpoint({ levelId, plan, index: startIndex, correctCount: 0 });

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

    for (let i = startIndex; i < plan.length; i++) {
      setProgress(i, plan.length);
      const { item, type } = plan[i];
      const result = await App.tasks[type](item, taskMount);
      if (!App.lifecycle.active(owner) || result.cancelled) return;
      App.state.checkpoint({ levelId, plan, index: i + 1, correctCount: 0 }, item.text);
      await App.lifecycle.race(showFeedback(true));
      if (!App.lifecycle.active(owner)) return;
    }
    setProgress(plan.length, plan.length);

    // Reward + summary.
    const choices = pickRewardChoices(plan);
    App.state.completeLesson(choices, plan.length, levelId);
    renderRewardChoice(taskMount, choices, 0, plan.length);
  }

  /* ---------- Velká výzva (challenge lesson, 8/8 unlocks next level) ---------- */
  async function renderChallenge(mount) {
    // Production progression will follow practice and a parent-selected start.
    App.nav('onboarding');
  }

  /* ---------- stories: library + reader ---------- */
  /* Tier 1 (short) unlocks by owning the animal; tier 2 (long) by growing
   * it to TIER2_STARS — so the star system gates real content, not just
   * cosmetics. Answering the comprehension question adds a star (once per
   * story), which in turn opens the longer story: read → grow → read more. */
  const TIER2_STARS = 3;

  function storyUnlocked(story) {
    const owned = get().zoo.includes(story.animalId);
    if (story.tier === 2) return starsOf(story.animalId) >= TIER2_STARS;
    return owned;
  }

  function renderStoryLibrary(mount) {
    const zoo = get().zoo;
    const screen = el('section', { class: 'screen stories' }, [
      el('h1', { text: 'Čtenář příběhů 👑' }),
      el('p', { class: 'lead',
        text: 'Krátký příběh se odemkne, když máš zvíře ve své ZOO. Delší příběh, když má zvíře alespoň 3 hvězdy. Na konci každého příběhu čeká otázka — správná odpověď přidá zvířeti hvězdu!' })
    ]);

    function tile(story) {
      const animal = getAnimal(story.animalId);
      const owned = zoo.includes(story.animalId);
      const unlocked = storyUnlocked(story);
      const read = isStoryRead(story.id);
      const lockText = story.tier === 2 && owned
        ? `🔒 ${animal ? animal.name : ''} · ${TIER2_STARS}★`
        : `🔒 ${animal ? animal.name : ''}`;
      return el('button', {
        class: 'story-tile' + (unlocked ? '' : ' story-tile-locked'),
        on: {
          click: () => {
            if (unlocked) App.nav('story', { storyId: story.id });
            else if (story.tier === 2 && owned) speak('Tenhle příběh se odemkne za tři hvězdy.');
            else speak(`Nejdřív získej zvíře ${animal ? animal.name : ''}.`);
          }
        }
      }, [
        animal ? el('img', { src: animalImg(animal.id), alt: '' }) : null,
        el('span', { class: 'story-title', text: unlocked ? story.title : '???' }),
        el('span', { class: 'story-state', text: unlocked ? (read ? 'Přečteno ✓' : 'Číst ▶') : lockText })
      ]);
    }

    const tier1 = STORIES.filter((s) => (s.tier || 1) === 1);
    const tier2 = STORIES.filter((s) => s.tier === 2);

    screen.appendChild(el('h2', { class: 'story-section-title', text: `Krátké příběhy (${tier1.length})` }));
    const grid1 = el('div', { class: 'story-grid' });
    tier1.forEach((s) => grid1.appendChild(tile(s)));
    screen.appendChild(grid1);

    if (tier2.length) {
      screen.appendChild(el('h2', { class: 'story-section-title', text: `Delší příběhy (${tier2.length}) · za ${TIER2_STARS} ★` }));
      const grid2 = el('div', { class: 'story-grid' });
      tier2.forEach((s) => grid2.appendChild(tile(s)));
      screen.appendChild(grid2);
    }

    mount.appendChild(screen);
  }

  function renderStory(mount, ctx) {
    const story = getStory(ctx.storyId);
    if (!story) { App.nav('lesson'); return; }
    if (!storyUnlocked(story)) { App.nav('lesson'); return; }
    const owner = App.lifecycle.token();
    let finished = false;
    const animal = getAnimal(story.animalId);
    let idx = 0;
    let tries = 0;

    const sentenceEl = el('div', { class: 'big-word story-sentence', lang: 'cs' });
    const counter = el('p', { class: 'story-counter' });
    const nextBtn = el('button', { class: 'btn btn-primary btn-large' }, [el('span', { text: 'Přečetl/a jsem — poslechnout ▶' })]);
    const readHint = el('p', { class: 'task-hint task-hint-soft', text: 'Čteš ty — nahlas a sám.' });
    const hint = el('p', { class: 'task-hint hidden' });
    const optionsGrid = el('div', { class: 'story-options hidden' });

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function paint() {
      if (idx < story.sentences.length) {
        sentenceEl.textContent = story.sentences[idx];
        counter.textContent = `Věta ${idx + 1} z ${story.sentences.length}`;
      } else if (story.question) {
        showQuestion();
      } else {
        finish(true);
      }
    }
    nextBtn.onclick = App.lifecycle.guard(async () => {
      if (nextBtn.disabled) return;
      nextBtn.disabled = true;
      parentRead.hidden = true;
      const result = await App.speech.speakAndWait(story.sentences[idx]);
      if (!App.lifecycle.active(owner)) return;
      nextBtn.disabled = false;
      if (result.status !== 'played') {
        hint.classList.remove('hidden');
        hint.textContent = 'Zvuk není dostupný. Zkus poslech znovu, nebo požádej rodiče o přečtení věty.';
        parentRead.hidden = false;
        return;
      }
      parentRead.hidden = true;
      hint.classList.add('hidden');
      idx += 1; paint();
    });
    const parentRead = el('button', { class: 'btn btn-ghost', hidden: true, on: { click: () => {
      if (nextBtn.disabled) return;
      parentRead.hidden = true; hint.classList.add('hidden'); idx += 1; paint();
    } } }, [el('span', { text: 'Větu přečetl rodič — pokračovat' })]);

    /* Comprehension check: one question, three picture answers. Same gentle
     * rules as tasks — wrong pick dims, second miss reveals the answer and
     * the child moves on either way. */
    function showQuestion() {
      counter.textContent = 'Otázka na závěr';
      sentenceEl.textContent = story.question.text;
      sentenceEl.classList.add('story-question-text');
      nextBtn.classList.add('hidden');
      readHint.classList.add('hidden');
      optionsGrid.classList.remove('hidden');

      const options = shuffle(story.question.options.map((o, i) => ({
        emoji: o.emoji, text: o.text, correct: i === story.question.correct
      })));
      options.forEach((opt) => {
        const btn = el('button', {
          class: 'story-option',
          on: {
            click: () => {
              if (btn.disabled) return;
              if (opt.correct) {
                btn.classList.add('option-correct');
                Array.from(optionsGrid.children).forEach((c) => { c.disabled = true; });
                setTimeout(() => finish(true), 700);
              } else {
                tries += 1;
                btn.classList.add('option-wrong');
                btn.disabled = true;
                hint.classList.remove('hidden');
                hint.textContent = 'Zkus jinou.';
                if (tries >= 2) {
                  Array.from(optionsGrid.children).forEach((c) => {
                    c.disabled = true;
                    if (c.dataset.correct === '1') c.classList.add('option-correct');
                  });
                  setTimeout(() => finish(false), 1100);
                }
              }
            }
          }
        }, [
          el('span', { class: 'story-option-emoji', 'aria-hidden': 'true', text: opt.emoji }),
          el('span', { class: 'story-option-label', text: opt.text })
        ]);
        btn.dataset.correct = opt.correct ? '1' : '0';
        optionsGrid.appendChild(btn);
      });
    }

    /* Star reward: a correctly answered question grows the animal by one
     * star — but only on the first completion of that story, so it can't
     * be farmed by rereading. */
    function finish(solved) {
      if (finished || !App.lifecycle.active(owner)) return;
      finished = true;
      const awarded = App.state.completeStory(story.id, animal && animal.id, solved);
      optionsGrid.classList.add('hidden');
      hint.classList.add('hidden');
      sentenceEl.classList.remove('story-question-text');

      let starLine = null;
      if (awarded) {
        const stars = starsOf(animal.id);
        starLine = `⭐ ${animal.name} má teď ${stars} ${stars >= 5 ? 'hvězd' : 'hvězdy'}!`;
      }
      sentenceEl.textContent = solved ? 'Správně! 🎉' : 'Přečteno! 🎉';
      counter.textContent = starLine || 'Celý příběh je tvůj.';
      speak('Výborně! Přečetl jsi celý příběh.');
      nextBtn.classList.remove('hidden');
      nextBtn.replaceChildren(el('span', { text: 'Další příběh 📚' }));
      nextBtn.onclick = App.lifecycle.guard(() => App.nav('lesson'));
    }

    mount.appendChild(el('section', { class: 'screen story-screen' }, [
      el('button', { class: 'btn-link', on: { click: () => App.nav('lesson') } },
        [el('span', { text: '← zpět na příběhy' })]),
      el('div', { class: 'story-card' }, [
        animal ? el('img', { class: 'story-hero', src: animalImg(animal.id), alt: animal.name }) : null,
        el('h1', { text: story.title }),
        sentenceEl,
        counter,
        optionsGrid,
        hint,
        readHint,
        el('div', { class: 'cta-row' }, [nextBtn, parentRead])
      ])
    ]));
    paint();
  }

  /* Reward screen: the child picks one of two animals — either a new one
   * for the zoo or growing an owned one by a star. With a single candidate
   * (almost everything collected) the reward applies immediately. */
  function renderRewardChoice(mount, choices, correct, total) {
    let claimed = false;
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
            if (claimed) return;
            claimed = true;
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
        text: `Lekce dokončena. Procvičeno ${total} úkolů — děkujeme za čtení!` }),
      grid
    ]));
  }

  function applyReward(choice) {
    return App.state.claimReward(choice);
  }

  function renderLessonResult(mount, reward, correct, total) {
    if (!reward) { App.nav('onboarding'); return; }
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
        text: `Lekce dokončena. Procvičeno ${total} úkolů.` }),
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
          text: 'Český hlas není dostupný. V nastavení Androidu zkontroluj převod textu na řeč a instalaci českých hlasových dat.' })
      ])
    ]);

    mount.appendChild(card);
  }

  /* ---------- progress (parent panel) ---------- */
  function renderProgress(mount) {
    const state = get();

    const overview = el('div', { class: 'progress-cards' }, [
      statCard('Dokončené lekce', state.stats.lessonsCompleted),
      statCard('Procvičené úkoly v dokončených lekcích', state.stats.tasksTotal),
      statCard('Zvířátka v ZOO', `${state.zoo.length} / ${ANIMALS.length}`),
      statCard('Odznaky', state.badges.length
        ? state.badges.map((id) => getLevel(id).badge || '🏅').join(' ')
        : '—'),
      statCard('Přečtené příběhy', `${Object.keys(state.storiesRead || {}).length} / ${STORIES.length || '–'}`)
    ]);

    const screen = el('section', { class: 'screen progress-screen' }, [
      el('h1', { text: 'Pokrok' }),
      el('p', { class: 'lead', text: 'Historie procvičování, nikoli hodnocení čtení. Vše se ukládá pouze do tohoto prohlížeče. Smazání dat prohlížeče odstraní i pokrok.' }),
      overview
    ]);

    /* Per-level sections are collapsed by default: the summary row shows
     * only the mastery percentage (average knowledge score across the
     * level's items). Expanding reveals the per-word detail rows. */
    LEVELS.forEach((lvl) => {
      if (!lvl.items || !lvl.items.length) return; // story level has no word rows
      const scores = lvl.items.map((item) => App.state.practiceOf(lvl.id, item.text));
      const mastered = scores.filter((s) => s > 0).length;
      const pct = Math.round(100 * mastered / lvl.items.length);

      const list = el('div', { class: 'word-rows' });
      lvl.items.forEach((item) => {
        const score = App.state.practiceOf(lvl.id, item.text);
        const row = el('div', { class: 'word-row' }, [
          el('div', { class: 'word-row-text', text: item.text }),
          el('div', { class: 'word-row-score', text: `${score}× procvičeno` })
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
          el('p', { class: 'level-detail-meta', text: `Alespoň jednou procvičeno ${mastered} z ${lvl.items.length}. Starší verze tyto počty nesledovala.` }),
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
