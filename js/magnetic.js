/* ==========================================================
   MAGNETIC.JS  (Phase 8)
   Purpose: Buttons (.btn) lean toward the mouse when it gets
   close, then spring back when it leaves. Uses the CSS
   "translate" property, so it never clashes with the buttons'
   own hover transforms. Mouse devices only; off for
   reduced-motion. Easing lives in css/tech.css.
============================================================= */

window.KD = window.KD || {};

KD.initMagnetic = function initMagnetic() {
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduce) return;

  const PULL = 0.3;   // how strongly buttons follow the mouse
  const MAX = 12;     // maximum shift in px
  const REACH = 60;   // extra px around a button where the pull starts

  const buttons = Array.prototype.slice.call(document.querySelectorAll('.btn'));
  if (!buttons.length) return;

  let mx = -9999;
  let my = -9999;
  let queued = false;

  function clamp(v) {
    return Math.max(-MAX, Math.min(MAX, v));
  }

  function update() {
    queued = false;

    buttons.forEach(function (btn) {
      const rect = btn.getBoundingClientRect();

      // Skip buttons that are off screen
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      // Remove the current shift so the button's "home" centre stays fixed
      const cx = rect.left + rect.width / 2 - (btn._tx || 0);
      const cy = rect.top + rect.height / 2 - (btn._ty || 0);
      const dx = mx - cx;
      const dy = my - cy;
      const reach = Math.max(rect.width, rect.height) / 2 + REACH;

      if (Math.sqrt(dx * dx + dy * dy) < reach) {
        btn._tx = clamp(dx * PULL);
        btn._ty = clamp(dy * PULL);
        btn.style.translate = btn._tx + 'px ' + btn._ty + 'px';
      } else if (btn._tx || btn._ty) {
        btn._tx = 0;
        btn._ty = 0;
        btn.style.translate = '';
      }
    });
  }

  document.addEventListener('mousemove', function (event) {
    mx = event.clientX;
    my = event.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  });

  document.documentElement.addEventListener('mouseleave', function () {
    mx = -9999;
    my = -9999;
    update();
  });
};
