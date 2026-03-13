'use strict';

// ====== Gallery Data ======
const galleryData = {
  school_photos: {
    name_hi: 'विद्यालय फोटो',
    name_en: 'School Photos',
    icon: '🏫',
    subcategories: {
      inside:  { name_hi: 'अंदर का दृश्य',  name_en: 'Inside View',  count: 23, icon: '🏠' },
      outside: { name_hi: 'बाहर का दृश्य', name_en: 'Outside View', count: 93, icon: '🌳' }
    }
  },
  events: {
    name_hi: 'आयोजन',
    name_en: 'Events',
    icon: '🎉',
    subcategories: {
      independence_day_2024: { name_hi: 'स्वतंत्रता दिवस 2024', name_en: 'Independence Day 2024', count: 0, icon: '🇮🇳' },
      independence_day_2025: { name_hi: 'स्वतंत्रता दिवस 2025', name_en: 'Independence Day 2025', count: 0, icon: '🇮🇳' },
      sports_day_2025:       { name_hi: 'खेल दिवस 2025',       name_en: 'Sports Day 2025',       count: 0, icon: '⚽' }
    }
  },
  other_folders: {
    name_hi: 'अन्य गतिविधियां',
    name_en: 'Other Activities',
    icon: '📂',
    subcategories: {
      plantation_drive:    { name_hi: 'पौधरोपण अभियान',   name_en: 'Plantation Drive',    count: 0, icon: '🌱' },
      classroom_activities:{ name_hi: 'कक्षा गतिविधियां', name_en: 'Classroom Activities', count: 0, icon: '📖' },
      cultural_programs:   { name_hi: 'सांस्कृतिक कार्यक्रम', name_en: 'Cultural Programs', count: 0, icon: '🎭' }
    }
  }
};

// ====== State ======
let currentCategory    = '';
let currentSubcategory = '';
let currentImages      = [];
let currentImageIndex  = 0;

// ====== Init ======
document.addEventListener('DOMContentLoaded', () => {
  initCategories();
  setupBreadcrumb();
  setupModal();
  setupKeyboard();
});

// ====== Category Cards ======
function initCategories() {
  const cards = document.querySelectorAll('#mainCategories .gallery-category-card');
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    card.addEventListener('click', () => showSubcategories(cat));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSubcategories(cat); }
    });
  });
}

// ====== Breadcrumb ======
function setupBreadcrumb() {
  const homeBtn = document.getElementById('breadcrumbHome');
  if (homeBtn) homeBtn.addEventListener('click', showMainCategories);
}

function setBreadcrumb(label) {
  const bc      = document.getElementById('galleryBreadcrumb');
  const current = document.getElementById('breadcrumbCurrent');
  if (!bc || !current) return;
  bc.style.display = label ? 'flex' : 'none';
  current.textContent = label || '';
}

// ====== Show Main Categories ======
function showMainCategories() {
  document.getElementById('mainCategories').style.display = 'grid';
  document.getElementById('subcategoriesSection').style.display = 'none';
  document.getElementById('photoSection').style.display = 'none';
  setBreadcrumb('');
  currentCategory = '';
  currentSubcategory = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== Show Subcategories ======
function showSubcategories(category) {
  console.log('Showing subcategories for:', category);
  currentCategory = category;
  const data = galleryData[category];
  if (!data) return;

  document.getElementById('mainCategories').style.display = 'none';
  
  // Show subcategories section
  document.getElementById('subcategoriesSection').style.display = 'block';
  document.getElementById('photoSection').style.display = 'none';

  // Breadcrumb
  const lang = document.body.getAttribute('data-lang') || 'hi';
  setBreadcrumb(lang === 'hi' ? data.name_hi : data.name_en);

  const grid = document.getElementById('subcategoriesGrid');
  grid.innerHTML = '';

  Object.keys(data.subcategories).forEach(subKey => {
    const sub  = data.subcategories[subKey];
    const card = document.createElement('div');
    card.className = 'gallery-category-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-subcategory', subKey);

    card.innerHTML = `
      <div class="category-icon">${sub.icon || '📸'}</div>
      <h3>
        <span class="lang-hindi">${sub.name_hi}</span>
        <span class="lang-english">${sub.name_en}</span>
      </h3>
      <div class="category-count">
        <span class="lang-hindi">${sub.count > 0 ? sub.count + ' फोटो' : 'शीघ्र आ रहा है'}</span>
        <span class="lang-english">${sub.count > 0 ? sub.count + ' Photos' : 'Coming Soon'}</span>
      </div>
    `;

    card.addEventListener('click', () => showPhotos(category, subKey));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPhotos(category, subKey); }
    });

    grid.appendChild(card);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== Show Photos ======
function showPhotos(category, subcategory) {
  currentCategory    = category;
  currentSubcategory = subcategory;
  currentImages      = [];

  const cat = galleryData[category];
  const sub = cat?.subcategories[subcategory];
  if (!sub) return;

  document.getElementById('subcategoriesSection').style.display = 'none';
  
  // Show photo section
  document.getElementById('photoSection').style.display = 'block';

  // Update breadcrumb
  const lang = document.body.getAttribute('data-lang') || 'hi';
  const catLabel = lang === 'hi' ? cat.name_hi : cat.name_en;
  const subLabel = lang === 'hi' ? sub.name_hi : sub.name_en;
  setBreadcrumb(`${catLabel}  ›  ${subLabel}`);

  const grid     = document.getElementById('photoGrid');
  const countBdg = document.getElementById('photoCountBadge');
  const dlBtn    = document.getElementById('downloadAllBtn');
  grid.innerHTML = '';

  if (sub.count === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:48px 20px;">
        <div style="font-size:3rem; margin-bottom:16px;">📭</div>
        <p style="font-size:1rem; color:var(--text-muted);">
          <span class="lang-hindi">इस श्रेणी में अभी कोई फोटो उपलब्ध नहीं है।</span>
          <span class="lang-english">No photos available in this category yet.</span>
        </p>
      </div>
    `;
    if (countBdg) countBdg.textContent = '';
    if (dlBtn) dlBtn.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Photo count badge
  if (countBdg) {
    countBdg.innerHTML = `
      <span class="lang-hindi">${sub.count} फोटो</span>
      <span class="lang-english">${sub.count} Photos</span>
    `;
  }

  // Render skeleton placeholders first, then load images
  for (let i = 1; i <= sub.count; i++) {
    const imagePath = `images/gallery/${category}/${subcategory}/image (${i}).jpg`;
    currentImages.push(imagePath);

    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.setAttribute('role', 'listitem');
    photoCard.setAttribute('tabindex', '0');
    photoCard.setAttribute('data-index', i - 1);
    photoCard.setAttribute('aria-label', `Photo ${i} of ${sub.count}`);

    photoCard.innerHTML = `
      <img
        src="${imagePath}"
        alt="Photo ${i}"
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x225/1e40af/ffffff?text=Photo+${i}'"
      >
      <div class="photo-overlay" aria-hidden="true">
        <span>🔍</span>
      </div>
    `;

    photoCard.addEventListener('click', () => openModal(parseInt(photoCard.getAttribute('data-index'))));
    photoCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(parseInt(photoCard.getAttribute('data-index')));
      }
    });

    grid.appendChild(photoCard);
  }

  if (dlBtn) dlBtn.style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== Modal ======
function setupModal() {
  const modal    = document.getElementById('imageModal');
  const closeBtn = document.getElementById('modalClose');
  const prevBtn  = document.getElementById('modalPrev');
  const nextBtn  = document.getElementById('modalNext');

  closeBtn?.addEventListener('click', closeModal);
  prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(-1); });
  nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(1); });

  // Click backdrop to close
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Touch swipe
  if (modal) {
    let touchStartX = 0;
    modal.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    modal.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) navigateModal(diff > 0 ? 1 : -1);
    }, { passive: true });
  }
}

function updateModalCounter() {
  const counter = document.getElementById('modalCounter');
  if (counter && currentImages.length > 0) {
    counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
  }
}

function openModal(index) {
  console.log('Opening modal for image:', index);
  currentImageIndex = index;
  const modal     = document.getElementById('imageModal');
  const modalImg  = document.getElementById('modalImage');
  const dlBtn     = document.getElementById('downloadBtn');

  modal.style.display = 'flex';
  modalImg.src        = currentImages[currentImageIndex];
  modalImg.alt        = `Photo ${currentImageIndex + 1}`;
  if (dlBtn) {
    dlBtn.href     = currentImages[currentImageIndex];
    dlBtn.download = `photo_${currentImageIndex + 1}.jpg`;
  }

  updateModalCounter();
  document.body.style.overflow = 'hidden';

  // Focus close button for a11y
  setTimeout(() => document.getElementById('modalClose')?.focus(), 100);
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function navigateModal(direction) {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex + direction + currentImages.length) % currentImages.length;
  
  const modalImg = document.getElementById('modalImage');
  const dlBtn    = document.getElementById('downloadBtn');
  if (modalImg) { modalImg.src = currentImages[currentImageIndex]; modalImg.alt = `Photo ${currentImageIndex + 1}`; }
  if (dlBtn)    { dlBtn.href = currentImages[currentImageIndex]; dlBtn.download = `photo_${currentImageIndex + 1}.jpg`; }
  updateModalCounter();
}

// ====== Keyboard ======
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (modal?.style.display === 'flex') {
      if (e.key === 'ArrowLeft')  navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
      if (e.key === 'Escape')     closeModal();
    }
  });
}

// ====== Download All ======
document.addEventListener('DOMContentLoaded', () => {
  const dlAllBtn = document.getElementById('downloadAllBtn');
  if (dlAllBtn) dlAllBtn.addEventListener('click', downloadAllPhotos);
});

async function downloadAllPhotos() {
  if (typeof JSZip === 'undefined') {
    if (typeof showToast === 'function') showToast('JSZip not loaded. Please refresh.');
    return;
  }

  const dlAllBtn = document.getElementById('downloadAllBtn');
  const origHTML = dlAllBtn.innerHTML;
  dlAllBtn.innerHTML = '<span class="spinner"></span> <span class="lang-hindi">डाउनलोड…</span><span class="lang-english">Downloading…</span>';
  dlAllBtn.disabled = true;

  try {
    const zip    = new JSZip();
    const folder = zip.folder(currentSubcategory || 'photos');

    const loadPromises = currentImages.map((src, i) =>
      fetch(src)
        .then(r => r.blob())
        .then(blob => folder.file(`photo_${i + 1}.jpg`, blob))
        .catch(err => console.warn(`Skipped image ${i + 1}:`, err))
    );

    await Promise.all(loadPromises);

    const content = await zip.generateAsync({ type: 'blob' });
    const link    = document.createElement('a');
    link.href     = URL.createObjectURL(content);
    link.download = `${currentSubcategory || 'gallery'}_photos.zip`;
    link.click();
    URL.revokeObjectURL(link.href);

    if (typeof showToast === 'function') showToast('✅ Download complete!');

  } catch (err) {
    console.error('ZIP error:', err);
    if (typeof showToast === 'function') showToast('Download failed. Please try again.');
  } finally {
    dlAllBtn.innerHTML = origHTML;
    dlAllBtn.disabled  = false;
  }
}