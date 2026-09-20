/* ==========================================================
   NAV.JS
   Purpose: Mobile nav toggle only. Isolated here so it can be
   extended later without touching main.js.
============================================================= */

window.KD = window.KD || {};

KD.initNav = function initNav() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');

  if (!toggle || !panel) {
    return;
  }

  const links = panel.querySelectorAll('a');

  function openMenu() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close the menu once a nav link is chosen
  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape, and return focus to the toggle button
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // If the viewport grows into desktop width while the menu is
  // open, reset it so it isn't left open behind the desktop nav
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && isOpen()) {
      closeMenu();
    }
  });
};
