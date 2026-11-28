// Light and dark theme. Loaded in <head> so the right theme is set before anything draws (no flash).
// Follows the system setting until the visitor picks one with the toggle; their pick is remembered.
(function () {
  var root = document.documentElement;
  var system = matchMedia('(prefers-color-scheme: dark)');
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}

  function apply(theme) {
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111111' : '#ffffff';
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  apply(saved || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', function (e) { if (!saved) apply(e.matches ? 'dark' : 'light'); });

  var icons = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
    '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>';

  // Adds the toggle to a nav. Case study pages call this after they build their nav.
  window.addThemeToggle = function (nav) {
    if (!nav || nav.querySelector('.theme-toggle')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-toggle';
    b.innerHTML = icons;
    b.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      saved = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      apply(next);
    });
    nav.append(b);
    apply(root.dataset.theme);
  };
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.topnav nav').forEach(window.addThemeToggle);
  });
})();
