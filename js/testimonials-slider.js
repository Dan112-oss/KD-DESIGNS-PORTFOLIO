/* ==========================================================
   TESTIMONIALS-SLIDER.JS  (Phase 16)
   Purpose: Turns the Testimonials into a slider that glides left
   continuously, in a seamless loop.
   - The cards you already have (from testimonials.js) are placed in a
     track; copies are added so the loop has no gap on any screen width.
   - The speed is steady (about 55px per second), whatever the width.
   - It pauses while you hover, focus inside it, or hold a finger on it,
     and while the section is off screen.
   - The abstract quote icon is replaced with a real typographic
     quotation mark (the " character).
   - Reduced-motion: no movement; the cards sit in a row you can scroll
     sideways by hand.
   Copies are hidden from screen readers and can't be tabbed to, so your
   real testimonials are read once. Styling: css/tech.css (Phase 16).
============================================================= */

window.KD = window.KD || {};

KD.initTestimonialsSlider = function initTestimonialsSlider() {
  const section = document.getElementById('testimonials');
  const viewport = document.getElementById('testimonialsGrid');
  if (!section || !viewport) return;

  const originals = Array.prototype.slice.call(viewport.querySelectorAll('.testimonial-card'));
  if (!originals.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 55; // pixels per second

  /* -----------------------------------------
     Real quotation mark instead of the abstract icon
  ------------------------------------------ */
  originals.forEach(function (card) {
    const mark = document.createElement('span');
    mark.className = 'testimonial-card__quote-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '\u201C'; // the " character

    const oldIcon = card.querySelector('.testimonial-card__quote-icon');
    if (oldIcon) {
      oldIcon.replaceWith(mark);
    } else {
      card.insertBefore(mark, card.firstChild);
    }
  });

  /* -----------------------------------------
     Build the track
  ------------------------------------------ */
  viewport.classList.add('testi-slider');
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Client testimonials');

  const track = document.createElement('div');
  track.className = 'testi-track';

  const group = document.createElement('div');
  group.className = 'testi-group';
  originals.forEach(function (card) { group.appendChild(card); });

  track.appendChild(group);
  viewport.appendChild(track);

  function build() {
    // remove old copies
    Array.prototype.slice.call(track.querySelectorAll('[data-clone]')).forEach(function (g) {
      g.parentNode.removeChild(g);
    });

    const groupWidth = group.getBoundingClientRect().width;
    if (!groupWidth) return;

    if (reduce) {
      viewport.classList.add('is-static');
      return;
    }

    // enough copies that the track is always wider than the viewport + one group
    const copies = Math.max(1, Math.ceil(viewport.clientWidth / groupWidth));

    for (let i = 0; i < copies; i++) {
      const clone = group.cloneNode(true);
      clone.setAttribute('data-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      if ('inert' in clone) clone.inert = true;

      Array.prototype.forEach.call(clone.querySelectorAll('.testimonial-card'), function (c) {
        c.removeAttribute('style'); // drop any inline animation state
        c.setAttribute('tabindex', '-1');
      });

      track.appendChild(clone);
    }

    track.style.setProperty('--shift', groupWidth.toFixed(1) + 'px');
    track.style.setProperty('--dur', Math.max(18, groupWidth / SPEED).toFixed(1) + 's');
  }

  build();

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(build);

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  /* -----------------------------------------
     Hold a finger / mouse button to pause
  ------------------------------------------ */
  viewport.addEventListener('pointerdown', function () { viewport.classList.add('is-held'); });
  window.addEventListener('pointerup', function () { viewport.classList.remove('is-held'); });
  window.addEventListener('pointercancel', function () { viewport.classList.remove('is-held'); });

  /* -----------------------------------------
     Pause while off screen
  ------------------------------------------ */
  if ('IntersectionObserver' in window) {
    section.classList.add('is-offscreen');
    new IntersectionObserver(function (entries) {
      section.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    }).observe(viewport);
  }
};
