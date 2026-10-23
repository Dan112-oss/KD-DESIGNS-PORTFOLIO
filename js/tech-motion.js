/* ==========================================================
   TECH-MOTION.JS  (Phase 4)
   Purpose: Scroll-triggered "tech" details, built on the same
   GSAP + ScrollTrigger already used in animations.js:
   1. The connector lines between the process steps draw in,
      one after another.
   2. The process numbers (01-04) count up as each line draws.
   3. Any element with a data-count attribute counts up when it
      scrolls into view (used by the optional stats strip in the
      About section, see index.html).
   Does nothing if GSAP is missing or the visitor has
   reduced-motion on: everything is already visible in the
   plain HTML/CSS.
============================================================= */

window.KD = window.KD || {};

KD.initTechMotion = function initTechMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    const restore = [];

    /* -----------------------------------------
       PROCESS: lines draw, numbers count up
    ------------------------------------------ */
    const grid = document.querySelector('#process .process__grid');
    const steps = gsap.utils.toArray('#process .process-step');

    if (grid && steps.length) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      steps.forEach(function (step, i) {
        const at = i * 0.45;

        // Connector to the next step (CSS reads --kd-line, see tech.css)
        if (i < steps.length - 1) {
          tl.fromTo(
            step,
            { '--kd-line': 0 },
            { '--kd-line': 1, duration: 0.5, ease: 'power2.out' },
            at + 0.2
          );
        }

        // Step number counts up from 00
        const num = step.querySelector('.process-step__number');
        if (!num) return;

        const original = num.textContent;
        const target = parseInt(original, 10);
        if (isNaN(target)) return;

        restore.push(function () { num.textContent = original; });

        const counter = { v: 0 };
        num.textContent = '00';

        tl.to(counter, {
          v: target,
          duration: 0.6,
          ease: 'power1.out',
          onUpdate: function () {
            num.textContent = String(Math.round(counter.v)).padStart(2, '0');
          },
          onComplete: function () {
            num.textContent = String(target).padStart(2, '0');
          }
        }, at);
      });
    }

    /* -----------------------------------------
       STATS: [data-count] elements count up
    ------------------------------------------ */
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      const end = parseFloat(el.dataset.count);
      if (isNaN(end)) return;

      const suffix = el.dataset.suffix || '';
      const original = el.textContent;
      const counter = { v: 0 };

      restore.push(function () { el.textContent = original; });
      el.textContent = '0' + suffix;

      gsap.to(counter, {
        v: end,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(counter.v) + suffix;
        },
        onComplete: function () {
          el.textContent = end + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        }
      });
    });

    // If reduced-motion is switched on later, put the original text back
    return function () {
      restore.forEach(function (fn) { fn(); });
    };
  });
};
