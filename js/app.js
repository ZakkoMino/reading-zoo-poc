/* App entry: tiny router + header wiring.
 *
 * Boots after DOMContentLoaded, awaits the async data load (with inline
 * fallback if the seed JSON can't be fetched), then paints onboarding.
 * Exposes App.nav(screen, ctx) for views to switch screens.
 */
(function () {
  const App = window.App || (window.App = {});

  function $(sel) { return document.querySelector(sel); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function setActiveNav(screen) {
    document.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.classList.toggle('nav-active', btn.dataset.nav === screen);
    });
  }

  function nav(screen, ctx) {
    const mount = $('#screen');
    clear(mount);
    setActiveNav(screen);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    switch (screen) {
      case 'onboarding': return App.views.renderOnboarding(mount);
      case 'lesson':     return App.views.renderLesson(mount);
      case 'challenge':  return App.views.renderChallenge(mount);
      case 'story':      return App.views.renderStory(mount, ctx || {});
      case 'zoo':        return App.views.renderZoo(mount);
      case 'animal':     return App.views.renderAnimal(mount, ctx || {});
      case 'progress':   return App.views.renderProgress(mount);
      default:           return App.views.renderOnboarding(mount);
    }
  }

  App.nav = nav;

  function wireHeader() {
    document.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => nav(btn.dataset.nav));
    });
  }

  function paintDiagnostics() {
    const node = document.getElementById('data-status');
    if (!node) return;
    const stats = (App.data && App.data.getStats) ? App.data.getStats() : null;
    if (!stats) return;
    const sourceLabel = stats.source === 'seed' ? 'seed' : 'inline (fallback)';
    node.textContent = `Data: ${sourceLabel} · ${stats.words} slov · ${stats.animals} zvířat`;
    node.dataset.source = stats.source;
  }

  async function boot() {
    wireHeader();
    if (App.data && App.data.ready && typeof App.data.ready.then === 'function') {
      try { await App.data.ready; } catch (_) { /* fallback already applied */ }
    }
    paintDiagnostics();
    nav('onboarding');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
