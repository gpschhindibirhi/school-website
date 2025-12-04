// Gallery Data Structure
const galleryData = {
  school_photos: {
    name_hi: 'विद्यालय फोटो',
    name_en: 'School Photos',
    subcategories: {
      inside: {
        name_hi: 'अंदर का दृश्य',
        name_en: 'Inside View',
        count: 23
      },
      outside: {
        name_hi: 'बाहर का दृश्य',
        name_en: 'Outside View',
        count: 93
      }
    }
  },
  events: {
    name_hi: 'आयोजन',
    name_en: 'Events',
    subcategories: {
      independence_day_2024: {
        name_hi: 'स्वतंत्रता दिवस 2024',
        name_en: 'Independence Day 2024',
        count: 0
      },
      independence_day_2025: {
        name_hi: 'स्वतंत्रता दिवस 2025',
        name_en: 'Independence Day 2025',
        count: 0
      },
      sports_day_2025: {
        name_hi: 'खेल दिवस 2025',
        name_en: 'Sports Day 2025',
        count: 0
      }
    }
  },
  other_folders: {
    name_hi: 'अन्य गतिविधियां',
    name_en: 'Other Activities',
    subcategories: {
      plantation_drive: {
        name_hi: 'पौधरोपण अभियान',
        name_en: 'Plantation Drive',
        count: 0
      },
      classroom_activities: {
        name_hi: 'कक्षा गतिविधियां',
        name_en: 'Classroom Activities',
        count: 0
      },
      cultural_programs: {
        name_hi: 'सांस्कृतिक कार्यक्रम',
        name_en: 'Cultural Programs',
        count: 0
      }
    }
  }
};

let currentCategory = '';
let currentSubcategory = '';
let currentImages = [];
let currentImageIndex = 0;

// Helper to safely get element
function $id(id) {
  return document.getElementById(id);
}

// Show subcategories for a category
function showSubcategories(category) {
  currentCategory = category;
  const data = galleryData[category];

  // Defensive: if no data, show message
  if (!data || !data.subcategories) {
    alert('No folders found for this category.');
    return;
  }

  const subcategoriesGrid = $id('subcategoriesGrid');
  if (!subcategoriesGrid) return;

  document.getElementById('mainCategories').style.display = 'none';
  document.getElementById('subcategoriesSection').style.display = 'block';
  document.getElementById('photoSection').style.display = 'none';

  subcategoriesGrid.innerHTML = '';

  const keys = Object.keys(data.subcategories || {});
  if (keys.length === 0) {
    subcategoriesGrid.innerHTML = `
      <p class="no-notices">
        <span class="lang-hindi">कोई फ़ोल्डर उपलब्ध नहीं है।</span>
        <span class="lang-english">No folders available.</span>
      </p>
    `;
    return;
  }

  keys.forEach(subKey => {
    const sub = data.subcategories[subKey];
    const card = document.createElement('div');
    card.className = 'gallery-category-card';
    card.onclick = () => showPhotos(category, subKey);

    card.innerHTML = `
      <div class="category-icon">📸</div>
      <h3>
        <span class="lang-hindi">${sub.name_hi}</span>
        <span class="lang-english">${sub.name_en}</span>
      </h3>
      <p>
        <span class="lang-hindi">${sub.count} फोटो</span>
        <span class="lang-english">${sub.count} Photos</span>
      </p>
    `;

    subcategoriesGrid.appendChild(card);
  });
}

// Show main categories
function showMainCategories() {
  const main = $id('mainCategories');
  if (main) main.style.display = 'grid';
  const subs = $id('subcategoriesSection');
  if (subs) subs.style.display = 'none';
  const photos = $id('photoSection');
  if (photos) photos.style.display = 'none';
}

// Go back to subcategories
function goBackToSubcategories() {
  const subs = $id('subcategoriesSection');
  const photos = $id('photoSection');
  if (subs) subs.style.display = 'block';
  if (photos) photos.style.display = 'none';
}

// Show photos for a subcategory
function showPhotos(category, subcategory) {
  currentCategory = category;
  currentSubcategory = subcategory;

  const subData = galleryData[category] && galleryData[category].subcategories && galleryData[category].subcategories[subcategory];
  const photoCount = subData ? subData.count : 0;

  document.getElementById('subcategoriesSection').style.display = 'none';
  document.getElementById('photoSection').style.display = 'block';

  const photoGrid = $id('photoGrid');
  if (!photoGrid) return;
  photoGrid.innerHTML = '';

  currentImages = [];

  if (!photoCount || photoCount === 0) {
    photoGrid.innerHTML = `
      <p class="no-notices">
        <span class="lang-hindi">इस फ़ोल्डर में कोई फोटो उपलब्ध नहीं है।</span>
        <span class="lang-english">No photos available in this folder.</span>
      </p>
    `;
    const downloadBtn = $id('downloadAllBtn');
    if (downloadBtn) downloadBtn.style.display = 'none';
    return;
  }

  // Generate photo paths
  for (let i = 1; i <= photoCount; i++) {
    // NOTE: this assumes files are named: image (1).jpg etc.
    // If your files are named differently, update this path/pattern.
    const imagePath = `images/gallery/${category}/${subcategory}/image (${i}).jpg`;
    currentImages.push(imagePath);

    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.onclick = () => openModal(i - 1);

    photoCard.innerHTML = `
      <img 
        src="${imagePath}" 
        alt="Photo ${i}" 
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x200/1e40af/ffffff?text=Image+${i}'"
      >
      <div class="photo-overlay">
        <span class="lang-hindi">देखें</span>
        <span class="lang-english">View</span>
      </div>
    `;

    photoGrid.appendChild(photoCard);
  }

  // Show/hide download all button
  const downloadBtn = $id('downloadAllBtn');
  if (downloadBtn) {
    if (photoCount > 0) {
      downloadBtn.style.display = 'inline-flex';
    } else {
      downloadBtn.style.display = 'none';
    }
  }
}

// Open modal with image
function openModal(index) {
  if (!currentImages || currentImages.length === 0) return;
  currentImageIndex = index;
  const modal = $id('imageModal');
  const modalImg = $id('modalImage');
  const downloadBtn = $id('downloadBtn');

  if (!modal || !modalImg) return;

  modal.style.display = 'flex';
  modalImg.src = currentImages[currentImageIndex];
  if (downloadBtn) {
    downloadBtn.href = currentImages[currentImageIndex];
    downloadBtn.download = `image_${currentImageIndex + 1}.jpg`;
  }

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(event) {
  if (!event) return;
  if (event.target.id === 'imageModal' || (event.target.className && event.target.className.includes('modal-close'))) {
    const modal = $id('imageModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Navigate modal (prev/next)
function navigateModal(direction) {
  if (!currentImages || currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex + direction + currentImages.length) % currentImages.length;
  const modalImg = $id('modalImage');
  const downloadBtn = $id('downloadBtn');

  if (!modalImg) return;

  modalImg.src = currentImages[currentImageIndex];
  if (downloadBtn) {
    downloadBtn.href = currentImages[currentImageIndex];
    downloadBtn.download = `image_${currentImageIndex + 1}.jpg`;
  }
}

// Download all photos as ZIP
async function downloadAllPhotos() {
  if (typeof JSZip === 'undefined') {
    alert('JSZip library not loaded. Please refresh the page.');
    return;
  }

  const downloadBtn = $id('downloadAllBtn');
  if (!downloadBtn) return;
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '<span class="spinner"></span> <span class="lang-hindi">डाउनलोड हो रहा है...</span><span class="lang-english">Downloading...</span>';
  downloadBtn.disabled = true;

  try {
    const zip = new JSZip();
    const folder = zip.folder(currentSubcategory || 'photos');
    let loadedImages = 0;

    const loadPromises = (currentImages || []).map((src, index) => {
      return fetch(src)
        .then(response => response.blob())
        .then(blob => {
          folder.file(`image_${index + 1}.jpg`, blob);
          loadedImages++;
        })
        .catch(error => {
          console.warn(`Failed to load image ${index + 1}:`, error);
          loadedImages++;
        });
    });

    await Promise.all(loadPromises);

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${currentSubcategory || 'photos'}_photos.zip`;
    link.click();
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error('Error creating ZIP:', error);
    alert('Error downloading photos. Please try again.');
  } finally {
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
  }
}

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
  const modal = $id('imageModal');
  if (modal && modal.style.display === 'flex') {
    if (e.key === 'ArrowLeft') {
      navigateModal(-1);
    } else if (e.key === 'ArrowRight') {
      navigateModal(1);
    } else if (e.key === 'Escape') {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }
});

// Touch support for modal (swipe)
let touchStartX = 0;
let touchEndX = 0;

const imageModalEl = $id('imageModal');
if (imageModalEl) {
  imageModalEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  imageModalEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  if (!currentImages || currentImages.length === 0) return;
  if (touchStartX - touchEndX > 50) {
    navigateModal(1); // Swipe left
  }
  if (touchEndX - touchStartX > 50) {
    navigateModal(-1); // Swipe right
  }
}
