/* ==========================================================
   TESTIMONIALS-TECH.JS  (Phase 11 + 12 "crazy" upgrade)
   Purpose: The full "neural link" treatment for the Testimonials
   section.

   BACKGROUND (one canvas):
   - Falling code rain, bright near the cursor like a flashlight
   - A dense network of drifting nodes, pulsing hub nodes, links
     and data packets with glowing tails
   - Electric lightning arcs from the cursor to nearby nodes
   - Click = shockwave + spark burst + a little screen shake
     (a shockwave also fires on its own every few seconds)
   - With no mouse (phones, or the mouse is away) a virtual cursor
     wanders by itself, so the effect never goes idle
   - Two hex-code tickers scroll along the top and bottom edges

   CARDS:
   - "TRANSMISSION_01" tag with live signal bars
   - CRT power-on flicker, then the quote decrypts, then a glitch burst
   - On hover: 3D tilt with depth, orange glare, a scan beam, and
     a glitch on the client's name

   Reduced-motion: network and rain are drawn once and stay still;
   no tickers moving, no decrypt, no tilt. Everything is decorative;
   screen readers get the real quote text. Styling is in css/tech.css.
============================================================= */

window.KD = window.KD || {};

KD.initTestimonialsTech = function initTestimonialsTech() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const container = section.querySelector('.container');

  /* =========================================
     HEX TICKERS (top + bottom edges)
  ========================================= */
  function hexLine() {
    const words = ['LINK_OK', 'SYNC', 'SIGNAL_LOCK', 'PACKET', 'ACK', 'UPLINK'];
    let out = '';
    for (let i = 0; i < 36; i++) {
      if (i % 6 === 5) {
        out += words[Math.floor(Math.random() * words.length)] + '  //  ';
      } else {
        out += '0x' + Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0') + '  ';
      }
    }
    return out;
  }

  ['top', 'bottom'].forEach(function (pos) {
    const line = hexLine();
    const row = document.createElement('div');
    row.className = 'testimonials__ticker testimonials__ticker--' + pos;
    row.setAttribute('aria-hidden', 'true');
    row.innerHTML = '<div class="testimonials__ticker-track"><span>' + line + '</span><span>' + line + '</span></div>';
    section.insertBefore(row, section.firstChild);
  });

  /* =========================================
     BACKGROUND CANVAS
  ========================================= */
  const canvas = document.createElement('canvas');
  canvas.className = 'testimonials__net';
  canvas.setAttribute('aria-hidden', 'true');
  section.insertBefore(canvas, section.firstChild);

  const ctx = canvas.getContext('2d');
  if (ctx) initCanvas();

  function initCanvas() {
    const LINK = 150;
    const POINTER_RADIUS = 200;
    const SHOCK_SPEED = 0.5;   // px per ms
    const SHOCK_WIDTH = 90;
    const CELL = 16;           // code rain cell size
    const TRAIL = 12;
    const GLYPHS = '01ABCDEF<>/{}[]=+*#';

    let w = 0;
    let h = 0;
    let nodes = [];
    let cols = [];
    const packets = [];
    const sparks = [];
    const shocks = [];
    const mouse = { x: 0, y: 0, active: false };
    let running = false;
    let raf = null;
    let last = 0;
    let nextPacket = 0;
    let nextShock = 0;
    let lowPower = false;   // set automatically on slow devices
    let slowFrames = 0;

    function rnd(min, max) { return min + Math.random() * (max - min); }
    function glyph() { return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.clientWidth;
      h = section.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(34, Math.min(120, Math.round((w * h) / 10000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: rnd(-0.3, 0.3),
          vy: rnd(-0.3, 0.3),
          r: rnd(1.2, 2.8),
          boost: 0,
          hub: i % 14 === 0,
          phase: Math.random() * Math.PI * 2
        });
      }

      cols = [];
      const colCount = Math.ceil(w / (CELL * 1.5));
      for (let c = 0; c < colCount; c++) {
        const g = [];
        for (let k = 0; k < TRAIL; k++) g.push(glyph());
        cols.push({
          x: c * CELL * 1.5 + CELL / 2,
          y: rnd(-20, h / CELL),
          speed: rnd(4, 11),
          glyphs: g
        });
      }

      packets.length = 0;
      sparks.length = 0;
      if (!running) draw(performance.now(), 0);
    }

    function spawnPacket() {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const start = Math.floor(Math.random() * nodes.length);
      for (let k = 0; k < nodes.length; k++) {
        const b = nodes[(start + k) % nodes.length];
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < LINK * LINK) {
          packets.push({ a: a, b: b, t: 0, speed: rnd(0.7, 1.6) });
          return;
        }
      }
    }

    function burst(x, y, n) {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = rnd(0.08, 0.38);
        sparks.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: rnd(500, 950) });
      }
    }

    function addShock(x, y, now, delay) {
      shocks.push({ x: x, y: y, start: now + (delay || 0) });
    }

    function bolt(x1, y1, x2, y2, alpha) {
      const segs = 7;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < segs; i++) {
        const t = i / segs;
        const off = (Math.random() - 0.5) * 20 * Math.sin(Math.PI * t);
        ctx.lineTo(x1 + dx * t + nx * off, y1 + dy * t + ny * off);
      }
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(255, 220, 160,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.3;
      ctx.shadowColor = 'rgba(243, 164, 44, 1)';
      ctx.shadowBlur = 9;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function pointerState(now) {
      if (mouse.active) return { x: mouse.x, y: mouse.y, power: 1 };
      if (reduce) return null;
      // virtual cursor that wanders on its own
      return {
        x: w * (0.5 + 0.4 * Math.sin(now * 0.00031)),
        y: h * (0.5 + 0.34 * Math.cos(now * 0.00043)),
        power: 0.6
      };
    }

    function draw(now, dt) {
      ctx.clearRect(0, 0, w, h);
      const ptr = pointerState(now);

      // ---------- pointer glow
      if (ptr) {
        const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 280);
        g.addColorStop(0, 'rgba(243, 164, 44,' + (0.12 * ptr.power).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(215, 112, 1, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // ---------- code rain (flashlight near the pointer)
      ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; !lowPower && c < cols.length; c++) {
        const col = cols[c];
        col.y += (col.speed * dt) / 1000;
        if ((col.y - TRAIL) * CELL > h) {
          col.y = rnd(-24, -2);
          col.speed = rnd(4, 11);
        }
        if (Math.random() < 0.06) col.glyphs[Math.floor(Math.random() * TRAIL)] = glyph();

        const head = Math.floor(col.y);
        for (let k = 0; k < TRAIL; k++) {
          const row = head - k;
          if (row < 0) continue;
          const y = row * CELL;
          if (y > h) continue;

          let a = 0.09 * (1 - k / TRAIL);
          if (ptr) {
            const dx = col.x - ptr.x;
            const dy = y - ptr.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 260) a += (1 - d / 260) * 0.6 * ptr.power * (1 - k / TRAIL);
          }
          if (k === 0) {
            ctx.fillStyle = 'rgba(255, 220, 160,' + Math.min(0.2 + a, 0.95).toFixed(3) + ')';
          } else {
            ctx.fillStyle = 'rgba(243, 164, 44,' + a.toFixed(3) + ')';
          }
          ctx.fillText(col.glyphs[k], col.x, y);
        }
      }

      // ---------- update nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx * dt * 0.06;
        n.y += n.vy * dt * 0.06;
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;

        let boost = 0;

        if (ptr) {
          const dx = n.x - ptr.x;
          const dy = n.y - ptr.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < POINTER_RADIUS) boost = Math.max(boost, (1 - d / POINTER_RADIUS) * ptr.power);
        }

        for (let s = 0; s < shocks.length; s++) {
          const R = (now - shocks[s].start) * SHOCK_SPEED;
          if (R < 0) continue;
          const dx = n.x - shocks[s].x;
          const dy = n.y - shocks[s].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          boost = Math.max(boost, 1 - Math.abs(d - R) / SHOCK_WIDTH);
        }

        n.boost += (Math.max(boost, 0) - n.boost) * 0.22;
      }

      // ---------- links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const k = 1 - Math.sqrt(d2) / LINK;
            const glow = Math.max(nodes[i].boost, nodes[j].boost);
            ctx.strokeStyle = 'rgba(215, 112, 1,' + (k * (0.24 + glow * 0.65)).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // ---------- lightning from the pointer to the nearest nodes
      if (ptr && !reduce && !lowPower) {
        const near = [];
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - ptr.x;
          const dy = nodes[i].y - ptr.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < POINTER_RADIUS) near.push({ n: nodes[i], d: d });
        }
        near.sort(function (a, b) { return a.d - b.d; });
        for (let i = 0; i < Math.min(4, near.length); i++) {
          bolt(ptr.x, ptr.y, near[i].n.x, near[i].n.y, (0.85 - i * 0.15) * ptr.power);
        }
      }

      // ---------- shock rings
      const maxR = Math.max(w, h) + 200;
      for (let s = shocks.length - 1; s >= 0; s--) {
        const R = (now - shocks[s].start) * SHOCK_SPEED;
        if (R > maxR) {
          shocks.splice(s, 1);
          continue;
        }
        if (R < 0) continue;
        ctx.strokeStyle = 'rgba(243, 164, 44,' + Math.max(0, 0.45 * (1 - R / maxR)).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shocks[s].x, shocks[s].y, R, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      // ---------- data packets with glowing tails
      for (let p = packets.length - 1; p >= 0; p--) {
        const pk = packets[p];
        pk.t += (dt / 1000) * pk.speed;
        if (pk.t >= 1) {
          packets.splice(p, 1);
          continue;
        }
        const t0 = Math.max(0, pk.t - 0.16);
        const x = pk.a.x + (pk.b.x - pk.a.x) * pk.t;
        const y = pk.a.y + (pk.b.y - pk.a.y) * pk.t;
        const tx = pk.a.x + (pk.b.x - pk.a.x) * t0;
        const ty = pk.a.y + (pk.b.y - pk.a.y) * t0;

        ctx.strokeStyle = 'rgba(255, 214, 140, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 235, 200, 1)';
        ctx.shadowColor = 'rgba(243, 164, 44, 1)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 1;

      // ---------- sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.life += dt;
        if (sp.life >= sp.max) {
          sparks.splice(s, 1);
          continue;
        }
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vx *= 0.985;
        sp.vy *= 0.985;
        const a = 1 - sp.life / sp.max;
        ctx.fillStyle = 'rgba(255, 220, 160,' + a.toFixed(3) + ')';
        ctx.fillRect(sp.x - 1, sp.y - 1, 2.4, 2.4);
      }

      // ---------- nodes (hubs pulse with a halo)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.003 + n.phase);

        if (n.hub) {
          ctx.strokeStyle = 'rgba(243, 164, 44,' + (0.18 + pulse * 0.3).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 7 + pulse * 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(243, 164, 44,' + (0.45 + n.boost * 0.55).toFixed(3) + ')';
        if (n.boost > 0.3 || n.hub) {
          ctx.shadowColor = 'rgba(243, 164, 44, 0.95)';
          ctx.shadowBlur = 12 * Math.max(n.boost, n.hub ? 0.6 : 0);
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, (n.hub ? n.r + 1.5 : n.r) * (1 + n.boost * 0.9), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ---------- timers
      if (!reduce) {
        if (now > nextPacket) {
          spawnPacket();
          nextPacket = now + rnd(90, 220);
        }
        if (now > nextShock) {
          const x = rnd(0, w);
          const y = rnd(0, h);
          addShock(x, y, now);
          burst(x, y, 14);
          nextShock = now + 3500;
        }
      }
    }

    function loop(now) {
      const raw = now - last;
      const dt = Math.min(raw, 50);
      last = now;

      // Slow device? After ~2 seconds of low frame rate, switch off the
      // heaviest effects (code rain, lightning) and thin out the nodes.
      if (!lowPower) {
        slowFrames = raw > 55 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames > 60) {
          lowPower = true;
          nodes = nodes.slice(0, Math.ceil(nodes.length / 2));
          packets.length = 0;
        }
      }

      draw(now, dt);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      nextShock = last + 900;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    if (hasMouse) {
      section.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
        mouse.active = true;
      });

      section.addEventListener('pointerleave', function () {
        mouse.active = false;
      });
    }

    // Click / tap: double shockwave, sparks and a short shake
    section.addEventListener('pointerdown', function (event) {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const now = performance.now();

      addShock(x, y, now);
      addShock(x, y, now, 200);
      burst(x, y, 32);

      if (container) {
        container.classList.remove('is-shock');
        void container.offsetWidth; // restart the animation
        container.classList.add('is-shock');
        setTimeout(function () { container.classList.remove('is-shock'); }, 380);
      }
    });

    window.addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }).observe(section);
    } else {
      start();
    }

    resize();
  }

  /* =========================================
     CARDS
  ========================================= */
  const cards = Array.prototype.slice.call(section.querySelectorAll('.testimonial-card'));
  const pad = function (n) { return String(n).padStart(2, '0'); };

  cards.forEach(function (card, i) {
    // Header tag with signal bars
    const tag = document.createElement('div');
    tag.className = 'testimonial-card__tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.innerHTML =
      '<span>TRANSMISSION_' + pad(i + 1) + '</span>' +
      '<span class="testimonial-card__tag-status">' +
        '<span class="signal"><i></i><i></i><i></i><i></i></span>RECEIVED' +
      '</span>';
    card.insertBefore(tag, card.firstChild);

    // Scan beam (animates while hovering, see css)
    const scan = document.createElement('span');
    scan.className = 'testimonial-card__scan';
    scan.setAttribute('aria-hidden', 'true');
    card.appendChild(scan);

    // 3D tilt + glare (mouse devices only)
    if (hasMouse && !reduce) {
      const MAX = 13; // degrees at the card edge

      card.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        const mag = Math.sqrt(px * px + py * py);

        card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');

        card.style.rotate = mag < 0.001
          ? '0 0 1 0deg'
          : (-py).toFixed(3) + ' ' + px.toFixed(3) + ' 0 ' + (mag * 2 * MAX).toFixed(2) + 'deg';
      });

      card.addEventListener('pointerleave', function () {
        card.style.rotate = '';
      });
    }
  });

  // Power-on flicker, quote decrypt, then a glitch burst (needs KD.scramble from tech-text.js)
  if (reduce || typeof KD.scramble !== 'function' || !('IntersectionObserver' in window)) return;

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  fontsReady.then(function () {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const quote = entry.target;
        const card = quote.closest('.testimonial-card');
        observer.unobserve(quote);

        setTimeout(function () {
          if (card) {
            card.classList.add('is-powering');
            setTimeout(function () { card.classList.remove('is-powering'); }, 800);
          }

          KD.scramble(quote, quote._kdFinal, {
            duration: 1600,
            pool: quote._kdPool,
            onDone: function () {
              quote.style.minHeight = '';
              if (card) {
                card.classList.add('is-glitch');
                setTimeout(function () { card.classList.remove('is-glitch'); }, 650);
              }
            }
          });
        }, (quote._kdIndex || 0) * 300);
      });
    }, { threshold: 0.4 });

    cards.forEach(function (card, i) {
      const quote = card.querySelector('.testimonial-card__quote');
      if (!quote || quote.children.length) return;

      const finalText = quote.textContent.replace(/\s+/g, ' ').trim();
      const pool = finalText.replace(/[^A-Za-z]/g, '');
      if (!finalText || !pool) return;

      quote._kdFinal = finalText;
      quote._kdPool = pool;
      quote._kdIndex = i;

      quote.setAttribute('aria-label', finalText);
      quote.style.minHeight = quote.offsetHeight + 'px';
      quote.textContent = KD.scrambledString(finalText, pool);

      observer.observe(quote);
    });
  });
};
