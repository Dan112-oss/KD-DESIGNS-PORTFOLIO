/* ==========================================================
   CURSOR.JS  (Phase 3)
   Purpose: Animated custom cursor: a small orange dot that
   tracks the mouse exactly, plus a ring that trails behind it.
   The ring reacts to what's under the pointer:
     - links / buttons / filters  -> grows and glows
     - project images             -> becomes a "View" bubble
     - service / process / quote cards -> gently grows
     - text fields / dropdowns    -> custom cursor hides and the
       normal one returns, so typing feels normal
     - mouse down                 -> shrinks slightly
   Only runs on devices with a real mouse, and not when the
   visitor has reduced-motion on. Everywhere else the normal
   cursor stays. Colors/sizes live in css/tech.css.
============================================================= */

window.KD = window.KD || {};

KD.initCursor = function initCursor() {
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduce) return;

  const root = document.documentElement;

  // Build the cursor elements (no extra markup needed in index.html)
  const dot = document.createElement('div');
  dot.className = 'kd-cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'kd-cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.setAttribute('data-state', 'default');
  ring.innerHTML =
    '<span class="kd-cursor-ring__bg"></span>' +
    '<span class="kd-cursor-ring__label">View</span>';

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  const FIELD = 'input, textarea, select, [contenteditable="true"]';
  const LINK = 'a, button, [role="button"], summary, label[for], .filter-btn, .filter-chip';
  const CARD = '.service-card, .process-step, .testimonial-card';

  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  let started = false;

  function setState(state) {
    if (ring.getAttribute('data-state') !== state) {
      ring.setAttribute('data-state', state);
    }
    const hidden = state === 'hidden';
    dot.classList.toggle('is-hidden', hidden);
    root.classList.toggle('kd-cursor-hidden', hidden);
  }

  function stateFor(target) {
    if (!target || !target.closest) return 'default';
    if (target.closest(FIELD)) return 'hidden';
    if (target.closest('.project-card__link')) return 'link';
    if (target.closest('.project-card__image-wrap')) return 'view';
    if (target.closest(LINK)) return 'link';
    if (target.closest(CARD)) return 'card';
    return 'default';
  }

  document.addEventListener('mousemove', function (event) {
    mx = event.clientX;
    my = event.clientY;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';

    if (!started) {
      started = true;
      rx = mx;
      ry = my;
      root.classList.add('kd-cursor-on');
      dot.classList.add('is-visible');
      ring.classList.add('is-visible');
    }
  });

  document.addEventListener('mouseover', function (event) {
    setState(stateFor(event.target));
  });

  document.addEventListener('mousedown', function () {
    ring.setAttribute('data-pressed', '');
  });

  document.addEventListener('mouseup', function () {
    ring.removeAttribute('data-pressed');
  });

  document.documentElement.addEventListener('mouseleave', function () {
    dot.classList.remove('is-visible');
    ring.classList.remove('is-visible');
  });

  document.documentElement.addEventListener('mouseenter', function () {
    if (!started) return;
    dot.classList.add('is-visible');
    ring.classList.add('is-visible');
  });

  // The "View" bubble sits on the project image, so make a click
  // there open the card's link, as long as it points somewhere real
  // (placeholder '#' links are ignored).
  document.addEventListener('click', function (event) {
    const wrap = event.target.closest && event.target.closest('.project-card__image-wrap');
    if (!wrap) return;
    const card = wrap.closest('.project-card');
    const link = card && card.querySelector('.project-card__link');
    const href = link && link.getAttribute('href');
    if (href && href !== '#') link.click();
  });

  // Ring trails the dot with a smooth ease
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
};
