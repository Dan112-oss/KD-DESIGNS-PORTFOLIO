/* ==========================================================
   TECH-TEXT.JS  (Phase 8)
   Purpose: Text effects that make copy feel like an interface.
   1. Section headings "decode" (letters scramble, then settle)
      the first time they scroll into view.
   2. Nav links decode on hover / keyboard focus.
   3. A typing line in the hero cycles through your services.
   Everything is plain DOM + IntersectionObserver, no extra
   libraries. Reduced-motion visitors get no scrambling or typing:
   headings and nav stay as written, the hero line shows static text.
   Screen readers always get the real heading text (aria-label).
============================================================= */

window.KD = window.KD || {};

/* -----------------------------------------
   SHARED: scramble an element's text into `finalText`
   Letters resolve left to right; spaces never change.
------------------------------------------ */
KD.scramble = function scramble(el, finalText, opts) {
  opts = opts || {};
  const duration = opts.duration || 900;
  const pool = opts.pool || '01<>/\\_+*#=ABCDEFGHJKLMNPQRSTUVWXYZ';
  const len = finalText.length;
  const begin = performance.now();

  if (el._kdScramble) cancelAnimationFrame(el._kdScramble);

  function frame(now) {
    const p = Math.min((now - begin) / duration, 1);
    let out = '';

    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ' || p >= (i / len) * 0.8 + 0.2) {
        out += ch;
      } else {
        out += pool[Math.floor(Math.random() * pool.length)];
      }
    }

    el.textContent = out;

    if (p < 1) {
      el._kdScramble = requestAnimationFrame(frame);
    } else {
      el.textContent = finalText;
      el._kdScramble = null;
      if (opts.onDone) opts.onDone();
    }
  };

  el._kdScramble = requestAnimationFrame(frame);
};

KD.scrambledString = function scrambledString(finalText, pool) {
  let out = '';
  for (let i = 0; i < finalText.length; i++) {
    out += finalText[i] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)];
  }
  return out;
};

KD.initTechText = function initTechText() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  // Run `fn` now, or after the boot screen has left
  function whenBooted(fn) {
    if (root.classList.contains('kd-booting')) {
      window.addEventListener('kd:boot-done', fn, { once: true });
    } else {
      fn();
    }
  }

  /* -----------------------------------------
     3. HERO TYPING LINE
  ------------------------------------------ */
  function initTyped() {
    const out = document.getElementById('heroTyped');
    if (!out) return;

    const words = [
      'Graphic Design',
      'Web Design',
      'Branding',
      'UI Design',
      'Social Media Design',
      'Visual Identity'
    ];

    if (reduce) {
      out.textContent = words.slice(0, 4).join(' / ');
      return;
    }

    let w = 0;
    let i = 0;
    let deleting = false;

    function tick() {
      const word = words[w];

      if (!deleting) {
        i++;
        out.textContent = word.slice(0, i);
        if (i === word.length) {
          deleting = true;
          setTimeout(tick, 1500);
        } else {
          setTimeout(tick, 70);
        }
      } else {
        i--;
        out.textContent = word.slice(0, i);
        if (i === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          setTimeout(tick, 350);
        } else {
          setTimeout(tick, 35);
        }
      }
    }

    whenBooted(function () { setTimeout(tick, 900); });
  }

  initTyped();

  if (reduce) return;

  /* -----------------------------------------
     2. NAV LINKS DECODE ON HOVER / FOCUS
        (mono font = fixed letter widths, so nothing shifts)
  ------------------------------------------ */
  if (hasMouse) {
    document.querySelectorAll('.site-nav__link').forEach(function (link) {
      if (link.children.length) return;
      const label = link.textContent.trim();

      function decode() {
        KD.scramble(link, label, { duration: 380 });
      }

      link.addEventListener('mouseenter', decode);
      link.addEventListener('focus', decode);
    });
  }

  /* -----------------------------------------
     1. SECTION HEADINGS DECODE ON SCROLL
  ------------------------------------------ */
  if (!('IntersectionObserver' in window)) return;

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  fontsReady.then(function () {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const h = entry.target;
        observer.unobserve(h);

        KD.scramble(h, h._kdFinal, {
          duration: 950,
          pool: h._kdPool,
          onDone: function () { h.style.minHeight = ''; }
        });
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.section-heading').forEach(function (h) {
      if (h.children.length) return; // only plain-text headings

      const finalText = h.textContent.replace(/\s+/g, ' ').trim();
      const pool = finalText.replace(/[^A-Za-z]/g, '');
      if (!finalText || !pool) return;

      h._kdFinal = finalText;
      h._kdPool = pool; // scramble with the heading's own letters: similar widths

      h.setAttribute('aria-label', finalText);
      h.style.minHeight = h.offsetHeight + 'px'; // keep layout steady while scrambling
      h.textContent = KD.scrambledString(finalText, pool);

      observer.observe(h);
    });
  });
};
