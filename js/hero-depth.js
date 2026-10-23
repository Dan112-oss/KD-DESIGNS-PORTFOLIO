/* ==========================================================
   HERO-DEPTH.JS  (Phase 9)
   Purpose: Mouse "depth" parallax in the hero. As the mouse moves
   over the hero, the orbit rings drift one way and the portrait
   drifts the other, so the layers seem to sit at different depths.
   It only writes two CSS variables (--kd-dx, --kd-dy, from -1 to 1)
   on .hero__visual; the actual movement is in css/tech.css.
   Mouse devices only, off for reduced-motion. The loop stops by
   itself once the layers have settled.
============================================================= */

window.KD = window.KD || {};

KD.initHeroDepth = function initHeroDepth() {
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduce) return;

  const hero = document.getElementById('hero');
  const visual = document.querySelector('.hero__visual');
  if (!hero || !visual) return;

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = null;

  function step() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;

    visual.style.setProperty('--kd-dx', cx.toFixed(4));
    visual.style.setProperty('--kd-dy', cy.toFixed(4));

    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
    }
  }

  function run() {
    if (!raf) raf = requestAnimationFrame(step);
  }

  hero.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    run();
  });

  hero.addEventListener('pointerleave', function () {
    tx = 0;
    ty = 0;
    run();
  });
};
