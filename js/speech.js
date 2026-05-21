/* Czech pronunciation through Web Speech API.
 *
 * If the platform lacks speechSynthesis or has no cs-CZ voice we fail soft:
 * speak() returns false, and the UI shows the written phonetic fallback that
 * the caller renders next to the button.
 *
 * Notes on robustness:
 *   - Chrome occasionally leaves speechSynthesis in a paused state after many
 *     cancel/speak cycles; we always call resume() defensively.
 *   - Some browsers never fire onend (autoplay policies, voice load races).
 *     speakAndWait therefore uses a tight, length-adaptive safety timeout
 *     so the UI cannot hang. We also resolve immediately if synth itself
 *     reports it can't speak.
 */
(function () {
  const App = window.App || (window.App = {});

  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;

  function bestCzechVoice() {
    if (!synth) return null;
    const voices = synth.getVoices() || [];
    return voices.find((v) => /cs(-|_)?CZ/i.test(v.lang))
        || voices.find((v) => /^cs/i.test(v.lang))
        || null;
  }

  function isAvailable() {
    return !!synth;
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
    if (!synth || !text) return false;
    try {
      synth.cancel();
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
   *     'skipped' — synth unavailable / empty text (resolves immediately)
   *     'played'  — onend fired normally
   *     'error'   — onerror fired or synth.speak threw
   *     'timeout' — safety timeout expired before onend
   */
  function speakAndWait(text) {
    return new Promise(function (resolve) {
      if (!synth || !text) { resolve({ status: 'skipped' }); return; }

      let done = false;
      let timer = null;
      const finish = function (status) {
        if (done) return;
        done = true;
        if (timer) { clearTimeout(timer); timer = null; }
        resolve({ status: status });
      };

      let utter;
      try {
        synth.cancel();
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
