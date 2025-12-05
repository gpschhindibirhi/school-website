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

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Gallery initialized');
  initializeGallery();
});

function initializeGallery() {
  // Setup main category cards
  const categoryCards = document.querySelectorAll('#mainCategories .gallery-category-card');
  categoryCards.forEach(card => {
    const category = card.getAttribute('data-category');
    card.addEventListener('click', function() {
      console.log('Category clicked:', category);
      showSubcategories(category);
    });
  });
  
  // Setup back buttons
  const backToMain = document.getElementById('backToMain');
  if (backToMain) {
    backToMain.addEventListener('click', showMainCategories);
  }
  
  const backToSub = document.getElementById('backToSub');
  if (backToSub) {
    backToSub.addEventListener('click', goBackToSubcategories);
  }
  
  // Setup download all button
  const downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', downloadAllPhotos);
  }
  
  // Setup modal
  setupModal();
  
  // Setup keyboard navigation
  setupKeyboardNavigation();
}

// Show subcategories for a category
function showSubcategories(category) {
  console.log('Showing subcategories for:', category);
  currentCategory = category;
  const data = galleryData[category];
  
  if (!data) {
    console.error('Category not found:', category);
    return;
  }
  
  // Hide main categories
  document.getElementById('mainCategories').style.display = 'none';
  
  // Show subcategories section
  document.getElementById('subcategoriesSection').style.display = 'block';
  
  // Hide photo section
  document.getElementById('photoSection').style.display = 'none';
  
  const subcategoriesGrid = document.getElementById('subcategoriesGrid');
  subcategoriesGrid.innerHTML = '';
  
  Object.keys(data.subcategories).forEach(subKey => {
    const sub = data.subcategories[subKey];
    const card = document.createElement('div');
    card.className = 'gallery-category-card';
    card.setAttribute('data-subcategory', subKey);
    
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
    
    card.addEventListener('click', function() {
      console.log('Subcategory clicked:', subKey);
      showPhotos(category, subKey);
    });
    
    subcategoriesGrid.appendChild(card);
  });
}

// Show main categories
function showMainCategories() {
  console.log('Showing main categories');
  document.getElementById('mainCategories').style.display = 'grid';
  document.getElementById('subcategoriesSection').style.display = 'none';
  document.getElementById('photoSection').style.display = 'none';
}

// Go back to subcategories
function goBackToSubcategories() {
  console.log('Going back to subcategories');
  document.getElementById('subcategoriesSection').style.display = 'block';
  document.getElementById('photoSection').style.display = 'none';
}

// Show photos for a subcategory
function showPhotos(category, subcategory) {
  console.log('Showing photos for:', category, subcategory);
  currentCategory = category;
  currentSubcategory = subcategory;
  
  const photoCount = galleryData[category].subcategories[subcategory].count;
  
  // Hide subcategories
  document.getElementById('subcategoriesSection').style.display = 'none';
  
  // Show photo section
  document.getElementById('photoSection').style.display = 'block';
  
  const photoGrid = document.getElementById('photoGrid');
  photoGrid.innerHTML = '';
  currentImages = [];
  
  // Check if there are photos
  if (photoCount === 0) {
    photoGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <p style="font-size: 1.2rem; color: var(--text-secondary);">
          <span class="lang-hindi">इस श्रेणी में कोई फोटो उपलब्ध नहीं है।</span>
          <span class="lang-english">No photos available in this category.</span>
        </p>
      </div>
    `;
    document.getElementById('downloadAllBtn').style.display = 'none';
    return;
  }
  
  // Generate photo cards
  for (let i = 1; i <= photoCount; i++) {
    const imagePath = `images/gallery/${category}/${subcategory}/image (${i}).jpg`;
    currentImages.push(imagePath);
    
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.setAttribute('data-index', i - 1);
    
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
    
    photoCard.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      openModal(index);
    });
    
    photoGrid.appendChild(photoCard);
  }
  
  // Show download all button
  document.getElementById('downloadAllBtn').style.display = 'inline-flex';
}

// Setup modal
function setupModal() {
  const modal = document.getElementById('imageModal');
  const closeBtn = document.getElementById('modalClose');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target.id === 'imageModal') {
        closeModal();
      }
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navigateModal(-1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navigateModal(1);
    });
  }
  
  // Touch support
  if (modal) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    modal.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    modal.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        navigateModal(1);
      }
      if (touchEndX - touchStartX > 50) {
        navigateModal(-1);
      }
    });
  }
}

// Open modal
function openModal(index) {
  console.log('Opening modal for image:', index);
  currentImageIndex = index;
  
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const downloadBtn = document.getElementById('downloadBtn');
  
  modal.style.display = 'flex';
  modalImg.src = currentImages[currentImageIndex];
  downloadBtn.href = currentImages[currentImageIndex];
  downloadBtn.download = `image_${currentImageIndex + 1}.jpg`;
  
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Navigate modal
function navigateModal(direction) {
  if (currentImages.length === 0) return;
  
  currentImageIndex = (currentImageIndex + direction + currentImages.length) % currentImages.length;
  
  const modalImg = document.getElementById('modalImage');
  const downloadBtn = document.getElementById('downloadBtn');
  
  modalImg.src = currentImages[currentImageIndex];
  downloadBtn.href = currentImages[currentImageIndex];
  downloadBtn.download = `image_${currentImageIndex + 1}.jpg`;
}

// Keyboard navigation
function setupKeyboardNavigation() {
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowLeft') {
        navigateModal(-1);
      } else if (e.key === 'ArrowRight') {
        navigateModal(1);
      } else if (e.key === 'Escape') {
        closeModal();
      }
    }
  });
}

// Download all photos
async function downloadAllPhotos() {
  if (typeof JSZip === 'undefined') {
    alert('JSZip library not loaded. Please refresh the page.');
    return;
  }
  
  const downloadBtn = document.getElementById('downloadAllBtn');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '<span class="spinner"></span> <span class="lang-hindi">डाउनलोड हो रहा है...</span><span class="lang-english">Downloading...</span>';
  downloadBtn.disabled = true;
  
  try {
    const zip = new JSZip();
    const folder = zip.folder(currentSubcategory);
    
    const loadPromises = currentImages.map((src, index) => {
      return fetch(src)
        .then(response => response.blob())
        .then(blob => {
          folder.file(`image_${index + 1}.jpg`, blob);
        })
        .catch(error => {
          console.warn(`Failed to load image ${index + 1}:`, error);
        });
    });
    
    await Promise.all(loadPromises);
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${currentSubcategory}_photos.zip`;
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
