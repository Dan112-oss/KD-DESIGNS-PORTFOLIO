/* ==========================================================
   TESTIMONIALS-MATCH.JS  (Phase 15)
   Purpose: Gives the Testimonials cards the same structure as the
   Services cards, so they share the same look and hover effects:
   - a big number (01, 02, 03) that turns orange on hover
   - the quote icon behaves like a service icon (orange on hover)
   - the first card is "featured": full width, laid out as a row
   The reveal animation, border sweep, glow, circuit line and heading
   decode are shared with Services through the existing CSS/JS.
   It only decorates cards that testimonials.js already rendered, so
   your real testimonial text is never touched. Styling: css/tech.css.
============================================================= */

window.KD = window.KD || {};

KD.initTestimonialsMatch = function initTestimonialsMatch() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;

  const cards = Array.prototype.slice.call(grid.querySelectorAll('.testimonial-card'));
  const pad = function (n) { return String(n).padStart(2, '0'); };

  cards.forEach(function (card, i) {
    if (card.querySelector('.testimonial-card__number')) return; // already done

    // Big number, first in the card (same as the Services cards)
    const num = document.createElement('span');
    num.className = 'testimonial-card__number';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = pad(i + 1);
    card.insertBefore(num, card.firstChild);

    // Group quote + author into one body block (like title + description)
    const quote = card.querySelector('.testimonial-card__quote');
    const footer = card.querySelector('.testimonial-card__footer');
    if (quote && footer) {
      const body = document.createElement('div');
      body.className = 'testimonial-card__body';
      card.insertBefore(body, quote);
      body.appendChild(quote);
      body.appendChild(footer);
    }

    // First card is the wide "featured" one
    if (i === 0) card.classList.add('testimonial-card--featured');
  });
};
