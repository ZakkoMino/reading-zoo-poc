/* Task type implementations.
 *
 * Each renderer signs the same contract:
 *   App.tasks.<type>(item, mountEl) -> Promise<{ correct: boolean }>
 *
 * The mount element is wiped on every call and the renderer is responsible
 * for whatever UI it wants inside it. Renderers resolve once the child has
 * either succeeded, or run out of retries (we don't gate progress on a
 * correct answer — better to keep momentum). Tasks track `tries` internally:
 * a first-attempt success counts as correct, anything beyond that counts as
 * incorrect (which feeds the knowledge score), but the child still moves on.
 *
 * Tone: never say "wrong" or "špatně". Use gentle hints ("Zkus jinou.") and
 * dim the wrong option instead of removing the child's choice.
 */
(function () {
  const App = window.App || (window.App = {});
  const { ANIMALS, animalImg, getAnimal } = App.data;
  const { speak } = App.speech;

  /* ---------- tiny DOM helpers ---------- */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'on') {
          for (const ev in attrs.on) n.addEventListener(ev, attrs.on[ev]);
        } else if (k in n) n[k] = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    (kids || []).forEach((c) => c != null && n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOtherAnimals(excludeId, n) {
    const pool = ANIMALS.filter((a) => a.id !== excludeId);
    return shuffle(pool).slice(0, n);
  }

  /* The Czech alphabet we draw distractor letters from. Diacritics included
   * so distractors line up with words like "kočka" or "kůň". */
  const CZ_LETTERS = 'aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž'.split('');

  function pickDistractorLetters(correct, word, n) {
    const wordLetters = new Set(word.split(''));
    const pool = CZ_LETTERS.filter((l) => l !== correct && !wordLetters.has(l));
    return shuffle(pool).slice(0, n);
  }

  /* ---------- task: read ---------- */
  function read(item, mount) {
    return new Promise((resolve) => {
      clear(mount);
      const hasAnimal = !!item.animalId;
      const animal = hasAnimal ? getAnimal(item.animalId) : null;

      const card = el('div', { class: 'task task-read' }, [
        el('p', { class: 'task-prompt', text: 'Přečti nahlas:' }),
        el('div', { class: 'big-word', text: item.text, lang: 'cs' }),
        hasAnimal ? el('img', { class: 'task-image', src: animalImg(animal.id), alt: animal.name }) : null,
        el('p', { class: 'task-hint task-hint-soft', text: 'Tady nepředčítám — teď čteš ty.' }),
        el('div', { class: 'task-actions' }, [
          el('button', {
            class: 'btn btn-primary btn-large',
            on: { click: () => resolve({ correct: true }) }
          }, [el('span', { text: 'Přečetl/a jsem ✓' })])
        ])
      ]);

      mount.appendChild(card);
    });
  }

  /* ---------- task: match (word ↔ picture) ---------- */
  function match(item, mount) {
    return new Promise((resolve) => {
      clear(mount);
      const correct = getAnimal(item.animalId);
      const distractors = pickOtherAnimals(correct.id, 3);
      const options = shuffle([correct, ...distractors]);
      let tries = 0;

      const grid = el('div', { class: 'option-grid' });
      const hint = el('p', { class: 'task-hint hidden' });

      options.forEach((animal) => {
        const card = el('button', {
          class: 'option-card',
          'aria-label': animal.name,
          on: {
            click: () => {
              if (card.disabled) return;
              if (animal.id === correct.id) {
                card.classList.add('option-correct');
                speak(animal.name);
                setTimeout(() => resolve({ correct: tries === 0 }), 650);
              } else {
                tries += 1;
                card.classList.add('option-wrong');
                card.disabled = true;
                hint.classList.remove('hidden');
                hint.textContent = 'Zkus jinou.';
                if (tries >= 2) {
                  // Highlight the correct one so child sees the answer.
                  Array.from(grid.children).forEach((c) => {
                    if (c.dataset.id === correct.id) c.classList.add('option-correct');
                  });
                  setTimeout(() => resolve({ correct: false }), 900);
                }
              }
            }
          }
        }, [
          el('img', { src: animalImg(animal.id), alt: '' }),
          el('span', { class: 'option-label', text: animal.name })
        ]);
        card.dataset.id = animal.id;
        grid.appendChild(card);
      });

      const isSentence = / |\./.test(item.text);
      const card = el('div', { class: 'task task-match' }, [
        el('p', { class: 'task-prompt', text: isSentence ? 'Najdi obrázek k větě:' : 'Najdi obrázek pro slovo:' }),
        el('div', { class: 'big-word', text: item.text, lang: 'cs' }),
        grid,
        hint
      ]);

      mount.appendChild(card);
      setTimeout(() => speak(item.text), 200);
    });
  }

  /* ---------- task: compose (click-to-place letters / sentence words) ---------- */
  function compose(item, mount) {
    return new Promise((resolve) => {
      clear(mount);
      const target = item.text;
      const isSentence = / |\./.test(target);
      const pieces = isSentence ? target.trim().split(/\s+/) : target.split('');
      let scrambled = shuffle(pieces);
      // Avoid the (small) chance of the scramble matching the original.
      if (scrambled.join(isSentence ? ' ' : '') === target && pieces.length > 1) {
        [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
      }
      const slots = pieces.map(() => null);   // chosen piece per slot
      const tileUsed = scrambled.map(() => false);
      let tries = 0;

      const slotsRow = el('div', { class: 'slots-row' + (isSentence ? ' slots-row-words' : '') });
      const tilesRow = el('div', { class: 'tiles-row' + (isSentence ? ' tiles-row-words' : '') });
      const hint = el('p', { class: 'task-hint hidden' });

      function assembledText() {
        return slots.slice(0, pieces.length).join(isSentence ? ' ' : '');
      }

      function clearSlots() {
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] != null) {
            const t = slots[i + '_tileIdx'];
            if (t != null) tileUsed[t] = false;
            slots[i] = null;
            delete slots[i + '_tileIdx'];
          }
        }
      }

      function render() {
        clear(slotsRow);
        slots.forEach((piece, i) => {
          const slot = el('button', {
            class: 'slot' + (isSentence ? ' slot-word' : '') + (piece ? ' slot-filled' : ''),
            text: piece || '',
            'aria-label': piece ? `Vybráno ${piece}` : 'Prázdné místo',
            on: {
              click: () => {
                if (slots[i] != null) {
                  // Return the piece to its origin tile.
                  const tileIdx = slots[i + '_tileIdx'];
                  if (tileIdx != null) tileUsed[tileIdx] = false;
                  slots[i] = null;
                  delete slots[i + '_tileIdx'];
                  render();
                }
              }
            }
          });
          slotsRow.appendChild(slot);
        });

        clear(tilesRow);
        scrambled.forEach((piece, i) => {
          const tile = el('button', {
            class: 'tile' + (isSentence ? ' tile-word' : '') + (tileUsed[i] ? ' tile-used' : ''),
            text: piece,
            disabled: tileUsed[i],
            on: {
              click: () => {
                if (tileUsed[i]) return;
                const firstEmpty = slots.findIndex((s) => s == null);
                if (firstEmpty === -1) return;
                slots[firstEmpty] = piece;
                slots[firstEmpty + '_tileIdx'] = i;
                tileUsed[i] = true;
                render();
                maybeCheck();
              }
            }
          });
          tilesRow.appendChild(tile);
        });
      }

      function maybeCheck() {
        if (slots.some((s) => s == null)) return;
        const assembled = assembledText();
        if (assembled === target) {
          Array.from(slotsRow.children).forEach((c) => c.classList.add('slot-correct'));
          speak(target);
          setTimeout(() => resolve({ correct: tries === 0 }), 700);
        } else {
          tries += 1;
          Array.from(slotsRow.children).forEach((c) => c.classList.add('slot-wrong'));
          hint.classList.remove('hidden');
          hint.textContent = tries >= 2
            ? (isSentence ? `Správně je: ${target}` : `Správně se píše: ${target}.`)
            : 'Zkus to ještě jednou.';
          setTimeout(() => {
            clearSlots();
            render();
            if (tries >= 2) resolve({ correct: false });
          }, 900);
        }
      }

      const card = el('div', { class: 'task task-compose' }, [
        el('p', { class: 'task-prompt', text: isSentence ? 'Nejdřív si poslechni větu. Potom ji slož ze slov:' : 'Nejdřív si poslechni slovo. Potom ho slož z písmen:' }),
        el('div', { class: 'task-actions task-actions-compact' }, [
          el('button', {
            class: 'btn btn-secondary btn-icon',
            'aria-label': isSentence ? 'Přečíst větu' : 'Přečíst slovo',
            on: { click: () => speak(target) }
          }, [el('span', { text: isSentence ? '🔊 Přečíst větu' : '🔊 Přečíst slovo' })])
        ]),
        slotsRow,
        tilesRow,
        hint
      ]);

      mount.appendChild(card);
      render();
      setTimeout(() => speak(target), 250);
    });
  }

  /* ---------- task: fill (missing letter) ---------- */
  function fill(item, mount) {
    return new Promise((resolve) => {
      clear(mount);
      const word = item.text;
      // Prefer a vowel for the blank; fall back to any letter.
      const vowelIndices = [];
      const allIndices = [];
      for (let i = 0; i < word.length; i++) {
        const ch = word[i].toLowerCase();
        if ('aáeéěiíoóuúůyý'.indexOf(ch) !== -1) vowelIndices.push(i);
        allIndices.push(i);
      }
      const pickFrom = vowelIndices.length ? vowelIndices : allIndices;
      const missingIdx = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      const correct = word[missingIdx];
      const distractors = pickDistractorLetters(correct.toLowerCase(), word.toLowerCase(), 2);
      const options = shuffle([correct, ...distractors]);
      let tries = 0;
      let solved = false;

      const wordRow = el('div', { class: 'fill-word' });
      for (let i = 0; i < word.length; i++) {
        if (i === missingIdx) {
          wordRow.appendChild(el('span', { class: 'fill-blank', text: '_' }));
        } else {
          wordRow.appendChild(el('span', { class: 'fill-letter', text: word[i] }));
        }
      }

      const choices = el('div', { class: 'choice-row' });
      const hint = el('p', { class: 'task-hint hidden' });

      options.forEach((letter) => {
        const btn = el('button', {
          class: 'btn btn-choice',
          text: letter,
          on: {
            click: () => {
              if (btn.disabled || solved) return;
              if (letter === correct) {
                solved = true;
                btn.classList.add('btn-correct');
                // Reveal the answer in the slot.
                wordRow.querySelector('.fill-blank').textContent = correct;
                wordRow.querySelector('.fill-blank').classList.add('fill-blank-revealed');
                speak(word);
                setTimeout(() => resolve({ correct: tries === 0 }), 650);
              } else {
                tries += 1;
                btn.classList.add('btn-wrong');
                btn.disabled = true;
                hint.classList.remove('hidden');
                hint.textContent = tries >= 2 ? `Správné písmeno je „${correct}".` : 'Zkus jiné písmeno.';
                if (tries >= 2) {
                  // Reveal correct, then move on.
                  Array.from(choices.children).forEach((c) => {
                    if (c.textContent === correct) c.classList.add('btn-correct');
                  });
                  wordRow.querySelector('.fill-blank').textContent = correct;
                  wordRow.querySelector('.fill-blank').classList.add('fill-blank-revealed');
                  setTimeout(() => resolve({ correct: false }), 900);
                }
              }
            }
          }
        });
        choices.appendChild(btn);
      });

      const card = el('div', { class: 'task task-fill' }, [
        el('p', { class: 'task-prompt', text: 'Doplň chybějící písmeno:' }),
        wordRow,
        choices,
        hint
      ]);

      mount.appendChild(card);
    });
  }

  App.tasks = { read, match, compose, fill };
})();
