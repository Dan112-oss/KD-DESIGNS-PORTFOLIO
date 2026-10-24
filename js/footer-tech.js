/* ==========================================================
   FOOTER-TECH.JS  (Phase 13)
   Purpose: Turns the footer into a "system console":
   1. A status bar on top: online indicator, page uptime, viewport
      size and theme (all real, live values) plus a working
      "Back to top" button.
   2. Footer links decode on hover, like the main nav.
   3. A copy-to-clipboard button next to the email address.
   4. The tagline types itself when the footer scrolls into view.
   5. A giant outlined "KD DESIGNS" wordmark that decodes in, with a
      light that sweeps across it and follows the mouse.
   The animated perspective-grid floor is pure CSS (css/tech.css).
   Reduced-motion: no typing, decoding or sweeping, but the status bar,
   copy button and back-to-top still work. Needs KD.scramble from
   tech-text.js for the decode effects (skipped if it's missing).
============================================================= */

window.KD = window.KD || {};

KD.initFooterTech = function initFooterTech() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pad = function (n) { return String(n).padStart(2, '0'); };
  const canScramble = typeof KD.scramble === 'function';

  /* -----------------------------------------
     1. STATUS BAR
  ------------------------------------------ */
  const bar = document.createElement('div');
  bar.className = 'container footer-status';
  bar.innerHTML =
    '<div class="footer-status__items" aria-hidden="true">' +
      '<span class="footer-status__item footer-status__item--online"><i></i>SYSTEM ONLINE</span>' +
      '<span class="footer-status__item"><b>UPTIME</b><span data-fs="uptime">00:00:00</span></span>' +
      '<span class="footer-status__item"><b>VIEWPORT</b><span data-fs="viewport">0 x 0</span></span>' +
      '<span class="footer-status__item"><b>THEME</b><span data-fs="theme">DARK</span></span>' +
    '</div>' +
    '<button type="button" class="footer-top" aria-label="Back to top">' +
      '<span class="footer-top__arrow" aria-hidden="true">&uarr;</span> Back to top' +
    '</button>';
  footer.insertBefore(bar, footer.firstChild);

  const uptimeEl = bar.querySelector('[data-fs="uptime"]');
  const viewportEl = bar.querySelector('[data-fs="viewport"]');
  const themeEl = bar.querySelector('[data-fs="theme"]');

  function tickUptime() {
    const s = Math.floor(performance.now() / 1000);
    uptimeEl.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
  }

  function updateViewport() {
    viewportEl.textContent = window.innerWidth + ' x ' + window.innerHeight;
  }

  function updateTheme() {
    themeEl.textContent = (document.documentElement.getAttribute('data-theme') || 'light').toUpperCase();
  }

  tickUptime();
  updateViewport();
  updateTheme();
  setInterval(tickUptime, 1000);
  window.addEventListener('resize', updateViewport);

  if ('MutationObserver' in window) {
    new MutationObserver(updateTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  bar.querySelector('.footer-top').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* -----------------------------------------
     2. FOOTER LINKS DECODE ON HOVER / FOCUS
  ------------------------------------------ */
  if (!reduce && hasMouse && canScramble) {
    footer.querySelectorAll('.footer__link').forEach(function (link) {
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
     3. COPY-EMAIL BUTTON
  ------------------------------------------ */
  const email = footer.querySelector('.footer__email');

  if (email && email.parentNode) {
    const address = email.textContent.trim();

    const wrap = document.createElement('div');
    wrap.className = 'footer__email-wrap';
    email.parentNode.insertBefore(wrap, email);
    wrap.appendChild(email);

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'footer-copy';
    copy.setAttribute('aria-label', 'Copy email address');
    copy.textContent = 'Copy';
    wrap.appendChild(copy);

    function fallbackCopy() {
      const ta = document.createElement('textarea');
      ta.value = address;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    function flash(text, ok) {
      copy.textContent = text;
      copy.classList.toggle('is-done', ok);
      setTimeout(function () {
        copy.textContent = 'Copy';
        copy.classList.remove('is-done');
      }, 1600);
    }

    function copyWithFallback() {
      const ok = fallbackCopy();
      flash(ok ? 'Copied' : 'Press Ctrl+C', ok);
    }

    copy.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(
          function () { flash('Copied', true); },
          copyWithFallback
        );
      } else {
        copyWithFallback();
      }
    });
  }

  /* -----------------------------------------
     5. GIANT WORDMARK
  ------------------------------------------ */
  const bottom = footer.querySelector('.footer__bottom');
  const wordmark = document.createElement('div');
  wordmark.className = 'footer-wordmark';
  wordmark.setAttribute('aria-hidden', 'true');
  wordmark.innerHTML = '<span class="footer-wordmark__text">KD DESIGNS</span>';
  const wordText = wordmark.firstChild;
  if (bottom) {
    footer.insertBefore(wordmark, bottom);
  } else {
    footer.appendChild(wordmark);
  }

  // Size the wordmark so it always fits the footer width exactly,
  // whatever font actually loaded.
  function fitWordmark() {
    wordmark.style.fontSize = '100px';
    const measured = wordText.getBoundingClientRect().width;
    const cs = getComputedStyle(wordmark);
    const avail = wordmark.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (measured > 0 && avail > 0) {
      const size = Math.max(36, Math.min(300, (100 * avail / measured) * 0.98));
      wordmark.style.fontSize = size.toFixed(1) + 'px';
    }
  }

  fitWordmark();
  window.addEventListener('resize', function () {
    if (wordText._kdScramble) return; // don't re-measure mid-decode
    wordText.style.minWidth = '';
    fitWordmark();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitWordmark);
  }

  // Hide the corner readout while the footer is on screen (it would cover the copyright line)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      document.documentElement.classList.toggle('kd-footer-view', entries[0].isIntersecting);
    }, { threshold: 0.08 }).observe(footer);
  }

  if (reduce) return;

  // Light follows the mouse across the wordmark
  if (hasMouse) {
    footer.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      const rect = wordmark.getBoundingClientRect();
      const m = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      wordmark.style.setProperty('--shine', ((1 - m) * 100).toFixed(1) + '%');
      wordmark.classList.add('is-tracking');
    });

    footer.addEventListener('pointerleave', function () {
      wordmark.classList.remove('is-tracking');
    });
  }

  /* -----------------------------------------
     4 + 5. TYPING TAGLINE and WORDMARK DECODE (once, on view)
  ------------------------------------------ */
  if (!('IntersectionObserver' in window)) return;

  const tagline = footer.querySelector('.footer__tagline');
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  fontsReady.then(function () {
    let tagText = '';

    if (tagline && !tagline.children.length) {
      tagText = tagline.textContent.replace(/\s+/g, ' ').trim();
      tagline.setAttribute('aria-label', tagText);
      tagline.style.minHeight = tagline.offsetHeight + 'px';
      tagline.textContent = '';
      tagline.classList.add('is-typing');
    }

    if (canScramble) {
      fitWordmark();
      wordText.style.minWidth = wordText.getBoundingClientRect().width + 'px';
      wordText.textContent = KD.scrambledString('KD DESIGNS', 'KDESIGN');
    }

    const observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      if (canScramble) {
        KD.scramble(wordText, 'KD DESIGNS', {
          duration: 1500,
          pool: 'KDESIGN01',
          onDone: function () { wordText.style.minWidth = ''; }
        });
      } else {
        wordText.textContent = 'KD DESIGNS';
      }

      if (tagText) {
        let i = 0;
        (function type() {
          i++;
          tagline.textContent = tagText.slice(0, i);
          if (i < tagText.length) {
            setTimeout(type, 28);
          } else {
            tagline.style.minHeight = '';
            setTimeout(function () { tagline.classList.remove('is-typing'); }, 2500);
          }
        })();
      }
    }, { threshold: 0.25 });

    observer.observe(footer);
  });
};
