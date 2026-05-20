/* App entry: tiny router + header wiring.
 *
 * Boots after DOMContentLoaded, paints the requested screen into #screen,
 * and exposes App.nav(screen, ctx) for views to switch screens. The header
 * provides "Doma" (back to onboarding), "ZOO" and "Pokrok" — also wired
 * here so they don't have to be re-rendered with every screen.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { wireHeader(); nav('onboarding'); });
  } else {
    wireHeader();
    nav('onboarding');
  }
})();
