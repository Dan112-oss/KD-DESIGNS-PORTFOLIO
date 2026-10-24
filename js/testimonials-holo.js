/* ==========================================================
   TESTIMONIALS-HOLO.JS  (Phase 14)
   Purpose: Turns the Testimonials into a "holographic projector":
   - The cards become glowing glass panels in a 3D cover-flow
     carousel: one card faces you, the others angle away behind it.
   - Behind them: a rotating radar with pinging blips, a light beam
     and a glowing projector base.
   - Each card has corner brackets and a "HOLO_LOG_01" tag; the
     quote re-materialises (decodes) every time a card comes forward.
   - Auto-plays every few seconds with a progress bar; pauses on
     hover/focus. Also: Prev/Next buttons, left/right arrow keys,
     swipe or drag, click a side card to bring it forward.
   - Moving the mouse shifts the 3D viewpoint a little (parallax).
   Needs at least 2 cards, otherwise it leaves the section alone.
   Reduced-motion: no auto-play, no decoding, no spinning radar,
   but the carousel still works by button, key and swipe.
   All styling is in css/tech.css (Phase 14).
============================================================= */

window.KD = window.KD || {};

KD.initTestimonialsHolo = function initTestimonialsHolo() {
  const section = document.getElementById('testimonials');
  const stage = document.getElementById('testimonialsGrid');
  if (!section || !stage) return;

  const cards = Array.prototype.slice.call(stage.querySelectorAll('.testimonial-card'));
  const n = cards.length;
  if (n < 2) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const AUTO = 6500; // ms per testimonial
  const pad = function (v) { return String(v).padStart(2, '0'); };

  let active = 0;
  let timer = null;
  let paused = false;
  let visible = false;
  let dragged = false;

  section.classList.add('testimonials--holo');
  stage.classList.add('holo-stage');
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Testimonials');
  stage.setAttribute('tabindex', '0');
  stage.style.setProperty('--auto', AUTO + 'ms');

  /* -----------------------------------------
     BACKGROUND: radar, beam, projector base
  ------------------------------------------ */
  const radar = document.createElement('div');
  radar.className = 'holo-radar';
  radar.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 7; i++) {
    const blip = document.createElement('i');
    blip.className = 'holo-blip';
    const ang = Math.random() * Math.PI * 2;
    const rad = 0.12 + Math.random() * 0.3; // fraction of the radar size
    blip.style.left = (50 + Math.cos(ang) * rad * 100).toFixed(1) + '%';
    blip.style.top = (50 + Math.sin(ang) * rad * 100).toFixed(1) + '%';
    blip.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
    radar.appendChild(blip);
  }

  const beam = document.createElement('div');
  beam.className = 'holo-beam';
  beam.setAttribute('aria-hidden', 'true');

  const base = document.createElement('div');
  base.className = 'holo-base';
  base.setAttribute('aria-hidden', 'true');

  stage.insertBefore(base, stage.firstChild);
  stage.insertBefore(beam, stage.firstChild);
  stage.insertBefore(radar, stage.firstChild);

  /* -----------------------------------------
     CARD DECORATION + remember the real quotes
  ------------------------------------------ */
  cards.forEach(function (card, i) {
    const tag = document.createElement('div');
    tag.className = 'holo-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.innerHTML = '<span>HOLO_LOG_' + pad(i + 1) + '</span><span class="holo-tag__rec">PLAYBACK</span>';
    card.insertBefore(tag, card.firstChild);

    const corners = document.createElement('span');
    corners.className = 'holo-corners';
    corners.setAttribute('aria-hidden', 'true');
    corners.innerHTML = '<i></i><i></i><i></i><i></i>';
    card.appendChild(corners);

    const quote = card.querySelector('.testimonial-card__quote');
    if (quote && !quote.children.length) {
      quote._holoFinal = quote.textContent.replace(/\s+/g, ' ').trim();
      quote.setAttribute('aria-label', quote._holoFinal);
    }

    // Tabbing to a side card brings it forward
    card.addEventListener('focus', function () { goTo(i, true); });

    // Clicking a side card brings it forward
    card.addEventListener('click', function () {
      if (dragged) return;
      if (i !== active) goTo(i, true);
    });
  });

  /* -----------------------------------------
     CONTROLS
  ------------------------------------------ */
  const controls = document.createElement('div');
  controls.className = 'holo-controls';
  controls.innerHTML =
    '<button type="button" class="holo-btn" data-dir="-1" aria-label="Previous testimonial">' +
      '<span aria-hidden="true">&larr;</span> Prev</button>' +
    '<div class="holo-meta" aria-hidden="true">' +
      '<div class="holo-count"><span class="holo-count__cur">01</span>' +
      '<span class="holo-count__sep">/</span><span>' + pad(n) + '</span></div>' +
      '<div class="holo-progress"><span></span></div>' +
    '</div>' +
    '<button type="button" class="holo-btn" data-dir="1" aria-label="Next testimonial">' +
      'Next <span aria-hidden="true">&rarr;</span></button>';
  stage.parentNode.insertBefore(controls, stage.nextSibling);

  const status = document.createElement('p');
  status.className = 'visually-hidden';
  status.setAttribute('aria-live', 'polite');
  controls.parentNode.insertBefore(status, controls.nextSibling);

  const curEl = controls.querySelector('.holo-count__cur');
  const progress = controls.querySelector('.holo-progress span');

  controls.addEventListener('click', function (event) {
    const btn = event.target.closest('.holo-btn');
    if (!btn) return;
    goTo(active + parseInt(btn.getAttribute('data-dir'), 10), true);
  });

  /* -----------------------------------------
     LAYOUT: equal card heights + stage height
  ------------------------------------------ */
  function measure() {
    cards.forEach(function (c) { c.style.height = ''; });
    let max = 0;
    cards.forEach(function (c) { max = Math.max(max, c.offsetHeight); });
    cards.forEach(function (c) { c.style.height = max + 'px'; });
    stage.style.setProperty('--holo-h', max + 'px');
  }

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });

  /* -----------------------------------------
     CORE: position every card relative to the active one
  ------------------------------------------ */
  const half = Math.floor(n / 2);

  function render() {
    cards.forEach(function (card, i) {
      let d = ((i - active + n + half) % n) - half; // -half .. +half
      if (n % 2 === 0 && d === -half) d = half;      // even counts: keep it symmetric
      const abs = Math.abs(d);

      card.style.setProperty('--d', d);
      card.style.setProperty('--abs', abs);
      card.classList.toggle('is-active', i === active);
      card.classList.toggle('is-far', abs > 2);
      card.setAttribute('tabindex', i === active ? '0' : '-1');
    });

    curEl.textContent = pad(active + 1);
  }

  /* -----------------------------------------
     Quote "re-materialise" effect (needs KD.scramble from tech-text.js)
  ------------------------------------------ */
  function materialize(card) {
    if (reduce || typeof KD.scramble !== 'function') return;
    const quote = card.querySelector('.testimonial-card__quote');
    if (!quote || !quote._holoFinal) return;

    const pool = quote._holoFinal.replace(/[^A-Za-z]/g, '');
    if (!pool) return;
    KD.scramble(quote, quote._holoFinal, { duration: 850, pool: pool });
  }

  /* -----------------------------------------
     AUTOPLAY
  ------------------------------------------ */
  function restartProgress() {
    progress.classList.remove('is-running');
    void progress.offsetWidth; // restart the CSS animation
    if (!reduce && !paused && visible) progress.classList.add('is-running');
  }

  function schedule() {
    clearTimeout(timer);
    restartProgress();
    if (reduce || paused || !visible) return;
    timer = setTimeout(function () { goTo(active + 1, false); }, AUTO);
  }

  function goTo(index, byUser) {
    const next = ((index % n) + n) % n;
    if (next === active && byUser) { schedule(); return; }

    active = next;
    render();
    materialize(cards[active]);
    status.textContent = 'Testimonial ' + (active + 1) + ' of ' + n;
    schedule();
  }

  function pause() { paused = true; schedule(); }
  function resume() { paused = false; schedule(); }

  stage.addEventListener('pointerenter', pause);
  stage.addEventListener('pointerleave', resume);
  controls.addEventListener('pointerenter', pause);
  controls.addEventListener('pointerleave', resume);
  stage.addEventListener('focusin', pause);
  stage.addEventListener('focusout', resume);

  /* -----------------------------------------
     INPUT: keys, swipe/drag, 3D parallax
  ------------------------------------------ */
  stage.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1, true); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1, true); }
  });

  let startX = 0;
  let tracking = false;

  stage.addEventListener('pointerdown', function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    startX = event.clientX;
    tracking = true;
    dragged = false;
  });

  window.addEventListener('pointerup', function (event) {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 50) {
      dragged = true;
      goTo(active + (dx < 0 ? 1 : -1), true);
      setTimeout(function () { dragged = false; }, 60);
    }
  });

  if (hasMouse && !reduce) {
    stage.addEventListener('pointermove', function (event) {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--px', (((event.clientX - rect.left) / rect.width - 0.5) * 2).toFixed(3));
      stage.style.setProperty('--py', (((event.clientY - rect.top) / rect.height - 0.5) * 2).toFixed(3));
    });

    stage.addEventListener('pointerleave', function () {
      stage.style.setProperty('--px', 0);
      stage.style.setProperty('--py', 0);
    });
  }

  /* -----------------------------------------
     START
  ------------------------------------------ */
  render();

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    measure();
    render();
  });

  if ('IntersectionObserver' in window) {
    let first = true;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && first) {
        first = false;
        materialize(cards[active]);
      }
      schedule();
    }, { threshold: 0.35 }).observe(stage);
  } else {
    visible = true;
    schedule();
  }
};
