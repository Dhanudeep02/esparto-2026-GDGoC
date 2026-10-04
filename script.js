
/**
 * ESPARTO 2026 - Official Brochure & Conference Interaction Engine
 * Google Developer Groups on Campus - HITAM (GDGoC HITAM)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  initAudioSystem();
  initThemeSystem();
  initModeSwitcher();
  initBrochureReader();
  initCountdownTimer();
  initAmbientCanvas();
  initTiltEffects();
  initAccordion();
  initRegistrationAndBadge();
  initPrintBrochure();
  initMobileMenu();
  initSmoothScroll();
  initMobileFloatingBar();
});

/* ==========================================================================
   1. AUDIO FEEDBACK SYSTEM (Web Audio API Synthesizer)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioSystem() {
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSoftClick(freq = 600, duration = 0.04) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  }

  function playSwoosh() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  }

  window.playSoftClick = playSoftClick;
  window.playSwoosh = playSwoosh;

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        getAudioContext();
        audioIcon.textContent = '🔊';
        showToast('Sound effects enabled 🔊');
        playSoftClick(750, 0.08);
      } else {
        audioIcon.textContent = '🔇';
        showToast('Sound effects muted 🔇');
      }
    });

    // Attach soft clicks to buttons
    document.querySelectorAll('button, .nav-item, .pill-tag').forEach(el => {
      el.addEventListener('mouseenter', () => playSoftClick(880, 0.02));
      el.addEventListener('click', () => playSoftClick(540, 0.05));
    });
  }
}

/* ==========================================================================
   2. THEME SWITCHER SYSTEM (Dark / Light Brochure)
   ========================================================================== */
function initThemeSystem() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      if (themeIcon) themeIcon.textContent = '☀️';
      localStorage.setItem('esparto_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      if (themeIcon) themeIcon.textContent = '🌙';
      localStorage.setItem('esparto_theme', 'dark');
    }
  }

  const savedTheme = localStorage.getItem('esparto_theme') || 'dark';
  setTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('theme-dark');
      setTheme(isDark ? 'light' : 'dark');
      if (window.playSoftClick) window.playSoftClick(700, 0.05);
      showToast(isDark ? 'Switched to Light Brochure Theme ☀️' : 'Switched to Dark Theme 🌙');
    });
  }
}

/* ==========================================================================
   3. MODE SWITCHER: BROCHURE READER vs FULL WEB VIEW
   ========================================================================== */
function initModeSwitcher() {
  const toggleBtn = document.getElementById('view-mode-toggle');
  const toggleLabel = document.getElementById('view-mode-label');
  const heroBrochureBtn = document.getElementById('hero-brochure-view-btn');
  const footerBrochureBtn = document.getElementById('footer-brochure-toggle');

  const brochureSection = document.getElementById('brochure-reader-wrapper');
  const mainFlow = document.getElementById('main-content-flow');

  let isBrochureMode = false;

  function setMode(brochureMode) {
    isBrochureMode = brochureMode;
    if (isBrochureMode) {
      brochureSection.style.display = 'block';
      mainFlow.style.display = 'none';
      toggleLabel.textContent = 'Web Landing';
      toggleBtn.classList.add('brochure-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Viewing Interactive Folded Brochure Mode 📖');
    } else {
      brochureSection.style.display = 'none';
      mainFlow.style.display = 'block';
      toggleLabel.textContent = 'Brochure View';
      toggleBtn.classList.remove('brochure-active');
      showToast('Viewing Full Web Landing Page 🌐');
    }
    if (window.playSwoosh) window.playSwoosh();
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => setMode(!isBrochureMode));
  }

  if (heroBrochureBtn) {
    heroBrochureBtn.addEventListener('click', () => setMode(true));
  }

  if (footerBrochureBtn) {
    footerBrochureBtn.addEventListener('click', () => setMode(true));
  }
}

/* ==========================================================================
   4. BROCHURE FLIP BOOK READER NAVIGATION
   ========================================================================== */
let currentBrochurePage = 0;
const totalBrochurePages = 5;

function goToBrochurePage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= totalBrochurePages) return;
  currentBrochurePage = pageIndex;

  const panels = document.querySelectorAll('.brochure-panel');
  const tabs = document.querySelectorAll('.reader-tab');
  const indicator = document.getElementById('reader-page-indicator');

  panels.forEach((p, idx) => {
    if (idx === currentBrochurePage) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  tabs.forEach((t, idx) => {
    if (idx === currentBrochurePage) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  if (indicator) {
    indicator.textContent = `Panel ${currentBrochurePage + 1} of ${totalBrochurePages}`;
  }

  if (window.playSwoosh) window.playSwoosh();
}

window.goToBrochurePage = goToBrochurePage;

function initBrochureReader() {
  const tabs = document.querySelectorAll('.reader-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPage = parseInt(tab.dataset.page, 10);
      goToBrochurePage(targetPage);
    });
  });

  const prevBtn = document.getElementById('reader-prev-btn');
  const nextBtn = document.getElementById('reader-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevPage = (currentBrochurePage - 1 + totalBrochurePages) % totalBrochurePages;
      goToBrochurePage(prevPage);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextPage = (currentBrochurePage + 1) % totalBrochurePages;
      goToBrochurePage(nextPage);
    });
  }

  // Cover internal buttons
  const coverExploreBtn = document.getElementById('cover-explore-btn');
  if (coverExploreBtn) {
    coverExploreBtn.addEventListener('click', () => goToBrochurePage(1));
  }

  const p1Prev = document.getElementById('p1-prev-btn');
  const p1Next = document.getElementById('p1-next-btn');
  if (p1Prev) p1Prev.addEventListener('click', () => goToBrochurePage(0));
  if (p1Next) p1Next.addEventListener('click', () => goToBrochurePage(2));

  const p2Prev = document.getElementById('p2-prev-btn');
  const p2Next = document.getElementById('p2-next-btn');
  if (p2Prev) p2Prev.addEventListener('click', () => goToBrochurePage(1));
  if (p2Next) p2Next.addEventListener('click', () => goToBrochurePage(3));

  const p3Prev = document.getElementById('p3-prev-btn');
  const p3Next = document.getElementById('p3-next-btn');
  if (p3Prev) p3Prev.addEventListener('click', () => goToBrochurePage(2));
  if (p3Next) p3Next.addEventListener('click', () => goToBrochurePage(4));

  const p4Prev = document.getElementById('p4-prev-btn');
  const p4Next = document.getElementById('p4-next-btn');
  if (p4Prev) p4Prev.addEventListener('click', () => goToBrochurePage(3));
  if (p4Next) p4Next.addEventListener('click', () => goToBrochurePage(0));
}

/* ==========================================================================
   5. COUNTDOWN TIMER (Target: October 9, 2026, 09:30 AM IST)
   ========================================================================== */
function initCountdownTimer() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  // 9 October 2026 09:30:00 IST (UTC +5:30)
  const targetDate = new Date('2026-10-09T09:30:00+05:30').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   6. AMBIENT PARTICLES CANVAS (Google 4-Color Ambient Background)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = [
    'rgba(66, 133, 244, 0.45)', // Blue
    'rgba(234, 67, 53, 0.45)',  // Red
    'rgba(251, 188, 5, 0.45)',  // Yellow
    'rgba(52, 168, 83, 0.45)'   // Green
  ];

  const particleCount = Math.min(36, Math.floor(width / 35));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.8 + 1.2,
      color: colors[i % colors.length],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   7. 3D CARD TILT EFFECT
   ========================================================================== */
function initTiltEffects() {
  // Only apply 3D tilt effects on desktop/laptop devices with fine pointer and hover support
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const tiltElements = document.querySelectorAll('[data-tilt], #hero-tilt-card');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   8. FAQ ACCORDION LOGIC
   ========================================================================== */
function initAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other accordion items for clean accordion behavior
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherTrigger = other.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        if (window.playSoftClick) window.playSoftClick(720, 0.04);
      }
    });
  });
}

/* ==========================================================================
   9. REGISTRATION SYSTEM & QR CODE (Official Google Registration Link)
   ========================================================================== */
const OFFICIAL_REGISTRATION_URL = 'https://script.google.com/macros/s/AKfycbyWW19qSK95FeVO35V-aX5Lr2ySIE-ZMLLqem_y6bIFRXLcVEzVtU4qooHetePr09dbHQ/exec?event=agentic-ai-workshop-hackathon';

function initRegistrationAndBadge() {
  const printQrCanvas = document.getElementById('print-qr-canvas');

  // Draw custom clean pixel QR Code onto canvas encoding the official registration link
  function drawCustomQR(canvas, seedText = OFFICIAL_REGISTRATION_URL) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Simple pseudo-random hash generator for authentic QR pattern
    let hash = 0;
    for (let i = 0; i < seedText.length; i++) {
      hash = (hash << 5) - hash + seedText.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 19;
    const cellSize = size / gridSize;

    function isFinderPattern(r, c) {
      if (r < 7 && c < 7) return true; // Top-left
      if (r < 7 && c >= gridSize - 7) return true; // Top-right
      if (r >= gridSize - 7 && c < 7) return true; // Bottom-left
      return false;
    }

    function drawFinder(startX, startY) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#4285F4';
      ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Fill QR pattern data
    ctx.fillStyle = '#1e293b';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!isFinderPattern(r, c)) {
          const pseudoBit = Math.abs(Math.sin((r * 31 + c * 17 + hash))) > 0.48;
          if (pseudoBit) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
        }
      }
    }
  }

  // Draw QR code on printable brochure canvas
  if (printQrCanvas) {
    drawCustomQR(printQrCanvas, OFFICIAL_REGISTRATION_URL);
  }
}

/* ==========================================================================
   10. PRINT / PDF BROCHURE HANDLER
   ========================================================================== */
function initPrintBrochure() {
  const printTriggers = document.querySelectorAll('.print-brochure-btn');

  printTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Opening Print / PDF Brochure Layout... 🖨️');
      setTimeout(() => {
        window.print();
      }, 300);
    });
  });
}

/* ==========================================================================
   11. MOBILE MENU TOGGLE & ACCESSIBILITY
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (toggle && drawer) {
    function closeMenu() {
      drawer.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      drawer.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.forEach(l => {
      l.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close when tapping outside drawer
    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !toggle.contains(e.target) && drawer.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close drawer when resized to desktop viewport
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && drawer.classList.contains('open')) {
        closeMenu();
      }
    });
  }
}

/* ==========================================================================
   12. SMOOTH SCROLL & ACTIVE NAV HIGHLIGHT
   ========================================================================== */
function initSmoothScroll() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(n => {
          if (n.getAttribute('href') === `#${id}`) {
            n.classList.add('active');
          } else {
            n.classList.remove('active');
          }
        });
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   13. MOBILE FLOATING ACTION BAR SCROLL VISIBILITY
   ========================================================================== */
function initMobileFloatingBar() {
  const floatBar = document.getElementById('mobile-floating-bar');
  const heroSection = document.getElementById('hero');
  const finalCta = document.getElementById('register');
  if (!floatBar) return;

  function updateFloatVisibility() {
    if (window.innerWidth > 768) {
      floatBar.classList.remove('visible');
      return;
    }

    const scrollY = window.pageYOffset;
    const heroThreshold = heroSection ? (heroSection.offsetTop + heroSection.offsetHeight * 0.45) : 350;
    const ctaTop = finalCta ? (finalCta.offsetTop - 200) : Infinity;

    // Show after leaving hero fold and hide when reaching final CTA button
    if (scrollY > heroThreshold && scrollY < ctaTop) {
      floatBar.classList.add('visible');
    } else {
      floatBar.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateFloatVisibility, { passive: true });
  window.addEventListener('resize', updateFloatVisibility, { passive: true });
  updateFloatVisibility();
}

/* ==========================================================================
   13. TOAST NOTIFICATION HELPER
   ========================================================================== */
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
