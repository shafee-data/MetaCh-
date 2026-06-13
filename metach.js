/**
 * MetaCH — JavaScript
 * Neural canvas, ring animation, scroll reveals, nav behaviour, ticker, interactivity
 */

'use strict';

/* ════════════════════════════════════════
   1. NEURAL CANVAS  (animated node mesh)
   ════════════════════════════════════════ */
const NeuralCanvas = (() => {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const config = {
    nodeCount: 56,
    connectionDist: 160,
    nodeSpeed: 0.28,
    nodeRadius: 2.2,
    colorNode:   'rgba(123, 111, 240, 0.7)',
    colorLine:   (alpha) => `rgba(78, 203, 161, ${alpha})`,
  };

  let nodes = [];
  let W, H;
  let raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: config.nodeCount }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * config.nodeSpeed,
      vy: (Math.random() - 0.5) * config.nodeSpeed,
      r:  Math.random() * config.nodeRadius + 1,
      pulse: Math.random() * Math.PI * 2,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // Move nodes
    nodes.forEach(n => {
      n.x  += n.vx;
      n.y  += n.vy;
      n.pulse += 0.018;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < config.connectionDist) {
          const alpha = (1 - dist / config.connectionDist) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = config.colorLine(alpha);
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulse = Math.sin(n.pulse) * 0.5 + 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = config.colorNode;
      ctx.fill();
    });

    raf = requestAnimationFrame(step);
  }

  function init() {
    resize();
    createNodes();
    step();
    window.addEventListener('resize', () => { resize(); });
  }

  return { init };
})();

/* ════════════════════════════════════════
   2. COGNITIVE RING  (score counter)
   ════════════════════════════════════════ */
const CognitiveRing = (() => {
  const scoreEl = document.querySelector('.ring-score');
  if (!scoreEl) return;

  const TARGET = 87;
  let current  = 0;
  let started  = false;

  function animateScore() {
    if (current < TARGET) {
      current = Math.min(current + 1.4, TARGET);
      scoreEl.textContent = Math.round(current);
      requestAnimationFrame(animateScore);
    } else {
      scoreEl.textContent = TARGET;
    }
  }

  function init() {
    // Start counter when hero visible (IntersectionObserver)
    const hero = document.querySelector('.hero__visual');
    if (!hero) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        animateScore();
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(hero);
  }

  return { init };
})();

/* ════════════════════════════════════════
   3. NAV  (scroll-aware)
   ════════════════════════════════════════ */
const Nav = (() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  function init() {
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();

/* ════════════════════════════════════════
   4. SCROLL REVEAL
   ════════════════════════════════════════ */
const ScrollReveal = (() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function init() {
    els.forEach(el => obs.observe(el));
  }

  return { init };
})();

/* ════════════════════════════════════════
   5. METRICS TICKER  (clone for seamless loop)
   ════════════════════════════════════════ */
const Ticker = (() => {
  const ticker = document.querySelector('.metrics-ticker');
  if (!ticker) return;

  function init() {
    // Clone children for seamless infinite scroll
    const items = [...ticker.children];
    items.forEach(item => ticker.appendChild(item.cloneNode(true)));
  }

  return { init };
})();

/* ════════════════════════════════════════
   6. DASHBOARD — interactive nav items
   ════════════════════════════════════════ */
const Dashboard = (() => {
  const navItems = document.querySelectorAll('.dash-nav-item');
  if (!navItems.length) return;

  function init() {
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  return { init };
})();

/* ════════════════════════════════════════
   7. ANIMATED MINI BARS  (staggered)
   ════════════════════════════════════════ */
const MiniBars = (() => {
  function init() {
    const bars = document.querySelectorAll('.mini-bar');
    bars.forEach((bar, i) => {
      bar.style.animationDelay = `${i * 0.08}s`;
    });
  }

  return { init };
})();

/* ════════════════════════════════════════
   8. RING SVG path lengths (progress arcs)
   ════════════════════════════════════════ */
const RingArcs = (() => {
  function init() {
    // Set dashoffset for each arc segment dynamically
    const arcConfigs = [
      { selector: '.arc--focus',  value: 0.82 },
      { selector: '.arc--energy', value: 0.68 },
      { selector: '.arc--calm',   value: 0.91 },
    ];

    arcConfigs.forEach(({ selector, value }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const len = el.getTotalLength?.();
      if (!len) return;
      el.style.strokeDasharray  = len;
      el.style.strokeDashoffset = len * (1 - value);
    });
  }

  return { init };
})();

/* ════════════════════════════════════════
   9. SPARKLINES  — animate fill on scroll
   ════════════════════════════════════════ */
const Sparklines = (() => {
  function init() {
    const widgets = document.querySelectorAll('.dash-widget');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const sparks = e.target.querySelectorAll('.spark');
        sparks.forEach((sp, i) => {
          setTimeout(() => sp.classList.add('active'), i * 60);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    widgets.forEach(w => obs.observe(w));
  }

  return { init };
})();

/* ════════════════════════════════════════
   10. MOUSE PARALLAX on ring badges
   ════════════════════════════════════════ */
const Parallax = (() => {
  const badges = document.querySelectorAll('.ring-badge');
  if (!badges.length) return;

  function init() {
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      badges.forEach((b, i) => {
        const depth = (i + 1) * 6;
        b.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
      });
    }, { passive: true });
  }

  return { init };
})();

/* ════════════════════════════════════════
   11. SMOOTH ANCHOR SCROLL
   ════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ════════════════════════════════════════
   12. STATS COUNTER  (hero strip)
   ════════════════════════════════════════ */
const StatsCounter = (() => {
  const stats = [
    { el: document.querySelector('[data-count="98"]'),  target: 98,   suffix: '%' },
    { el: document.querySelector('[data-count="12k"]'), target: 12000, suffix: 'k', display: v => Math.round(v / 1000) + 'k' },
    { el: document.querySelector('[data-count="4.9"]'), target: 4.9,  suffix: '★', step: 0.05 },
  ];

  function init() {
    const strip = document.querySelector('.hero__stats');
    if (!strip) return;

    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();

      stats.forEach(({ el, target, suffix, display, step }) => {
        if (!el) return;
        let v = 0;
        const s = step || (target > 100 ? target / 80 : target / 60);
        const tick = () => {
          v = Math.min(v + s, target);
          el.textContent = display ? display(v) : (Number.isInteger(target)
            ? Math.round(v) : v.toFixed(1)) + suffix;
          if (v < target) requestAnimationFrame(tick);
        };
        tick();
      });
    }, { threshold: 0.5 });

    obs.observe(strip);
  }

  return { init };
})();

/* ════════════════════════════════════════
   BOOT
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  NeuralCanvas?.init();
  Nav?.init();
  CognitiveRing?.init();
  ScrollReveal?.init();
  Ticker?.init();
  Dashboard?.init();
  MiniBars?.init();
  RingArcs?.init();
  Sparklines?.init();
  Parallax?.init();
  StatsCounter?.init();
  initSmoothScroll();
});
