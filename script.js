// ====== Language Toggle ======
function toggleLanguage() {
  const body = document.body;
  const currentLang = body.getAttribute('data-lang');
  const newLang = currentLang === 'hi' ? 'en' : 'hi';
  body.setAttribute('data-lang', newLang);
  localStorage.setItem('preferred-language', newLang);
}

// ====== Theme Toggle ======
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('preferred-theme', newTheme);
  
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.innerHTML = newTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
}

// ====== Load Saved Preferences ======
window.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('preferred-language') || 'hi';
  const savedTheme = localStorage.getItem('preferred-theme') || 'light';
  
  document.body.setAttribute('data-lang', savedLang);
  document.body.setAttribute('data-theme', savedTheme);
  
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = savedTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
  }
});

// ====== Navigation Toggle for Mobile ======
function toggleNav() {
  const nav = document.getElementById('mainNav');
  const overlay = document.querySelector('.nav-overlay');
  nav.classList.toggle('active');
  
  // Toggle overlay
  if (nav.classList.contains('active')) {
    // Create overlay if it doesn't exist
    if (!overlay) {
      const newOverlay = document.createElement('div');
      newOverlay.className = 'nav-overlay';
      document.body.appendChild(newOverlay);
      // Close nav when clicking overlay
      newOverlay.addEventListener('click', toggleNav);
    }
    // Show overlay
    setTimeout(() => {
      document.querySelector('.nav-overlay').classList.add('active');
    }, 0);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  } else {
    // Hide overlay
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Close nav on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const nav = document.getElementById('mainNav');
    if (nav && nav.classList.contains('active')) {
      toggleNav();
    }
  }
});

// ====== Hero Slider ======
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slider img');
const totalSlides = slides.length;

// Create slider dots
function createSliderDots() {
  const dotsContainer = document.getElementById('sliderDots');
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goToSlide(i);
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dotsContainer.appendChild(dot);
  }
}

// Show specific slide
function showSlide(n) {
  if (slides.length === 0) return;
  
  slides.forEach(slide => slide.classList.remove('active'));
  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach(dot => dot.classList.remove('active'));
  
  currentSlide = (n + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');
  if (dots[currentSlide]) {
    dots[currentSlide].classList.add('active');
  }
}

// Change slide by direction
function changeSlide(direction) {
  showSlide(currentSlide + direction);
}

// Go to specific slide
function goToSlide(n) {
  showSlide(n);
}

// Auto slide functionality
let autoSlideInterval;

function startAutoSlide() {
  autoSlideInterval = setInterval(() => changeSlide(1), 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

function restartAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// Initialize slider when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  if (slides.length > 0) {
    createSliderDots();
    startAutoSlide();
    
    // Pause on hover
    const slider = document.getElementById('heroSlider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAutoSlide);
      slider.addEventListener('mouseleave', startAutoSlide);
    }
  }
});

// ====== Touch Support for Slider ======
let touchStartX = 0;
let touchEndX = 0;

window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
});

function handleSwipe() {
  const swipeThreshold = 50;
  if (touchStartX - touchEndX > swipeThreshold) {
    changeSlide(1);
    restartAutoSlide();
  }
  if (touchEndX - touchStartX > swipeThreshold) {
    changeSlide(-1);
    restartAutoSlide();
  }
}

// ====== Smooth Scroll for Navigation ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// ====== Close Mobile Nav on Link Click ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-content a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav) {
        nav.classList.remove('active');
      }
    });
  });
});

// ====== Add Active Class to Current Page Nav Link ======
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-content a').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === 'index.html' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// ====== Accessibility: Keyboard Navigation for Slider ======
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      changeSlide(-1);
      restartAutoSlide();
    } else if (e.key === 'ArrowRight') {
      changeSlide(1);
      restartAutoSlide();
    }
  });
});

// ====== Performance: Lazy Loading Images ======
document.addEventListener('DOMContentLoaded', () => {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
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

// ====== Animation on Scroll (Optional Enhancement) ======
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.content-section').forEach(section => {
    observer.observe(section);
  });
}

// Call on DOM load if you want scroll animations
// Uncomment the line below to enable
// window.addEventListener('DOMContentLoaded', observeElements);

// ====== Form Validation Helper (for contact page) ======
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

// Export functions for use in other pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleLanguage,
    toggleTheme,
    toggleNav,
    changeSlide,
    goToSlide,
    validateEmail,
    validatePhone
  };
}