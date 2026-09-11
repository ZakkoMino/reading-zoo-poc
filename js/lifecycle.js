/* Route-owned callbacks. Leaving a screen invalidates every pending task. */
(function () {
  const App = window.App || (window.App = {});
  let generation = 0;
  const timers = new Set();
  const cancellations = new Set();
  const token = () => generation;
  const active = (value) => value === generation;
  function guard(fn) {
    const owner = token();
    return function (...args) { if (active(owner)) return fn.apply(this, args); };
  }
  function later(fn, ms) {
    const callback = guard(fn);
    const id = window.setTimeout(() => { timers.delete(id); callback(); }, ms);
    timers.add(id);
    return id;
  }
  function race(promise) {
    return new Promise((resolve, reject) => {
      const cancel = () => resolve({ cancelled: true });
      cancellations.add(cancel);
      Promise.resolve(promise).then(resolve, reject).finally(() => cancellations.delete(cancel));
    });
  }
  function cancel() {
    generation += 1;
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    cancellations.forEach((fn) => fn());
    cancellations.clear();
    if (App.speech) App.speech.stop();
  }
  App.lifecycle = { token, active, guard, later, race, cancel };
})();
