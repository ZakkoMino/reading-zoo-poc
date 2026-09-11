/* Bundled Czech recordings first, an explicitly Czech OS voice second.
 * No microphone, cloud synthesis or silent successful playback fallback. */
(function () {
  const App = window.App || (window.App = {});
  const synth = window.speechSynthesis || null;
  const player = typeof Audio === 'function' ? new Audio() : null;
  const VOICE_BASE = 'assets/voice/';
  let voiceFiles = {};
  let pending = null;
  let sequence = 0;
  const manifestController = typeof AbortController === 'function' ? new AbortController() : null;
  const manifestTimeout = manifestController ? setTimeout(() => manifestController.abort(), 4000) : null;
  const ready = typeof fetch === 'function'
    ? fetch(VOICE_BASE + 'manifest.json', manifestController ? { signal: manifestController.signal } : {})
      .then((res) => res.ok ? res.json() : null)
      .then((doc) => {
        if (doc && doc.voice !== 'stub' && doc.files && typeof doc.files === 'object') {
          voiceFiles = Object.fromEntries(Object.entries(doc.files).filter(([, file]) =>
            typeof file === 'string' && /^[a-zA-Z0-9_-]+\.(mp3|wav|ogg)$/.test(file)));
        }
      }).catch(() => {}).finally(() => clearTimeout(manifestTimeout)) : Promise.resolve();

  function bestCzechVoice() {
    return synth && (synth.getVoices() || []).find((v) => /^cs(?:[-_]|$)/i.test(v.lang));
  }
  function isAvailable() { return !!(player && Object.keys(voiceFiles).length) || !!bestCzechVoice(); }
  function stop() {
    sequence += 1;
    if (pending) pending('cancelled');
    if (player) { player.pause(); player.removeAttribute('src'); if (player.load) player.load(); }
    if (synth) { try { synth.cancel(); } catch (_) {} }
  }
  function speakAndWait(text) {
    stop();
    const owner = sequence;
    return new Promise((resolve) => {
      let done = false;
      let timer;
      let cleanup = () => {};
      function finish(status) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cleanup();
        if (pending === finish) pending = null;
        if (status === 'timeout') {
          if (player) player.pause();
          if (synth) { try { synth.cancel(); } catch (_) {} }
        }
        resolve({ status });
      }
      pending = finish;
      if (!text) { finish('skipped'); return; }
      // A watchdog means FAILURE, never completed reading. Advance only on end.
      timer = setTimeout(() => finish('timeout'), Math.max(30000, text.length * 300));
      function systemVoice() {
        cleanup();
        cleanup = () => {};
        if (done || owner !== sequence) return;
        const voice = bestCzechVoice();
        if (!voice) { finish('unavailable'); return; }
        try {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'cs-CZ'; utter.voice = voice; utter.rate = 0.9; utter.pitch = 1;
          utter.onend = () => finish('played');
          utter.onerror = () => finish('error');
          cleanup = () => { utter.onend = null; utter.onerror = null; };
          if (synth.resume) synth.resume();
          synth.speak(utter);
        } catch (_) { finish('error'); }
      }
      const file = voiceFiles[text];
      if (!player || !file) { systemVoice(); return; }
      const ended = () => finish('played');
      let fellBack = false;
      const failed = () => {
        if (fellBack || done || owner !== sequence) return;
        fellBack = true;
        player.pause();
        systemVoice();
      };
      player.addEventListener('ended', ended);
      player.addEventListener('error', failed);
      cleanup = () => { player.removeEventListener('ended', ended); player.removeEventListener('error', failed); };
      player.src = VOICE_BASE + file;
      try { Promise.resolve(player.play()).catch(failed); } catch (_) { failed(); }
    });
  }
  function speak(text) {
    if (!text) return false;
    speakAndWait(text);
    return isAvailable();
  }
  App.speech = { ready, isAvailable, speak, speakAndWait, stop };
})();
