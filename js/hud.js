/* ==========================================================
   HUD.JS  (Phase 6)
   Purpose: Two small "interface" details that run on real data:
   1. A thin orange progress bar at the very top that fills as
      you scroll down the page.
   2. A tiny readout in the bottom-left corner (desktop only):
      scroll %, current section, cursor X/Y and your local time.
   The readout is decorative (aria-hidden) and ignores clicks.
   Nothing here animates by itself, it only reflects scrolling,
   mouse movement and the clock, so it is fine with reduced-motion.
============================================================= */

window.KD = window.KD || {};

KD.initHud = function initHud() {
  const pad = function (n, len) { return String(n).padStart(len, '0'); };

  /* -----------------------------------------
     SCROLL PROGRESS BAR
  ------------------------------------------ */
  const bar = document.createElement('div');
  bar.className = 'kd-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span class="kd-progress__fill"></span>';
  document.body.appendChild(bar);
  const barFill = bar.firstChild;

  /* -----------------------------------------
     CORNER READOUT (mouse devices only)
  ------------------------------------------ */
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let outScroll = null;
  let outSec = null;
  let outPos = null;
  let outTime = null;

  if (hasMouse) {
    const hud = document.createElement('div');
    hud.className = 'kd-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML =
      '<span class="kd-hud__item"><b>SCROLL</b><span data-hud="scroll">000%</span></span>' +
      '<span class="kd-hud__item"><b>SEC</b><span data-hud="sec">--</span></span>' +
      '<span class="kd-hud__item"><b>POS</b><span data-hud="pos">X 0000 Y 0000</span></span>' +
      '<span class="kd-hud__item"><b>LOCAL</b><span data-hud="time">00:00:00</span></span>';
    document.body.appendChild(hud);

    outScroll = hud.querySelector('[data-hud="scroll"]');
    outSec = hud.querySelector('[data-hud="sec"]');
    outPos = hud.querySelector('[data-hud="pos"]');
    outTime = hud.querySelector('[data-hud="time"]');
  }

  const sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  /* -----------------------------------------
     SCROLL: progress bar, % and current section
  ------------------------------------------ */
  let scrollQueued = false;

  function updateScroll() {
    scrollQueued = false;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

    barFill.style.transform = 'scaleX(' + ratio + ')';

    if (!outScroll) return;

    outScroll.textContent = pad(Math.round(ratio * 100), 3) + '%';

    // Current section = the last one whose top has passed 40% of the viewport
    let current = 0;
    const line = window.innerHeight * 0.4;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) current = i;
    }

    if (sections.length) {
      outSec.textContent =
        pad(current + 1, 2) + '/' + pad(sections.length, 2) + ' ' +
        sections[current].id.toUpperCase();
    }
  }

  function queueScroll() {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  }

  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);
  updateScroll();

  if (!outPos) return;

  /* -----------------------------------------
     CURSOR POSITION
  ------------------------------------------ */
  let moveQueued = false;
  let mx = 0;
  let my = 0;

  document.addEventListener('mousemove', function (event) {
    mx = event.clientX;
    my = event.clientY;
    if (!moveQueued) {
      moveQueued = true;
      requestAnimationFrame(function () {
        moveQueued = false;
        outPos.textContent = 'X ' + pad(mx, 4) + ' Y ' + pad(my, 4);
      });
    }
  });

  /* -----------------------------------------
     LOCAL TIME
  ------------------------------------------ */
  function tickClock() {
    const d = new Date();
    outTime.textContent = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
  }

  tickClock();
  setInterval(tickClock, 1000);
};
