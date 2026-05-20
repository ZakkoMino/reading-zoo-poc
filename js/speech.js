/* Czech pronunciation through Web Speech API.
 *
 * If the platform lacks speechSynthesis or has no cs-CZ voice we fail soft:
 * speak() returns false, and the UI shows the written phonetic fallback that
 * the caller renders next to the button.
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

  function speak(text) {
    if (!synth || !text) return false;
    try {
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'cs-CZ';
      utter.rate = 0.9;
      utter.pitch = 1.05;
      const voice = bestCzechVoice();
      if (voice) utter.voice = voice;
      synth.speak(utter);
      return true;
    } catch (err) {
      console.warn('Speech failed', err);
      return false;
    }
  }

  // Some browsers populate voices asynchronously; nudge them once on load.
  if (synth && typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = () => { /* triggers cache */ };
  }

  App.speech = { isAvailable, speak };
})();
