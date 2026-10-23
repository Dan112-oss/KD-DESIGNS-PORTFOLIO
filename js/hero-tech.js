/* ==========================================================
   HERO-TECH.JS  (Phase 2)
   Purpose: Two hero effects, both purely decorative:
   1. A dot-grid on <canvas id="heroGrid"> where dots near the
      cursor swell and glow in the brand orange. With no mouse
      (touch devices) a glow drifts slowly on its own.
   2. The gradient words in the headline "decode" in with a
      quick scramble when the page loads.
   Respects prefers-reduced-motion: the grid is drawn once, still,
   and the headline is left alone. Pauses when the hero is off
   screen. If anything is missing, it quietly does nothing.
============================================================= */

window.KD = window.KD || {};

KD.initHeroTech = function initHeroTech() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroGrid');
  if (!hero || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GAP = 28;      // distance between dots (px)
  const RADIUS = 170;  // reach of the cursor glow (px)

  let w = 0;
  let h = 0;
  let raf = null;
  let running = false;
  const t0 = performance.now();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!pointer.x && !pointer.y) {
      pointer.x = pointer.tx = w * 0.6;
      pointer.y = pointer.ty = h * 0.45;
    }
    if (!running) draw(performance.now());
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    const dark = isDark();

    // With no mouse, let the glow wander slowly on its own
    if (!pointer.active && !reduce) {
      const t = (now - t0) / 1000;
      pointer.tx = w * (0.55 + 0.3 * Math.sin(t * 0.35));
      pointer.ty = h * (0.5 + 0.3 * Math.cos(t * 0.27));
    }
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    // Soft glow under the dots
    const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, RADIUS * 1.7);
    glow.addColorStop(0, 'rgba(243, 164, 44,' + (dark ? 0.16 : 0.10) + ')');
    glow.addColorStop(1, 'rgba(215, 112, 1, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Dots
    const baseAlpha = dark ? 0.16 : 0.18;
    const cols = Math.ceil(w / GAP) + 1;
    const rows = Math.ceil(h / GAP) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * GAP + GAP / 2;
        const y = j * GAP + GAP / 2;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const k = dist < RADIUS ? 1 - dist / RADIUS : 0;

        ctx.beginPath();
        ctx.arc(x, y, 1 + k * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(243, 164, 44,' + (baseAlpha + k * 0.75).toFixed(3) + ')';
        ctx.fill();
      }
    }
  }

  function loop(now) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  hero.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left;
    pointer.ty = event.clientY - rect.top;
    pointer.active = true;
  });

  hero.addEventListener('pointerleave', function () {
    pointer.active = false;
  });

  window.addEventListener('resize', resize);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle && reduce) {
    themeToggle.addEventListener('click', function () {
      requestAnimationFrame(function () { draw(performance.now()); });
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }

  resize();

  /* -----------------------------------------
     HEADLINE DECODE
     Only the gradient words scramble, then settle into place.
     The width is locked while scrambling so nothing jumps.
  ------------------------------------------ */
  const headline = document.querySelector('.hero__headline');
  const accent = document.querySelector('.hero__headline-accent');

  if (headline && accent && !reduce) {
    const finalText = accent.textContent;
    const chars = '01<>/\\_+*#=';
    const duration = 1100;

    // Screen readers should hear the real sentence, not the scramble
    headline.setAttribute('aria-label', headline.textContent.trim());
    accent.setAttribute('aria-hidden', 'true');

    accent.style.minWidth = accent.offsetWidth + 'px';

    const runDecode = function () {
    setTimeout(function () {
      const start = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        let out = '';

        for (let i = 0; i < finalText.length; i++) {
          const ch = finalText[i];
          if (ch === ' ' || p >= (i + 1) / finalText.length * 0.85 + 0.15) {
            out += ch;
          } else {
            out += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        accent.textContent = out;

        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          accent.textContent = finalText;
          accent.style.minWidth = '';
        }
      }

      requestAnimationFrame(tick);
    }, 500);
    };

    // If the boot screen is showing, decode after it leaves
    if (document.documentElement.classList.contains('kd-booting')) {
      window.addEventListener('kd:boot-done', runDecode, { once: true });
    } else {
      runDecode();
    }
  }
};
