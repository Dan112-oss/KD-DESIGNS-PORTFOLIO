/* ==========================================================
   MAIN.JS
   Purpose: Entry point. Initializes global behaviors once the
   DOM is ready. Feature logic itself lives in its own file
   (e.g. nav.js) and is called from here.
============================================================= */

document.addEventListener('DOMContentLoaded', function () {
  if (window.KD && typeof KD.initNav === 'function') {
    KD.initNav();
  }

  if (window.KD && typeof KD.initPortfolio === 'function') {
    KD.initPortfolio();
  }

  if (window.KD && typeof KD.initTestimonials === 'function') {
    KD.initTestimonials();
  }

  if (window.KD && typeof KD.initContact === 'function') {
    KD.initContact();
  }

  if (window.KD && typeof KD.initTheme === 'function') {
    KD.initTheme();
  }

  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // Phase 2: animated hero grid + headline decode
  if (window.KD && typeof KD.initHeroTech === 'function') {
    KD.initHeroTech();
  }

  // Phase 3: animated cursor (mouse devices only)
  if (window.KD && typeof KD.initCursor === 'function') {
    KD.initCursor();
  }

  // Runs last: reveal animations and the Portfolio tilt effect
  // need the Portfolio/Testimonials cards to already exist in
  // the DOM, which the two init calls above just created.
  if (window.KD && typeof KD.initAnimations === 'function') {
    KD.initAnimations();
  }

  // Phase 4: process lines, counters (after the reveal animations)
  if (window.KD && typeof KD.initTechMotion === 'function') {
    KD.initTechMotion();
  }

  // Phase 6: scroll progress bar + corner readout
  if (window.KD && typeof KD.initHud === 'function') {
    KD.initHud();
  }
});
