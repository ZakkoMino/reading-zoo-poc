# Surový výstup Grok CLI — nepovažovat všechny hypotézy za potvrzené

Vyhodnocení a opravy viz [souhrn revize](../GROK_REVIEW_2026-09-11.md).

## Review (state / cancel / audio)

Zaměřeno na regresní chyby v dodaných modulech. Testy VM nepokryjí Android ani reálné `speechSynthesis` / `Audio`.

### VYSOKÉ — `claimReward` (state.js)
**Konkrétní:** `load()` povoluje `kind: 'bonus'`, ale `claimReward` ošetřuje jen `'new'` a `'star'`. `'bonus'` projde kontrolou, `pendingReward = null`, `save()`, odměna zmizí.

Stejně `'new'`, pokud už `id` je v `zoo`: první větev se přeskočí, hvězda se nepřidá, claim se spotřebuje.

**Fix:**
```js
if (choice.kind === 'new' || choice.kind === 'bonus') {
  if (!state.zoo.includes(id)) { state.zoo.push(id); state.zooStars[id] = 1; }
  else state.zooStars[id] = Math.min(STAR_MAX, starsOf(id) + 1);
} else if (choice.kind === 'star') {
  if (!state.zoo.includes(id)) { state.zoo.push(id); state.zooStars[id] = 1; }
  else state.zooStars[id] = Math.min(STAR_MAX, starsOf(id) + 1);
} else return null;
```
`pendingReward = null` až po úspěšném udělení. Po `save() === false` claim nepotvrzovat.

### VYSOKÉ — `lifecycle.cancel` (lifecycle.js) vs `speech.stop`
**Konkrétní:** pořadí je `generation++` → timery → `cancellations.forEach` (sync `resolve({ cancelled: true })`) → **teprve potom** `App.speech.stop()`. Handler navigace, který v `then` spustí nové `speak`/`speakAndWait`, se hned umlčí.

**Fix:** nejdřív `App.speech.stop()`, pak `generation++`, pak timery a cancel callbacky.

### VYSOKÉ — `speech.stop` / `speakAndWait` (speech.js)
**Konkrétní:**
1. `removeAttribute('src')` bez `load()` — na WebView/Android často dál hraje předchozí soubor (Android netestován).
2. Po `synth.cancel()` Chrome/Android TTS často znovu `speak()` tiše zahodí (žádné `onend`/`onerror`) → watchdog `timeout` až po `max(30000, text.length * 300)`. Rodič čeká na audio, které nikdy nedorazí; status `'timeout'` není `'played'` (správně), ale UX je rozbitý.

**Fix `stop`:** `player.pause(); player.removeAttribute('src'); try { player.load(); } catch (_) {}`
**Fix TTS:** po `cancel` mluvit až v `setTimeout(0)` (případně `resume()`), `onend` ignorovat když `owner !== sequence`.

### STŘEDNÍ — `speakAndWait` vs `ready` (speech.js)
**Konkrétní:** `voiceFiles` se plní asynchronně. Volání před dokončením `fetch` jde rovnou na OS hlas, nahrávky se nepoužijí. `speak()` navíc vrací `isAvailable()` v okamžiku, kdy manifest ještě není.

**Fix:** v `speakAndWait` `await ready` (s timeoutem); `fetch` s `AbortController` (jinak `ready` visí navždy a první čtení nemá CZ nahrávky).

### STŘEDNÍ — `load` (state.js)
**Konkrétní:** `storageError` / `writeBlocked` se nastaví, ale `notifyStorage()` se nevolá. Novější `schema` hodí výjimku, paměť je `defaultState()`, zápis je blokovaný, hláška je obecná („nelze načíst“), ne „novější data“. Další akce tváří pokrok, disk se nemění.

**Fix:** po `load()` zavolat `notifyStorage()` (DOM ready); při `schema > SCHEMA` neměnit hlášku v `catch`; `reset()` u `writeBlocked` nesmí bez explicitního potvrzení smazat novější save.

### STŘEDNÍ — `checkpoint` (state.js)
**Konkrétní:** ukládá se živá reference `lesson`. Mutace `plan`/`index` mimo `checkpoint` mění objekt, který později `save()` zapíše (nebo naopak neuloží crash).

**Fix:** `state.lesson = JSON.parse(JSON.stringify(lesson))`; při `!lesson` nečíst `lesson.levelId`.

### STŘEDNÍ — `completeStory` (state.js)
**Konkrétní v kódu:** `zooStars[animalId] += 1` bez `STAR_MAX` a bez `|| 0`.
**Předpoklad:** po `load()` backfill hvězd toto skoro nenastane; po živé mutaci `get().zoo` ano → `NaN` v save.

**Fix:** `state.zooStars[animalId] = Math.min(STAR_MAX, (starsOf(animalId) || 0) + 1)`.

---

**Předpoklady, ne nález v těchto souborech:** volající `speak()` bez `await ready` / bez `lifecycle.race`; UI čte `stats.tasksCorrect` (vždy 0 z `completeLesson`) jako známku; `bumpScore` někdo ještě volá (API pořád existuje, v těchto souborech se neskóruje).

**Není bug:** `TESTING_ALL_LEVELS`, legacy `scores` jen migrace, timeout ≠ success, `race` po `cancel` nesplní původní promise jako success.

REVIEW COMPLETE
