/* ==========================================================
   TESTIMONIALS.JS
   Purpose: Testimonial data and card rendering for the
   Testimonials section. Isolated here, same pattern as
   portfolio.js, so it's easy to edit independently.

   ==========================================================
   >>> REPLACE ME <<<
   Everything in TESTIMONIALS_DATA below is SAMPLE data, used
   only to build and test the layout. Replace each entry with
   a real testimonial before launch:
     - quote    -> the actual words the client said
     - name     -> their real name
     - role     -> their real role and/or company
     - initials -> two letters shown in the avatar circle
                   (no photo is used, so no image file is needed)
   Remove entries entirely if you have fewer real testimonials
   than sample ones, or add more by copying the object shape.
   ========================================================== */

const TESTIMONIALS_DATA = [
  {
    id: 'sample-01',
    quote: 'SAMPLE — replace with a real quote about what it was like to work together and the result they got.',
    name: 'SAMPLE — Client Name',
    role: 'SAMPLE — Role, Company',
    initials: 'CN'
  },
  {
    id: 'sample-02',
    quote: 'SAMPLE — replace with a real quote about what it was like to work together and the result they got.',
    name: 'SAMPLE — Client Name',
    role: 'SAMPLE — Role, Company',
    initials: 'AB'
  },
  {
    id: 'sample-03',
    quote: 'SAMPLE — replace with a real quote about what it was like to work together and the result they got.',
    name: 'SAMPLE — Client Name',
    role: 'SAMPLE — Role, Company',
    initials: 'MK'
  }
];

window.KD = window.KD || {};

KD.initTestimonials = function initTestimonials() {
  const grid = document.getElementById('testimonialsGrid');

  if (!grid) {
    return;
  }

  function createCard(testimonial) {
    const card = document.createElement('article');
    card.className = 'testimonial-card';
    card.tabIndex = 0;

    card.innerHTML =
      '<svg class="testimonial-card__quote-icon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M7 8c-2 0-3.5 1.5-3.5 3.5S5 15 7 15c0 2-1.5 3.5-3.5 3.5"></path>' +
        '<path d="M17 8c-2 0-3.5 1.5-3.5 3.5S15 15 17 15c0 2-1.5 3.5-3.5 3.5"></path>' +
      '</svg>' +
      '<p class="testimonial-card__quote">' + testimonial.quote + '</p>' +
      '<div class="testimonial-card__footer">' +
        '<span class="testimonial-card__avatar" aria-hidden="true">' + testimonial.initials + '</span>' +
        '<span class="testimonial-card__meta">' +
          '<span class="testimonial-card__name">' + testimonial.name + '</span>' +
          '<span class="testimonial-card__role">' + testimonial.role + '</span>' +
        '</span>' +
      '</div>';

    return card;
  }

  TESTIMONIALS_DATA.forEach(function (testimonial) {
    grid.appendChild(createCard(testimonial));
  });
};
