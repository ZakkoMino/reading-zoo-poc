/* Screens (views).
 *
 * Single-page app, no framework. There are exactly five screens we paint:
 *   onboarding  — level + length picker
 *   lesson      — runs through the task plan, then shows the reward summary
 *   zoo         — grid of earned animals
 *   animal      — detail card with pronunciation + fact
 *   progress    — simple "parent" panel: stats, a practice recommendation
 *                 and per-word knowledge scores
 *
 * Every screen renders into the shared #screen mount. The top header is
 * static; only the body content swaps. This keeps the DOM small and easy
 * to inspect, which was an explicit goal of the brief.
 */
(function () {
  const App = window.App || (window.App = {});
  const { LEVELS, LESSON_LENGTHS, ANIMALS, getLevel, getAnimal, animalImg, availableThemes, levelHasThemes } = App.data;
  const { get, setSettings, scoreOf, SCORE_MAX, addToZoo, bumpScore, recordLessonResult, reset } = App.state;
  const { buildLessonPlan, pickReward, buildRecommendation } = App.lessons;
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

  /* ---------- onboarding ---------- */
  function renderOnboarding(mount) {
    const settings = get().settings;

    const levelChips = el('div', { class: 'chips' });
    LEVELS.forEach((lvl) => {
      const chip = el('button', {
        class: 'chip' + (lvl.id === settings.levelId ? ' chip-selected' : ''),
        on: {
          click: () => {
            setSettings({ levelId: lvl.id });
            App.nav('onboarding');
          }
        }
      }, [
        el('div', { class: 'chip-title', text: lvl.label }),
        el('div', { class: 'chip-hint', text: lvl.hint })
      ]);
      levelChips.appendChild(chip);
    });

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
    const reward = pickReward(plan);
    if (reward.isNew) addToZoo(reward.animal.id);
    recordLessonResult({ correct: correctCount, total: plan.length });

    renderLessonResult(taskMount, reward, correctCount, plan.length);
  }

  function renderLessonResult(mount, reward, correct, total) {
    clear(mount);
    const animal = reward.animal;
    const headline = reward.isNew
      ? `Získal/a jsi nové zvíře: ${animal.name}!`
      : `Bonus! ${animal.name} ti zamává znovu.`;

    const card = el('div', { class: 'result-card' }, [
      el('h2', { text: headline }),
      el('div', { class: 'result-illustration' }, [
        el('img', { src: animalImg(animal.id), alt: animal.name })
      ]),
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
      const tile = el('button', {
        class: 'zoo-tile' + (owned ? '' : ' zoo-tile-locked'),
        on: {
          click: () => {
            if (owned) App.nav('animal', { animalId: animal.id });
            else speak('Toto zvíře ještě nemáš.');
          }
        }
      }, [
        el('div', { class: 'zoo-img-wrap' }, [
          el('img', { src: animalImg(animal.id), alt: animal.name })
        ]),
        el('div', { class: 'zoo-name', text: owned ? animal.name : '?' })
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

    const card = el('section', { class: 'screen animal-screen' }, [
      el('button', {
        class: 'btn-link',
        on: { click: () => App.nav('zoo') }
      }, [el('span', { text: '← zpět do ZOO' })]),

      el('div', { class: 'animal-card' }, [
        el('div', { class: 'animal-illustration' }, [
          el('img', { src: animalImg(animal.id), alt: animal.name })
        ]),
        el('h1', { class: 'animal-name', text: animal.name }),
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
      statCard('Zvířátka v ZOO', `${state.zoo.length} / ${ANIMALS.length}`)
    ]);

    const rec = buildRecommendation();
    const recommendation = el('div', { class: 'recommendation' }, [
      el('h2', { text: 'Doporučení' }),
      el('p', { text: recommendationText(rec) })
    ]);

    const screen = el('section', { class: 'screen progress-screen' }, [
      el('h1', { text: 'Pokrok' }),
      el('p', { class: 'lead', text: 'Přehled pro rodiče. Vše se ukládá pouze do prohlížeče.' }),
      overview,
      recommendation
    ]);

    LEVELS.forEach((lvl) => {
      const section = el('div', { class: 'level-progress' }, [
        el('h2', { text: lvl.label })
      ]);
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
      section.appendChild(list);
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
  function recommendationText(rec) {
    const name = (lvl) => `„${lvl.label}“`;
    if (!rec.attempted) {
      return `Z úrovně ${name(rec.level)} zatím nejsou žádná data. Dokončete pár lekcí a doporučení se objeví.`;
    }
    if (rec.mastered) {
      return rec.nextLevel
        ? `Úroveň ${name(rec.level)} vypadá zvládnutá. Doporučujeme přejít na úroveň ${name(rec.nextLevel)}.`
        : `Úroveň ${name(rec.level)} vypadá zvládnutá — a je to ta nejtěžší. Skvělá práce!`;
    }
    if (rec.weakItems.length) {
      return `Doporučujeme zůstat na úrovni ${name(rec.level)} a zopakovat: ${rec.weakItems.join(', ')}.`;
    }
    return `Pokračujte v úrovni ${name(rec.level)} — vyzkoušeno ${rec.attempted} z ${rec.total} položek.`;
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
    renderZoo,
    renderAnimal,
    renderProgress
  };
})();
