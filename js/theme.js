/* ==========================================================
   THEME.JS
   Purpose: Light/dark theme toggle. The actual theme value is
   set on <html data-theme="..."> by a tiny inline script in
   index.html's <head> (before first paint, to avoid a flash of
   the wrong theme) — this file only handles the toggle button,
   persisting the choice, and swapping theme-aware logo images.
   All color changes themselves happen in CSS via variables.css.
============================================================= */

window.KD = window.KD || {};

KD.initTheme = function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const logos = document.querySelectorAll('.theme-logo');

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function updateLogos(theme) {
    logos.forEach(function (img) {
      const nextSrc = theme === 'dark' ? img.dataset.darkSrc : img.dataset.lightSrc;
      if (nextSrc && img.getAttribute('src') !== nextSrc) {
        img.setAttribute('src', nextSrc);
      }
    });
  }

  function updateToggleLabel(theme) {
    if (!toggle) return;
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kd-theme', theme);
    updateLogos(theme);
    updateToggleLabel(theme);
  }

  // Sync logos/label to whatever the inline head script already set
  updateLogos(currentTheme());
  updateToggleLabel(currentTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // If the visitor hasn't chosen explicitly, follow the OS theme live
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
    if (!localStorage.getItem('kd-theme')) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
};
