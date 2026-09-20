/* ==========================================================
   ANIMATIONS.JS
   Purpose: Scroll-driven reveal animations (GSAP + ScrollTrigger)
   and a subtle Hero parallax. Kept isolated from the rest of the
   site's JS — if GSAP fails to load (e.g. no network), this file
   simply does nothing and the site works exactly as before, since
   every element is already visible by default in CSS. Nothing here
   hides content up front; GSAP only animates FROM a state it sets
   at runtime.

   Respects prefers-reduced-motion via gsap.matchMedia(), the same
   way the Hero's CSS entrance animation already does.
============================================================= */

window.KD = window.KD || {};

KD.initAnimations = function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  /* -----------------------------------------
     REVEAL ON SCROLL
     Section header groups (eyebrow + heading + lede)
     and repeating card/item grids fade + rise into
     place once, the first time they enter view.
     Runs at every viewport width.
  ------------------------------------------ */
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    const headerGroups = [
      '#process .process__header',
      '#portfolio .portfolio__header',
      '#services .services__header',
      '#testimonials .testimonials__header',
      '#contact .contact__header'
    ];

    headerGroups.forEach(function (selector) {
      const el = document.querySelector(selector);
      if (!el) return;

      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    const staggerGroups = [
      { container: '#process .process__grid', items: '.process-step' },
      { container: '#portfolio .portfolio__grid', items: '.project-card' },
      { container: '#services .services__grid', items: '.service-card' },
      { container: '#testimonials .testimonials__grid', items: '.testimonial-card' }
    ];

    staggerGroups.forEach(function (group) {
      const container = document.querySelector(group.container);
      if (!container) return;
      const items = container.querySelectorAll(group.items);
      if (!items.length) return;

      gsap.from(items, {
        opacity: 0,
        y: 28,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // About: visual and content drift in from opposite sides —
    // a small directional touch distinct from the fade-up used
    // everywhere else, without becoming a second animation style.
    const aboutVisual = document.querySelector('.about__visual');
    const aboutContent = document.querySelector('.about__content');

    if (aboutVisual && aboutContent) {
      gsap.from(aboutVisual, {
        opacity: 0,
        x: -24,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      gsap.from(aboutContent, {
        opacity: 0,
        x: 24,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      gsap.from(contactForm, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contactForm,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    }
  });

  /* -----------------------------------------
     3D TILT — Portfolio images only
     Mouse-driven tilt on the project thumbnails, the
     classic "3D trending portfolio" touch. Scoped to
     fine-pointer devices (skipped on touch, where a
     hover tilt doesn't make sense) and applied to the
     image wrapper only, so it never fights with the
     existing CSS hover scale on the image itself or the
     card-level lift — each lives on a different element.
  ------------------------------------------ */
  mm.add(
    '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
    function () {
      const cards = document.querySelectorAll('.project-card');

      cards.forEach(function (card) {
        const imageWrap = card.querySelector('.project-card__image-wrap');
        if (!imageWrap) return;

        gsap.set(imageWrap, { transformPerspective: 800 });

        const setRotateX = gsap.quickTo(imageWrap, 'rotateX', { duration: 0.4, ease: 'power2.out' });
        const setRotateY = gsap.quickTo(imageWrap, 'rotateY', { duration: 0.4, ease: 'power2.out' });

        card.addEventListener('mousemove', function (event) {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          setRotateY(px * 10);
          setRotateX(py * -10);
        });

        card.addEventListener('mouseleave', function () {
          setRotateX(0);
          setRotateY(0);
        });
      });
    }
  );

  /* -----------------------------------------
     Note on Hero parallax: deliberately not doing a
     background-position parallax on .hero here. Its
     background is two stacked layers (dark scrim +
     photo) with keyword-based positioning tuned per
     breakpoint — animating that shorthand with GSAP
     risks breaking that composition for a subtle effect
     that isn't worth the fragility. The reveal animations
     above are the "scroll-driven" piece; Hero keeps its
     existing load-time fade-up from earlier phases.
  ------------------------------------------ */

  // Refresh ScrollTrigger's measurements after a theme toggle,
  // since swapping logos/backgrounds can shift layout slightly.
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      ScrollTrigger.refresh();
    });
  }
};
