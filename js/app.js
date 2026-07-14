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
  if (window.activeEmployee) {
    const emp = window.activeEmployee;
    const details = `${emp.fullName}\n${emp.designation} — ${emp.company}\n📞 ${emp.phoneFormatted}\n✉ ${emp.email}\n🌐 ${emp.website}\n📍 ${emp.address.street}, ${emp.address.city}`;
    copyToClipboard(details, 'Contact details copied!');
  }
  addRipple(this);
});

/* ─── Share Button ──────────────────────────────────────────── */
document.getElementById('share-btn')?.addEventListener('click', async function () {
  if (!window.activeEmployee) return;
  const emp = window.activeEmployee;
  const shareData = {
    title: `${emp.fullName} — ${emp.designation} | ${emp.company}`,
    text:  `Connect with ${emp.fullName}, ${emp.designation} at ${emp.company}.`,
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
  document.getElementById('phone-card')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.activeEmployee) {
      window.location.href = `tel:${window.activeEmployee.phone}`;
    }
  });

  document.getElementById('email-card')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.activeEmployee) {
      window.location.href = `mailto:${window.activeEmployee.email}`;
    }
  });

  document.getElementById('website-card')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.activeEmployee) {
      window.open(`https://${window.activeEmployee.website}`, '_blank', 'noopener noreferrer');
    }
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

async function renderDirectory() {
  const grid = document.getElementById('directory-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="color:var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 2rem;">Loading directory...</div>';

  try {
    const response = await fetch('data/employees.json');
    const data = await response.json();
    const employees = data.employees || {};

    grid.innerHTML = '';
    Object.keys(employees).forEach(key => {
      const emp = employees[key];
      const card = document.createElement('article');
      card.className = 'directory-card';
      card.setAttribute('role', 'listitem');

      // Check if image exists
      const photoHtml = emp.profileImg 
        ? `<img class="dir-profile-img" src="${emp.profileImg}" alt="${emp.fullName} photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
           <div class="dir-initials" style="display:none;" data-initials="${emp.initials}"></div>`
        : `<div class="dir-initials" data-initials="${emp.initials}"></div>`;

      card.innerHTML = `
        <div class="dir-photo-container">
          ${photoHtml}
        </div>
        <h2 class="dir-name">${emp.fullName}</h2>
        <p class="dir-title">${emp.designation}</p>
        <div class="dir-actions">
          <a href="?user=${key}" class="dir-btn dir-btn--primary">View Card</a>
          <a href="?user=${key}&qr=true" class="dir-btn dir-btn--glass">View QR</a>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading directory", error);
    grid.innerHTML = '<div style="color:var(--coral); grid-column: 1/-1; text-align:center; padding: 2rem;">Failed to load employee list.</div>';
  }
}

/* ─── Load Employee Data Dynamically ───────────────────────── */
let activeEmployee = null;

async function loadEmployeeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const userKey = urlParams.get('user');
  let companyServices = [];

  if (!userKey) {
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('directory-view').style.display = 'block';
    renderDirectory();
    return;
  } else {
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('directory-view').style.display = 'none';
  }

  try {
    const response = await fetch('data/employees.json');
    const data = await response.json();
    activeEmployee = data.employees[userKey.toLowerCase()] || data.employees['kartik'];
    companyServices = data.companyServices || [];
  } catch (error) {
    console.error('Error loading employee data, using fallback:', error);
    // Hardcoded fallback for Kartik
    activeEmployee = {
      firstName: "Kartik",
      lastName: "Verma",
      fullName: "Kartik Verma",
      designation: "Tech Expert",
      company: "Xenelasia Consultancy",
      bio: "Helping businesses leverage technology, AI, cybersecurity, cloud solutions, and digital transformation to build smarter and more secure systems.",
      phone: "+918126338976",
      phoneFormatted: "+91 81263 38976",
      email: "kartik.verma.cs@gmail.com",
      website: "xcplllp.com",
      linkedin: "https://www.linkedin.com/in/kartik-verma-9a5776297/",
      address: {
        street: "1908, Iconic Corenthum Tower",
        city: "Sector 62, Noida",
        state: "Uttar Pradesh",
        country: "India",
        postal: "201309"
      },
      skills: [
        { "icon": "🤖", "name": "Artificial Intelligence" },
        { "icon": "🔐", "name": "Cyber Security" },
        { "icon": "💻", "name": "Web Development" },
        { "icon": "⚡", "name": "Automation" },
        { "icon": "🚀", "name": "Digital Transformation" }
      ],
      services: [
        { "icon": "🤖", "name": "AI Solutions" },
        { "icon": "💻", "name": "Software Development" },
        { "icon": "🛡️", "name": "Cyber Security" }
      ],
      profileImg: "assets/profile/profile.jpg",
      initials: "KV"
    };
    companyServices = activeEmployee.services;
  }

  window.activeEmployee = activeEmployee;

  // 1. Populate Text fields
  document.getElementById('profile-name').textContent = activeEmployee.fullName;
  document.getElementById('profile-designation').textContent = activeEmployee.designation;
  document.getElementById('profile-bio').textContent = activeEmployee.bio;

  // 2. Profile image and initials fallback
  const img = document.getElementById('profile-img');
  const initialsDiv = document.getElementById('profile-initials');
  if (img && initialsDiv) {
    initialsDiv.textContent = activeEmployee.initials;
    initialsDiv.setAttribute('data-initials', activeEmployee.initials);
    img.alt = `${activeEmployee.fullName} profile photo`;
    img.src = activeEmployee.profileImg;
  }

  // 3. Contact information
  const phoneVal = document.getElementById('phone-value');
  if (phoneVal) phoneVal.textContent = activeEmployee.phoneFormatted;
  const emailVal = document.getElementById('email-value');
  if (emailVal) emailVal.textContent = activeEmployee.email;
  const webVal = document.getElementById('website-value');
  if (webVal) webVal.textContent = activeEmployee.website;
  const addrVal = document.getElementById('address-value');
  if (addrVal) addrVal.textContent = `${activeEmployee.address.street}, ${activeEmployee.address.city}, ${activeEmployee.address.state}`;

  // Update contact card href links
  const phoneCard = document.getElementById('phone-card');
  if (phoneCard) phoneCard.href = `tel:${activeEmployee.phone}`;
  const emailCard = document.getElementById('email-card');
  if (emailCard) emailCard.href = `mailto:${activeEmployee.email}`;
  const webCard = document.getElementById('website-card');
  if (webCard) webCard.href = `https://${activeEmployee.website}`;
  const addrCard = document.getElementById('address-card');
  if (addrCard) addrCard.href = `https://maps.google.com/?q=${encodeURIComponent(`${activeEmployee.address.street} ${activeEmployee.address.city}`)}`;

  // 4. Skills
  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid) {
    skillsGrid.innerHTML = '';
    activeEmployee.skills.forEach(skill => {
      const chip = document.createElement('div');
      chip.className = 'skill-chip';
      chip.setAttribute('role', 'listitem');
      chip.innerHTML = `<span aria-hidden="true">${skill.icon}</span><span>${skill.name}</span>`;
      skillsGrid.appendChild(chip);
    });
  }

  // 5. Services (Loaded from corporate services list)
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid) {
    servicesGrid.innerHTML = '';
    companyServices.forEach(service => {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="service-icon" aria-hidden="true">${service.icon}</div>
        <span class="service-name">${service.name}</span>
      `;
      servicesGrid.appendChild(card);
    });
  }

  // 6. Social Links
  const socialGrid = document.getElementById('social-grid');
  if (socialGrid) {
    socialGrid.innerHTML = '';

    // List of supported social profiles
    const socials = [
      {
        key: 'linkedin',
        name: 'LinkedIn',
        class: 'social-btn--linkedin',
        svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2"/></svg>`
      },
      {
        key: 'github',
        name: 'GitHub',
        class: 'social-btn--github',
        svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      },
      {
        key: 'email',
        name: 'Email',
        class: 'social-btn--email',
        svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/></svg>`
      },
      {
        key: 'whatsapp',
        name: 'WhatsApp',
        class: 'social-btn--whatsapp',
        svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      }
    ];

    socials.forEach(social => {
      let value = '';
      if (social.key === 'email') {
        value = `mailto:${activeEmployee.email}`;
      } else if (activeEmployee[social.key]) {
        value = activeEmployee[social.key];
      }

      if (value) {
        const btn = document.createElement('a');
        btn.className = `social-btn ${social.class}`;
        btn.href = value;
        btn.target = social.key === 'email' ? '_self' : '_blank';
        btn.setAttribute('rel', 'noopener noreferrer');
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('aria-label', `${social.name} profile`);
        btn.innerHTML = `
          <div class="social-icon-wrap">
            ${social.svg}
          </div>
          <span class="social-label">${social.name}</span>
        `;
        socialGrid.appendChild(btn);
      }
    });
  }

  // 7. Update SEO Meta & Page titles dynamically
  document.title = `${activeEmployee.fullName} — ${activeEmployee.designation} | ${activeEmployee.company}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `${activeEmployee.fullName}, ${activeEmployee.designation} at ${activeEmployee.company}. ${activeEmployee.bio}`);
  }

  // 8. Dispatch event to notify qr.js and contact.js
  document.dispatchEvent(new CustomEvent('employeeLoaded', { detail: activeEmployee }));
}

/* ─── Initialise Everything ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Load employee data first
  await loadEmployeeData();

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
