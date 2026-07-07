/* Czech pronunciation: bundled audio clips first, Web Speech API fallback.
 *
 * Layer 1 — bundled clips. scripts/generate-voice.mjs pre-generates one
 * audio file per speakable text (assets/voice/ + manifest.json mapping the
 * exact text string to its file). If the manifest loads and contains the
 * text, we play the file — same voice on every device, works offline, no
 * dependency on the OS having a cs-CZ voice.
 *
 * Layer 2 — Web Speech API. Anything not in the manifest (or when the
 * manifest is absent, e.g. voice assets not generated yet or file://
 * without fetch) falls back to the platform TTS exactly as before. If that
 * is also unavailable we fail soft: speak() returns false and the UI keeps
 * working silently.
 *
 * Notes on robustness:
 *   - Chrome occasionally leaves speechSynthesis in a paused state after many
 *     cancel/speak cycles; we always call resume() defensively.
 *   - Some browsers never fire onend/onended (autoplay policies, voice load
 *     races). speakAndWait therefore uses a tight, length-adaptive safety
 *     timeout so the UI cannot hang.
 */
(function () {
  const App = window.App || (window.App = {});

  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;

  /* ---------- layer 1: bundled clips ---------- */
  const VOICE_BASE = 'assets/voice/';
  let voiceFiles = null; // { "<exact text>": "<file>" } once the manifest loads

  if (typeof fetch === 'function') {
    fetch(VOICE_BASE + 'manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (doc && doc.files && Object.keys(doc.files).length) {
          voiceFiles = doc.files;
          console.info(`[ReadingZOO] bundled voice: ${Object.keys(voiceFiles).length} clips (${doc.voice || '?'})`);
        }
      })
      .catch(() => { /* no bundled voice — Web Speech fallback stays active */ });
  }

  // One shared element so a new utterance always replaces the previous one.
  const player = (typeof Audio === 'function') ? new Audio() : null;

  function clipFor(text) {
    return (voiceFiles && player && voiceFiles[text]) ? VOICE_BASE + voiceFiles[text] : null;
  }

  function stopAll() {
    if (player && !player.paused) player.pause();
    if (synth) {
      try { synth.cancel(); } catch (_) { /* ignore */ }
    }
  }

  /* ---------- layer 2: Web Speech ---------- */
  function bestCzechVoice() {
    if (!synth) return null;
    const voices = synth.getVoices() || [];
    return voices.find((v) => /cs(-|_)?CZ/i.test(v.lang))
        || voices.find((v) => /^cs/i.test(v.lang))
        || null;
  }

  function isAvailable() {
    return !!voiceFiles || !!synth;
  }

  function makeUtterance(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'cs-CZ';
    utter.rate = 0.9;
    utter.pitch = 1.05;
    const voice = bestCzechVoice();
    if (voice) utter.voice = voice;
    return utter;
  }

  // Adaptive safety timeout: enough for the longest plausible MVP sentence,
  // never so long the UI feels stuck. ~280 ms per word at rate 0.9 + tail.
  function safetyMs(text) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length || 1;
    const est = 600 + words * 320;
    return Math.max(1200, Math.min(4500, est));
  }

  function speak(text) {
    if (!text) return false;
    stopAll();

    const clip = clipFor(text);
    if (clip) {
      player.src = clip;
      // play() may reject under autoplay policies — fail soft like synth.
      player.play().catch(() => {});
      return true;
    }

    if (!synth) return false;
    try {
      // Chrome sometimes leaves synth paused after cancel(); nudge it.
      if (typeof synth.resume === 'function') synth.resume();
      synth.speak(makeUtterance(text));
      return true;
    } catch (err) {
      console.warn('Speech failed', err);
      return false;
    }
  }

  /* Returns a Promise that resolves with `{ status }` once the utterance
   * finishes (or on error / safety timeout), so callers can wait before
   * advancing to the next task.
   *
   *   status:
   *     'skipped' — no clip and no synth / empty text (resolves immediately)
   *     'played'  — clip or utterance finished normally
   *     'error'   — playback/synthesis error
   *     'timeout' — safety timeout expired before the end event
   */
  function speakAndWait(text) {
    return new Promise(function (resolve) {
      if (!text) { resolve({ status: 'skipped' }); return; }
      stopAll();

      let done = false;
      let timer = null;
      const finish = function (status, cleanup) {
        if (done) return;
        done = true;
        if (timer) { clearTimeout(timer); timer = null; }
        if (cleanup) cleanup();
        resolve({ status: status });
      };

      const clip = clipFor(text);
      if (clip) {
        const onEnded = function () { finish('played', cleanup); };
        const onError = function () { finish('error', cleanup); };
        const cleanup = function () {
          player.removeEventListener('ended', onEnded);
          player.removeEventListener('error', onError);
        };
        player.addEventListener('ended', onEnded);
        player.addEventListener('error', onError);
        // Clips are pre-recorded, so their duration is bounded; keep a
        // generous ceiling in case metadata never loads.
        timer = setTimeout(function () { finish('timeout', cleanup); }, safetyMs(text) + 2000);
        player.src = clip;
        player.play().catch(function () { finish('error', cleanup); });
        return;
      }

      if (!synth) { resolve({ status: 'skipped' }); return; }

      let utter;
      try {
        if (typeof synth.resume === 'function') synth.resume();
        utter = makeUtterance(text);
      } catch (err) {
        console.warn('Speech setup failed', err);
        finish('error');
        return;
      }

      utter.onend = function () { finish('played'); };
      utter.onerror = function () { finish('error'); };

      timer = setTimeout(function () { finish('timeout'); }, safetyMs(text));

      try {
        synth.speak(utter);
      } catch (err) {
        console.warn('Speech speak() threw', err);
        finish('error');
      }
    });
  }

  // Some browsers populate voices asynchronously; nudge them once on load.
  if (synth && typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = () => { /* triggers cache */ };
  }

  App.speech = { isAvailable, speak, speakAndWait };
})();
