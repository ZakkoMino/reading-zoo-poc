const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
class El {
  constructor(tag) {
    Object.assign(this, { tagName: tag, children: [], dataset: {}, style: {}, attrs: {}, events: {}, className: '', _text: '', disabled: false, hidden: false });
    this.classList = {
      add: (...x) => { this.className = [...new Set([...this.className.split(' '), ...x])].join(' '); },
      remove: (...x) => { this.className = this.className.split(' ').filter((v) => !x.includes(v)).join(' '); },
      contains: (x) => this.className.split(' ').includes(x),
      toggle: (x, on) => on ? this.classList.add(x) : this.classList.remove(x)
    };
  }
  appendChild(x) { this.children.push(x); return x; }
  removeChild(x) { this.children.splice(this.children.indexOf(x), 1); }
  get firstChild() { return this.children[0]; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(x) { this._text = String(x); this.children = []; }
  addEventListener(e, f) { (this.events[e] ??= []).push(f); }
  removeEventListener(e, f) { this.events[e] = (this.events[e] || []).filter((v) => v !== f); }
  setAttribute(k, v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  replaceChildren(...xs) { this.children = xs; this._text = ''; }
  querySelectorAll(s) {
    const all = [];
    const visit = (n) => { for (const c of n.children) {
      if (s[0] === '.' ? c.classList.contains(s.slice(1)) : c.tagName === s) all.push(c);
      visit(c);
    } };
    visit(this); return all;
  }
  querySelector(s) { return this.querySelectorAll(s)[0] ?? null; }
  click() { if (this.disabled) return; this.onclick?.(); for (const f of this.events.click || []) f({}); }
  getContext() { return { beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, clearRect() {} }; }
  setPointerCapture() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 280, height: 280 }; }
}
async function flush() { for (let i = 0; i < 16; i++) await Promise.resolve(); }
async function fixture(raw = null, options = {}) {
  const storage = options.storage || new Map(raw === null ? [] : [['reading-zoo-state', raw]]);
  const timers = new Map(); let serial = 0;
  const warning = new El('p'); const screen = new El('main');
  const c = {
    window: {}, console: { log() {}, info() {}, warn() {} },
    localStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => {
      if (options.failSave) throw Error('QuotaExceededError'); storage.set(k, v);
    } },
    fetch: async (url) => ({ ok: true, json: async () => JSON.parse(read(url)) }),
    document: {
      createElement: (t) => new El(t), createTextNode: (t) => { const e = new El('#text'); e.textContent = t; return e; },
      getElementById: (id) => id === 'storage-status' ? warning : null,
      querySelector: () => screen, querySelectorAll: () => [], readyState: 'loading', addEventListener() {}
    },
    setTimeout: (fn, ms) => { const id = ++serial; timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => timers.delete(id), confirm: () => false
  };
  Object.assign(c.window, { setTimeout: c.setTimeout, clearTimeout: c.clearTimeout, scrollTo() {} });
  vm.createContext(c);
  const run = (file) => vm.runInContext(read(file), c, { filename: file });
  run('js/data.js'); await c.window.App.data.ready;
  run('js/lifecycle.js'); run('js/state.js');
  c.window.App.speech = { speak: () => false, speakAndWait: async () => ({ status: 'played' }), isAvailable: () => false, stop() {} };
  for (const file of ['js/lessons.js', 'js/tasks.js', 'js/views.js', 'js/app.js']) run(file);
  return { App: c.window.App, c, run, storage, timers, screen, warning,
    async tick() { const batch = [...timers.values()]; timers.clear(); for (const { fn } of batch) fn(); await flush(); } };
}
module.exports = { fixture, El, read, root, flush, vm };
