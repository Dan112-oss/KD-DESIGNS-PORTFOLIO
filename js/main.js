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
});
