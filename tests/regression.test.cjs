const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, El, read, flush, vm } = require('./helpers.cjs');

test('legacy malformed values normalize; level testing access remains explicit', async () => {
  const f = await fixture(JSON.stringify({ zoo: null, scores: { pes: 'oops' }, stats: { tasksTotal: 'oops', lessonsByLevel: null } }));
  assert.equal(f.App.state.bumpScore('pes', 1), 1);
  assert.equal(f.App.state.get().stats.tasksTotal, 0);
  assert.equal(f.App.state.get().unlockedLevels.length, 8);
  assert.equal(f.App.state.TESTING_ALL_LEVELS, true);
});
test('broken JSON is preserved and valid backup is recovered', async () => {
  const storage = new Map([['reading-zoo-state', '{broken'], ['reading-zoo-state-backup', JSON.stringify({ zoo: ['pes'] })]]);
  const f = await fixture(null, { storage });
  assert.equal(f.App.state.get().zoo[0], 'pes');
  assert.equal(storage.get('reading-zoo-state-recovery'), '{broken');
  f.App.state.notifyStorage(); assert.equal(f.warning.hidden, false);
});
test('future schema is not overwritten by an older application', async () => {
  const raw = JSON.stringify({ schema: 100, zoo: ['pes'] });
  const f = await fixture(raw); f.App.state.setSettings({ levelId: 'words1' });
  assert.equal(f.storage.get('reading-zoo-state'), raw);
  assert.equal(f.warning.hidden, false);
});
test('quota failure is visible rather than silently claiming persistence', async () => {
  const f = await fixture(null, { failSave: true });
  f.App.state.setSettings({ levelId: 'words1' });
  assert.match(f.warning.textContent, /NEUKLÁDÁ/);
  assert.equal(f.warning.hidden, false);
});
test('practice is counted separately by level, with no negative grade', async () => {
  const f = await fixture();
  f.App.state.checkpoint({ levelId: 'syllables', plan: [], index: 0, correctCount: 0 }, 'ty');
  assert.equal(f.App.state.practiceOf('syllables', 'ty'), 1);
  assert.equal(f.App.state.practiceOf('words1', 'ty'), 0);
});
test('pending reward survives reload and is consumed exactly once', async () => {
  const f = await fixture(); const animal = f.App.data.ANIMALS[0];
  const choice = { kind: 'new', animal };
  f.App.state.completeLesson([choice], 8, 'letters');
  const g = await fixture(null, { storage: f.storage });
  assert.equal(g.App.state.get().pendingReward.total, 8);
  assert.ok(g.App.state.claimReward(choice));
  assert.equal(g.App.state.claimReward(choice), null);
  assert.equal(g.App.state.starsOf(animal.id), 1);
  const h = await fixture(null, { storage: g.storage });
  assert.equal(h.App.state.get().pendingReward, null);
  assert.equal(h.App.state.get().stats.lessonsCompleted, 1);
});
test('failed story then successful retry awards one star; reread does not farm', async () => {
  const f = await fixture(); const s = f.App.data.STORIES[0];
  f.App.state.addToZoo(s.animalId);
  assert.equal(f.App.state.completeStory(s.id, s.animalId, false), false);
  assert.equal(f.App.state.isStoryRead(s.id), true);
  assert.equal(f.App.state.completeStory(s.id, s.animalId, true), true);
  assert.equal(f.App.state.starsOf(s.animalId), 2);
  assert.equal(f.App.state.completeStory(s.id, s.animalId, true), false);
});
test('read waits for correct audio; absent audio offers explicit parent fallback', async () => {
  const f = await fixture(); f.App.speech.speakAndWait = async () => ({ status: 'unavailable' });
  f.run('js/tasks.js');
  const m = new El('main'); let done = false;
  const p = f.App.tasks.read({ text: 'oko', kind: 'word' }, m).then(() => { done = true; });
  m.querySelector('button').click(); await flush();
  assert.equal(done, false);
  const parent = m.querySelectorAll('button').find((b) => b.textContent.includes('Vzor přečetl rodič'));
  assert.equal(parent.hidden, false); parent.click(); await p;
});
test('match success then rapid wrong click preserves first result', async () => {
  const f = await fixture(); const m = new El('main');
  const p = f.App.tasks.match({ text: 'pes', animalId: 'pes' }, m);
  const buttons = m.querySelectorAll('.option-card');
  buttons.find((b) => b.dataset.id === 'pes').click();
  buttons.find((b) => b.dataset.id !== 'pes').click();
  await f.tick(); assert.equal((await p).correct, true);
});
test('letter matching locks all choices on completion', async () => {
  const f = await fixture(); const m = new El('main');
  const p = f.App.tasks.matchLetter({ text: 'P', animalIds: ['pes'] }, m);
  const buttons = m.querySelectorAll('.option-card');
  buttons.find((b) => b.dataset.id === 'pes').click();
  assert.ok(buttons.every((b) => b.disabled)); await f.tick(); assert.equal((await p).correct, true);
});
test('fill target is unambiguous even without audio for all vocabulary masks', async () => {
  const f = await fixture();
  for (const level of f.App.data.LEVELS.filter((l) => l.kind !== 'story')) for (const item of level.items) {
    const m = new El('main'); const p = f.App.tasks.fill(item, m);
    assert.equal(m.querySelector('.fill-model').textContent, item.text);
    f.App.lifecycle.cancel(); await p;
  }
});
test('two wrong fill choices lock the task during feedback', async () => {
  const f = await fixture(); const m = new El('main'); const p = f.App.tasks.fill({ text: 'les' }, m);
  const choices = m.querySelectorAll('.btn-choice');
  choices.filter((b) => b.textContent !== 'e').forEach((b) => b.click());
  choices.find((b) => b.textContent === 'e').click();
  await f.tick(); assert.equal((await p).correct, false);
});
test('navigation cancels delayed match result and old controls', async () => {
  const f = await fixture(); const m = new El('main'); const p = f.App.tasks.match({ text: 'pes', animalId: 'pes' }, m);
  m.querySelectorAll('.option-card').find((b) => b.dataset.id === 'pes').click();
  f.App.nav('zoo'); await f.tick(); assert.equal((await p).cancelled, true);
});
test('reset while task promise resolves cannot write old practice', async () => {
  const f = await fixture(); let resolve;
  for (const key of Object.keys(f.App.tasks)) f.App.tasks[key] = () => new Promise((r) => { resolve = r; });
  const p = f.App.views.renderLesson(f.screen);
  f.App.state.reset(); resolve({ correct: true }); await p;
  assert.equal(Object.keys(f.App.state.get().practice).length, 0);
  assert.equal(f.App.state.get().lesson, null);
});
test('lesson checkpoint resumes remaining tasks without recounting completed ones', async () => {
  const f = await fixture(); const plan = f.App.lessons.buildLessonPlan('letters', 8);
  f.App.state.checkpoint({ levelId: 'letters', plan, index: 7, correctCount: 0 });
  const g = await fixture(null, { storage: f.storage }); let calls = 0;
  for (const key of Object.keys(g.App.tasks)) g.App.tasks[key] = async () => { calls++; return { correct: true }; };
  const p = g.App.views.renderLesson(g.screen); await flush(); await g.tick(); await p;
  assert.equal(calls, 1); assert.equal(g.App.state.get().stats.lessonsCompleted, 1);
  assert.equal(g.App.state.get().lesson, null);
});
test('parent overview contains practice but no accuracy or mastery claims', async () => {
  const f = await fixture(); f.App.views.renderProgress(f.screen);
  assert.match(f.screen.textContent, /Historie procvičování/);
  assert.doesNotMatch(f.screen.textContent, /Úspěšnost|Plně zvládnuto|Správně na první/);
});
test('planner generates varied complete lessons on every practice level', async () => {
  const f = await fixture();
  for (const level of f.App.data.LEVELS.filter((l) => l.kind !== 'story')) for (let i = 0; i < 100; i++) {
    const plan = f.App.lessons.buildLessonPlan(level.id, 8);
    assert.equal(plan.length, 8); assert.equal(new Set(plan.map((s) => s.item.text)).size, 8);
    assert.ok(plan.every((s, j) => typeof f.App.tasks[s.type] === 'function' && (!j || s.type !== plan[j - 1].type)));
  }
});
function swFixture(fetchResponse, cacheResponse) {
  const handlers = {}, deleted = [];
  const c = { self: { addEventListener: (e, f) => handlers[e] = f, clients: { claim: async () => {} },
    location: { origin: 'https://example.test', href: 'https://example.test/zoo/sw.js' } },
    caches: { keys: async () => ['reading-zoo-v3', 'reading-zoo-v5', 'other-app-cache'], delete: async (n) => deleted.push(n),
      open: async () => ({ match: async () => cacheResponse, put: async () => {} }) },
    fetch: async () => fetchResponse, URL, console, AbortController, setTimeout, clearTimeout };
  vm.createContext(c); vm.runInContext(read('sw.js'), c); return { handlers, deleted };
}
test('worker only deletes its own outdated caches', async () => {
  const f = swFixture(); let p; f.handlers.activate({ waitUntil: (v) => p = v }); await p;
  assert.deepEqual(f.deleted, ['reading-zoo-v3']);
});
test('HTTP 503 returns cached non-core content', async () => {
  const f = swFixture({ status: 503, ok: false }, { status: 200, cached: true }); let p;
  f.handlers.fetch({ request: { method: 'GET', url: 'https://example.test/zoo/extra.json', mode: 'cors' }, respondWith: (v) => p = v });
  assert.equal((await p).cached, true);
});
test('worker ignores sibling applications', () => {
  const f = swFixture(); let intercepted = false;
  f.handlers.fetch({ request: { method: 'GET', url: 'https://example.test/other/app.js' }, respondWith: () => intercepted = true });
  assert.equal(intercepted, false);
});
test('speech requires a Czech voice, not just an API', async () => {
  const f = await fixture(); f.c.window.speechSynthesis = { getVoices: () => [{ lang: 'en-US' }], cancel() {} };
  f.run('js/speech.js'); assert.equal(f.App.speech.isAvailable(), false);
  assert.equal((await f.App.speech.speakAndWait('les')).status, 'unavailable');
});
test('speech resolves on end, cancellation or failure, never early success', async () => {
  const f = await fixture(); let utter;
  f.c.SpeechSynthesisUtterance = function (text) { this.text = text; };
  f.c.window.speechSynthesis = { getVoices: () => [{ lang: 'cs-CZ' }], cancel() {}, speak: (u) => utter = u };
  f.run('js/speech.js');
  let p = f.App.speech.speakAndWait('Dlouhá věta.'); assert.equal(f.App.speech.isAvailable(), true);
  assert.ok([...f.timers.values()].every((t) => t.ms >= 30000)); utter.onend(); assert.equal((await p).status, 'played');
  p = f.App.speech.speakAndWait('les'); f.App.speech.stop(); assert.equal((await p).status, 'cancelled');
  p = f.App.speech.speakAndWait('los'); await f.tick(); assert.equal((await p).status, 'timeout');
});

test('checkpoint owns a copy, not a mutable caller reference', async () => {
  const f = await fixture(); const lesson = { levelId: 'letters', plan: [], index: 0, correctCount: 0 };
  f.App.state.checkpoint(lesson); lesson.index = 5;
  assert.equal(f.App.state.get().lesson.index, 0);
});
test('bonus at completed zoo is an intentional celebration, not an extra star', async () => {
  const f = await fixture(); const animal = f.App.data.ANIMALS[0];
  f.App.state.addToZoo(animal.id); for (let i = 0; i < 4; i++) f.App.state.bumpStars(animal.id);
  const choice = { kind: 'bonus', animal, stars: 5 };
  f.App.state.completeLesson([choice], 8, 'words1');
  assert.equal(f.App.state.claimReward(choice).kind, 'bonus');
  assert.equal(f.App.state.starsOf(animal.id), 5);
  assert.equal(f.App.state.get().pendingReward, null);
});
test('cancellation callbacks run after synchronous stop, not before it', async () => {
  const f = await fixture(); const events = [];
  f.App.speech.stop = () => events.push('stop');
  const p = f.App.lifecycle.race(new Promise(() => {})).then(() => events.push('new audio'));
  f.App.lifecycle.cancel(); await p;
  assert.deepEqual(events, ['stop', 'new audio']);
});
test('compose cannot change completed word during its feedback timer', async () => {
  const f = await fixture(); const m = new El('main'); const p = f.App.tasks.compose({ text: 'pes', kind: 'word' }, m);
  for (const letter of 'pes') m.querySelectorAll('.tile').find((b) => b.textContent === letter && !b.disabled).click();
  m.querySelector('.slot').click();
  assert.equal(m.querySelectorAll('.slot').map((b) => b.textContent).join(''), 'pes');
  await f.tick(); assert.equal((await p).correct, true);
});
test('story UI waits for audio and restores the same sentence on failure', async () => {
  const f = await fixture(); const story = f.App.data.STORIES[0]; f.App.state.addToZoo(story.animalId);
  f.App.speech.speakAndWait = async () => ({ status: 'unavailable' });
  f.App.views.renderStory(f.screen, { storyId: story.id });
  const next = f.screen.querySelectorAll('button').find((b) => b.textContent.includes('poslechnout'));
  next.click(); await flush();
  assert.equal(f.screen.querySelector('.story-sentence').textContent, story.sentences[0]);
  const parent = f.screen.querySelectorAll('button').find((b) => b.textContent.includes('Větu přečetl rodič'));
  assert.equal(parent.hidden, false); parent.click();
  assert.equal(f.screen.querySelector('.story-sentence').textContent, story.sentences[1]);
});

test('clip playback failure falls back to a real Czech system voice', async () => {
  const f = await fixture(); let utter;
  f.c.fetch = async () => ({ ok: true, json: async () => ({ voice: 'test', files: { les: 'abc.mp3' } }) });
  f.c.Audio = class extends El { constructor() { super('audio'); } pause() {} load() {} play() { return Promise.reject(Error('decode')); } };
  f.c.SpeechSynthesisUtterance = function () {};
  f.c.window.speechSynthesis = { getVoices: () => [{ lang: 'cs-CZ' }], cancel() {}, speak: (u) => utter = u };
  f.run('js/speech.js'); await f.App.speech.ready;
  const p = f.App.speech.speakAndWait('les'); await flush();
  assert.ok(utter); utter.onend(); assert.equal((await p).status, 'played');
});
test('stub voice manifest cannot masquerade as Czech recordings', async () => {
  const f = await fixture(); f.c.fetch = async () => ({ ok: true, json: async () => ({ voice: 'stub', files: { les: 'abc.wav' } }) });
  f.c.Audio = class extends El { constructor() { super('audio'); } pause() {} load() {} };
  f.run('js/speech.js'); await f.App.speech.ready;
  assert.equal(f.App.speech.isAvailable(), false);
  assert.equal((await f.App.speech.speakAndWait('les')).status, 'unavailable');
});
test('completed checkpoint becomes one reward even after reload before selection', async () => {
  const f = await fixture(); const plan = f.App.lessons.buildLessonPlan('letters', 8);
  f.App.state.checkpoint({ levelId: 'letters', plan, index: 8, correctCount: 0 });
  await f.App.views.renderLesson(f.screen);
  assert.equal(f.App.state.get().stats.lessonsCompleted, 1);
  const g = await fixture(null, { storage: f.storage }); await g.App.views.renderLesson(g.screen);
  assert.equal(g.App.state.get().stats.lessonsCompleted, 1);
  const choices = g.screen.querySelectorAll('.reward-choice-card');
  choices[0].click(); choices[1]?.click();
  assert.equal(g.App.state.get().zoo.length, 1);
});
test('compose sentence locks a completed word until moving to the next one', async () => {
  const f = await fixture(); const m = new El('main'); const p = f.App.tasks.compose({ text: 'Pes jí.', kind: 'sentence' }, m);
  for (const letter of 'pes') m.querySelectorAll('.tile').find((b) => b.textContent === letter && !b.disabled).click();
  m.querySelector('.slot').click();
  await f.tick();
  for (const letter of 'jí') m.querySelectorAll('.tile').find((b) => b.textContent === letter && !b.disabled).click();
  await f.tick(); await f.tick(); assert.equal((await p).correct, true);
});
test('malformed pending rewards and checkpoints are discarded without a crash', async () => {
  const f = await fixture(JSON.stringify({ lesson: { plan: [null], index: -1 }, pendingReward: { choices: [null], total: 8 } }));
  assert.equal(f.App.state.get().lesson, null); assert.equal(f.App.state.get().pendingReward, null);
  f.App.views.renderOnboarding(f.screen); assert.match(f.screen.textContent, /Začít lekci/);
});
