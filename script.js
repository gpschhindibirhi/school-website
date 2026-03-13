/* ============================================================
   GPS Chhindibirhi — Main Script
   Improvements: mobile nav overlay, slide counter, back-to-top,
   toast notifications, header scroll shadow, debounce, 
   better event delegation, robust preference persistence.
   ============================================================ */

'use strict';

// ====== Utility Helpers ======
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function showToast(message, duration = 2200) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ====== Language Toggle ======
function toggleLanguage() {
  const body = document.body;
  const currentLang = body.getAttribute('data-lang');
  const newLang = currentLang === 'hi' ? 'en' : 'hi';
  body.setAttribute('data-lang', newLang);
  try { localStorage.setItem('preferred-language', newLang); } catch(e) {}

  const msg = newLang === 'en' ? 'Switched to English' : 'हिंदी में बदला गया';
  showToast(msg);
}

// ====== Theme Toggle ======
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  try { localStorage.setItem('preferred-theme', newTheme); } catch(e) {}

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = newTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
  }

  // Update meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#1e40af');
  }
}

// ====== Load Saved Preferences ======
document.addEventListener('DOMContentLoaded', () => {
  let savedLang = 'hi';
  let savedTheme = 'light';
  try {
    savedLang  = localStorage.getItem('preferred-language') || 'hi';
    savedTheme = localStorage.getItem('preferred-theme')   || 'light';
  } catch(e) {}

  document.body.setAttribute('data-lang',  savedLang);
  document.body.setAttribute('data-theme', savedTheme);

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = savedTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
  }
});

// ====== Header Scroll Shadow ======
const header = document.getElementById('siteHeader');
if (header) {
  const onScroll = debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, 50);
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ====== Back to Top Button ======
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  const toggleBackToTop = debounce(() => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 320);
  }, 80);
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== Navigation Toggle (Mobile Slide-in) ======
function toggleNav() {
  const nav     = document.getElementById('mainNav');
  const overlay = document.getElementById('navOverlay');
  const toggle  = document.querySelector('.nav-toggle');

  if (!nav) return;
  const isOpen = nav.classList.toggle('active');

  if (overlay) overlay.classList.toggle('active', isOpen);
  if (toggle)  toggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';

  // Trap focus inside nav when open
  if (isOpen) {
    const firstLink = nav.querySelector('a, button');
    if (firstLink) setTimeout(() => firstLink.focus(), 100);
  }
}

// Close nav on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const nav = document.getElementById('mainNav');
    if (nav && nav.classList.contains('active')) toggleNav();
  }
});

// Close nav when a link is clicked (mobile)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-content a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav && nav.classList.contains('active')) toggleNav();
    });
  });
});

// ====== Active Nav Link Highlight ======
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Sidebar nav
  document.querySelectorAll('.nav-content a').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Bottom mobile nav
  document.querySelectorAll('.mnav-item').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// ====== Hero Slider ======
let currentSlide   = 0;
let autoSlideInterval;
const slides       = document.querySelectorAll('.hero-slider img');
const totalSlides  = slides.length;

function updateSlideCounter() {
  const counter = document.getElementById('slideCounter');
  if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
}

function createSliderDots() {
  const dotsContainer = document.getElementById('sliderDots');
  if (!dotsContainer || totalSlides === 0) return;

  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className  = 'slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goToSlide(i); restartAutoSlide(); });
    dotsContainer.appendChild(dot);
  }
}

function showSlide(n) {
  if (totalSlides === 0) return;

  slides.forEach(s => s.classList.remove('active'));
  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach(d => { d.classList.remove('active'); d.setAttribute('aria-selected', 'false'); });

  currentSlide = (n + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');

  if (dots[currentSlide]) {
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-selected', 'true');
  }

  updateSlideCounter();
}

function changeSlide(direction) { showSlide(currentSlide + direction); }
function goToSlide(n) { showSlide(n); }

function startAutoSlide() {
  if (autoSlideInterval) return;
  autoSlideInterval = setInterval(() => changeSlide(1), 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = null;
}

function restartAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

document.addEventListener('DOMContentLoaded', () => {
  if (totalSlides === 0) return;
  createSliderDots();
  updateSlideCounter();
  startAutoSlide();

  const slider = document.getElementById('heroSlider');
  if (slider) {
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
  }
});

// ====== Touch / Swipe Support for Slider ======
let touchStartX = 0;
let touchEndX   = 0;

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      changeSlide(diff > 0 ? 1 : -1);
      restartAutoSlide();
    }
  }, { passive: true });
});

// ====== Keyboard Arrow Navigation for Slider ======
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { changeSlide(-1); restartAutoSlide(); }
    else if (e.key === 'ArrowRight') { changeSlide(1); restartAutoSlide(); }
  });
});

// ====== Smooth Scroll for Anchor Links ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

// ====== Lazy Loading Fallback ======
document.addEventListener('DOMContentLoaded', () => {
  if (!('loading' in HTMLImageElement.prototype)) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
});

// ====== Handle Image Loading Errors ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      if (!this.dataset.errorHandled) {
        this.dataset.errorHandled = 'true';
        console.warn('Image failed to load:', this.src);
      }
    });
  });
});

// ====== Scroll-reveal for Content Sections ======
document.addEventListener('DOMContentLoaded', () => {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.content-section').forEach(section => {
    section.style.animationPlayState = 'paused';
    observer.observe(section);
  });
});

// ====== Form Validation Helpers (for contact page) ======
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

function validateRequired(value) {
  return value.trim().length > 0;
}

// ====== Module Exports (Node / CommonJS compat) ======
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleLanguage,
    toggleTheme,
    toggleNav,
    changeSlide,
    goToSlide,
    scrollToTop,
    showToast,
    validateEmail,
    validatePhone,
    validateRequired,
  };
}