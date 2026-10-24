/* ==========================================================
   CIRCUITS.JS  (Phase 9)
   Purpose: Decorative "circuit trace" lines on the seams between
   sections. Each one draws itself in (and its nodes pop in) the
   first time it scrolls into view, then a small light pulse
   travels along it. The lines are created here, so index.html
   needs no extra markup. They are purely decorative (aria-hidden).
   Reduced-motion: lines appear already drawn, with no pulse.
============================================================= */

window.KD = window.KD || {};

KD.initCircuits = function initCircuits() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Which section/footer each line sits above (the seam with whatever comes before it)
  const ids = ['portfolio', 'about', 'services', 'testimonials', 'contact', 'footer'];

  // Three trace layouts (viewBox 1200 x 48), reused in rotation
  const variants = [
    {
      paths: ['M0 24 H430 L454 8 H746 L770 24 H1200'],
      nodes: [[454, 8], [746, 8]]
    },
    {
      paths: ['M0 24 H280 L304 40 H620 L644 24 H880 L904 8 H1200'],
      nodes: [[304, 40], [644, 24], [904, 8]]
    },
    {
      paths: ['M0 24 H500 L524 40 H1200', 'M500 24 L524 8 H860 L884 24 H1200'],
      nodes: [[524, 40], [524, 8], [884, 24]]
    }
  ];

  const observer = ('IntersectionObserver' in window && !reduce)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          entry.target.parentNode.classList.add('is-drawn');
        });
      }, { threshold: 0.5 })
    : null;

  ids.forEach(function (id, n) {
    const section = document.getElementById(id);
    if (!section || !section.parentNode) return;

    const v = variants[n % variants.length];
    const pathId = 'kdCircuit' + n;

    let svg = '<svg class="circuit__svg" viewBox="0 0 1200 48" preserveAspectRatio="xMidYMid slice" focusable="false">';

    v.paths.forEach(function (d, i) {
      svg += '<path class="circuit__trace" pathLength="1"' + (i === 0 ? ' id="' + pathId + '"' : '') + ' d="' + d + '"/>';
    });

    v.nodes.forEach(function (p) {
      svg += '<circle class="circuit__node" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>';
    });

    if (!reduce) {
      svg +=
        '<circle class="circuit__pulse" r="3.2">' +
        '<animateMotion dur="' + (5 + (n % 3)) + 's" begin="' + (n * 0.7) + 's" repeatCount="indefinite">' +
        '<mpath href="#' + pathId + '"/>' +
        '</animateMotion></circle>';
    }

    svg += '</svg>';

    const wrap = document.createElement('div');
    wrap.className = 'circuit';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = svg;

    section.parentNode.insertBefore(wrap, section);

    if (observer) {
      observer.observe(wrap.firstChild);
    } else {
      wrap.classList.add('is-drawn'); // reduced-motion / old browsers: show fully drawn
    }
  });
};
