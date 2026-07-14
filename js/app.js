/**
 * app.js — Core Application Logic
 * Xenelasia Consultancy Digital Business Card
 * ============================================================
 */

'use strict';

/* ─── Theme Management ──────────────────────────────────────── */
const ThemeManager = (() => {
  const STORAGE_KEY = 'xcp-theme';
  const toggle = document.getElementById('theme-toggle');
  const thumb  = toggle?.querySelector('.theme-toggle__thumb');

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (thumb) {
      thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  function init() {
    apply(getPreferred());
    toggle?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
      addRipple(toggle);
    });
  }

  return { init };
})();

/* ─── Mouse Glow Effect ─────────────────────────────────────── */
const MouseGlow = (() => {
  const glow = document.querySelector('.mouse-glow');

  function init() {
    if (!glow) return;
    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
      });
    } else {
      glow.style.display = 'none';
    }
  }

  return { init };
})();

/* ─── Particle Network Background ───────────────────────────── */
const ParticleSystem = (() => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let W, H;

  const CONFIG = {
    count: window.innerWidth < 768 ? 35 : 60,
    maxDist: 130,
    speed: 0.35,
    radius: 1.5,
    colors: ['#FF4D6D', '#D63AF9', '#7B2FBE', '#3B82F6'],
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
      r:  Math.random() * CONFIG.radius + 0.5,
      color,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Draw connections
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
    draw();

    window.addEventListener('resize', () => {
      resize();
      particles = Array.from({ length: CONFIG.count }, createParticle);
    });
  }

  return { init };
})();

/* ─── Scroll Reveal (IntersectionObserver) ──────────────────── */
const ScrollReveal = (() => {
  function init() {
    const targets = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ─── Ripple Effect ─────────────────────────────────────────── */
function addRipple(element, event) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');

  const rect   = element.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  ripple.style.width  = ripple.style.height = size + 'px';

  if (event) {
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top  = (event.clientY - rect.top  - size / 2) + 'px';
  } else {
    ripple.style.left = '50%';
    ripple.style.top  = '50%';
    ripple.style.transform = 'translate(-50%,-50%)';
  }

  element.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

document.querySelectorAll('.ripple-container').forEach(btn => {
  btn.addEventListener('click', (e) => addRipple(btn, e));
});

/* ─── Toast Notification ────────────────────────────────────── */
const Toast = (() => {
  const el = document.getElementById('toast');
  let timeoutId;

  function show(message, duration = 2500) {
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => el.classList.remove('show'), duration);
  }

  return { show };
})();

// Expose globally so deferred scripts (qr.js, contact.js) can use these
window.Toast     = Toast;
window.addRipple = addRipple;

/* ─── Copy Utilities ────────────────────────────────────────── */
async function copyToClipboard(text, label = 'Copied!') {
  try {
    await navigator.clipboard.writeText(text);
    Toast.show(`✅ ${label}`);
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    Toast.show(`✅ ${label}`);
  }
}

/* ─── Copy Contact Details Button ───────────────────────────── */
document.getElementById('copy-contact-btn')?.addEventListener('click', function () {
  const details = `Kartik Verma\nTech Expert — Xenelasia Consultancy\n📞 +91 8126338976\n✉ kartik.verma.cs@gmail.com\n🌐 xcplllp.com\n📍 1908, Iconic Corenthum Tower, Sector 62, Noida`;
  copyToClipboard(details, 'Contact details copied!');
  addRipple(this);
});

/* ─── Share Button ──────────────────────────────────────────── */
document.getElementById('share-btn')?.addEventListener('click', async function () {
  const shareData = {
    title: 'Kartik Verma — Tech Expert | Xenelasia Consultancy',
    text:  'Connect with Kartik Verma, Tech Expert at Xenelasia Consultancy. AI, Cybersecurity & Digital Transformation.',
    url:   window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== 'AbortError') copyToClipboard(window.location.href, 'Profile URL copied!');
    }
  } else {
    copyToClipboard(window.location.href, 'Profile URL copied!');
  }

  addRipple(this);
});

/* ─── Parallax Effect ───────────────────────────────────────── */
const Parallax = (() => {
  function init() {
    const blobs = document.querySelectorAll('.aurora-blob');
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      blobs.forEach((blob, i) => {
        const factor = (i % 2 === 0 ? 0.06 : -0.04) * (i + 1);
        blob.style.transform = `translateY(${scrollY * factor}px)`;
      });
    }, { passive: true });
  }

  return { init };
})();

/* ─── 3D Card Tilt Effect ───────────────────────────────────── */
const CardTilt = (() => {
  function init() {
    const cards = document.querySelectorAll('.service-card, .contact-item');
    if (!window.matchMedia('(pointer: fine)').matches) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -5;
        const rotateY = ((x - cx) / cx) *  5;
        card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  return { init };
})();

/* ─── Shine Overlay on Cards ────────────────────────────────── */
function addShineOverlays() {
  document.querySelectorAll('.glass-card').forEach(card => {
    const shine = document.createElement('div');
    shine.className = 'shine';
    card.appendChild(shine);
  });
}

/* ─── Contact item click handlers ───────────────────────────── */
function initContactInteractions() {
  document.getElementById('phone-card')?.addEventListener('click', () => {
    window.location.href = 'tel:+918126338976';
  });

  document.getElementById('email-card')?.addEventListener('click', () => {
    window.location.href = 'mailto:kartik.verma.cs@gmail.com';
  });

  document.getElementById('website-card')?.addEventListener('click', () => {
    window.open('https://xcplllp.com', '_blank', 'noopener noreferrer');
  });
}

/* ─── Profile Image Fallback ────────────────────────────────── */
function initProfileFallback() {
  const img      = document.getElementById('profile-img');
  const initials = document.getElementById('profile-initials');

  if (!img) return;

  // On successful load — show image, hide initials
  img.addEventListener('load', () => {
    img.style.display      = 'block';
    if (initials) initials.style.display = 'none';
  });

  // On error — keep initials visible, hide broken img
  img.addEventListener('error', () => {
    img.style.display = 'none';
    if (initials) initials.style.display = 'flex';
  });

  // Trigger load attempt
  const src = img.src;
  img.src = '';
  img.src = src;
}

/* ─── Initialise Everything ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Page enter
  document.body.classList.add('loaded');

  ThemeManager.init();
  MouseGlow.init();
  ScrollReveal.init();
  Parallax.init();
  CardTilt.init();
  addShineOverlays();
  initContactInteractions();
  initProfileFallback();

  // Animate topbar logo on load
  document.querySelector('.topbar')?.classList.add('page-enter');

  // Start particles (defer for performance)
  requestIdleCallback
    ? requestIdleCallback(() => ParticleSystem.init())
    : setTimeout(() => ParticleSystem.init(), 200);
});

/* ─── Keyboard Navigation ───────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});
