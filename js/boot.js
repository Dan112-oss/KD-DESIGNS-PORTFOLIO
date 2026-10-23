/* ==========================================================
   BOOT.JS  (Phase 6)
   Purpose: A short terminal-style "boot" screen the first time
   someone opens the site in a browser session: lines type out,
   a progress bar fills to 100%, then the screen slides away and
   the hero animates in.
   - Shows once per session (not on every page refresh or return)
   - Skipped for reduced-motion visitors
   - Click, tap or press any key to skip
   - Failsafes in index.html (inline script) and tech.css make sure
     the screen can never get stuck if something goes wrong
   Runs on its own (no init call needed). It fires a
   "kd:boot-done" event when finished, which hero-tech.js waits for.
============================================================= */

(function () {
  var root = document.documentElement;
  var boot = document.getElementById('kdBoot');
  if (!boot) return;

  // Not a first visit, or reduced-motion: remove the screen entirely
  if (!root.classList.contains('kd-booting')) {
    boot.parentNode.removeChild(boot);
    return;
  }

  var log = document.getElementById('kdBootLog');
  var fill = document.getElementById('kdBootFill');
  var pct = document.getElementById('kdBootPct');

  var DURATION = 2200; // total time for the bar to fill (ms)

  // Each line appears (and types out) once the bar passes `at`
  var lines = [
    { at: 0.00, text: '> KD.DESIGNS // visual identity + web design' },
    { at: 0.22, text: '> loading interface ............ ok' },
    { at: 0.52, text: '> mounting brand palette #D77001 -> #F3A42C' },
    { at: 0.82, text: '> ready' }
  ];
  var shown = 0;
  var finished = false;
  var start = performance.now();

  function typeLine(text, isLast) {
    var row = document.createElement('span');
    row.className = 'kd-boot__line';
    log.appendChild(row);

    var i = 0;
    (function step() {
      i += 2;
      row.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(step, 14);
      } else if (isLast) {
        row.classList.add('is-last');
      }
    })();
  }

  function leave() {
    if (finished) return;
    finished = true;

    try { sessionStorage.setItem('kd-booted', '1'); } catch (e) { /* private mode */ }

    boot.classList.add('is-leaving');
    root.classList.remove('kd-booting');
    window.dispatchEvent(new Event('kd:boot-done'));

    setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 900);
  }

  function frame(now) {
    if (finished) return;

    var t = Math.min((now - start) / DURATION, 1);
    // ease-out: quick start, slower finish
    var eased = 1 - Math.pow(1 - t, 2.2);

    fill.style.transform = 'scaleX(' + eased + ')';
    pct.textContent = String(Math.round(eased * 100)).padStart(3, '0') + '%';

    while (shown < lines.length && eased >= lines[shown].at) {
      typeLine(lines[shown].text, shown === lines.length - 1);
      shown++;
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      setTimeout(leave, 350);
    }
  }

  requestAnimationFrame(frame);

  // Skip with click, tap or any key
  boot.addEventListener('click', leave);
  window.addEventListener('keydown', leave, { once: true });
  boot.addEventListener('touchstart', leave, { passive: true });
})();
