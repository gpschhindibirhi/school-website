// ====== School Notice Board Script ======
const backendURL = "https://school-backend-14ld.onrender.com/api/notices";

// Get elements
const form = document.getElementById("noticeForm");
const noticeList = document.getElementById("noticeList");
const teacherTools = document.getElementById("teacherTools");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");
const submitBtn = document.getElementById("submitBtn");

// State
let allNotices = [];
let showingAll = false;
let editingNoticeId = null;

// ====== Helper Functions ======

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[match]);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ====== Authentication ======

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (token && teacherTools && loginLink) {
    teacherTools.style.display = 'block';
    loginLink.style.display = 'none';
  } else if (teacherTools && loginLink) {
    teacherTools.style.display = 'none';
    loginLink.style.display = 'block';
  }
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (confirm('क्या आप लॉगआउट करना चाहते हैं? | Do you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('teacherName');
      localStorage.removeItem('cachedNotices');
      window.location.href = "index.html";
    }
  });
}

// ====== Fetch Notices ======

async function fetchNotices() {
  if (!noticeList) return;

  noticeList.innerHTML = '<p class="loading-text"><span class="lang-hindi">लोड हो रहा है...</span><span class="lang-english">Loading...</span></p>';

  // Try to load from cache first
  const cachedNotices = localStorage.getItem('cachedNotices');
  if (cachedNotices) {
    try {
      allNotices = JSON.parse(cachedNotices);
      renderNotices(showingAll);
    } catch (e) {
      console.error('Error parsing cached notices:', e);
    }
  }

  try {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(backendURL, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const notices = await response.json();

    allNotices = Array.isArray(notices)
      ? notices.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    // Cache the notices
    localStorage.setItem('cachedNotices', JSON.stringify(allNotices));
    renderNotices(showingAll);

  } catch (error) {
    console.error('Error fetching notices:', error);
    if (!cachedNotices) {
      noticeList.innerHTML = `
        <p class="no-notices">
          <span class="lang-hindi">नोटिस लोड करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।</span>
          <span class="lang-english">Failed to load notices. Please try again later.</span>
        </p>
      `;
    }
  }
}

// ====== Render Notices ======

function renderNotices(showAll = false) {
  if (!noticeList) return;

  noticeList.innerHTML = '';
  const token = localStorage.getItem('token');
  const noticesToShow = showAll ? allNotices : allNotices.slice(0, 10);

  if (!noticesToShow || noticesToShow.length === 0) {
    noticeList.innerHTML = `
      <p class="no-notices">
        <span class="lang-hindi">कोई नोटिस उपलब्ध नहीं है।</span>
        <span class="lang-english">No notices available.</span>
      </p>
    `;
    return;
  }

  noticesToShow.forEach((notice) => {
    const div = document.createElement('div');
    div.className = 'notice-card';

    div.innerHTML = `
      <h4>${escapeHtml(notice.title || 'Untitled')}</h4>
      <p>${escapeHtml(notice.content || 'No content')}</p>
      <small class="notice-date">${formatDate(notice.date)}</small>
    `;

    // Add edit/delete buttons for teachers
    if (token) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'notice-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'editBtn';
      editBtn.innerHTML = '<span class="lang-hindi">✏️ संपादित करें</span><span class="lang-english">✏️ Edit</span>';
      editBtn.addEventListener('click', () => editNotice(notice));
      actionsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'deleteBtn';
      deleteBtn.innerHTML = '<span class="lang-hindi">🗑️ हटाएं</span><span class="lang-english">🗑️ Delete</span>';
      deleteBtn.addEventListener('click', () => deleteNotice(notice._id));
      actionsDiv.appendChild(deleteBtn);

      div.appendChild(actionsDiv);
    }

    noticeList.appendChild(div);
  });

  // Add show more/less button
  if (allNotices.length > 10) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggleBtn';
    toggleBtn.innerHTML = showAll 
      ? '<span class="lang-hindi">⬆️ कम दिखाएं</span><span class="lang-english">⬆️ Show Less</span>'
      : '<span class="lang-hindi">⬇️ और दिखाएं</span><span class="lang-english">⬇️ Show More</span>';
    toggleBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      renderNotices(showingAll);
      toggleBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    noticeList.appendChild(toggleBtn);
  }
}

// ====== Edit Notice ======

function editNotice(notice) {
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');

  if (titleInput && contentInput && submitBtn) {
    titleInput.value = notice.title || '';
    contentInput.value = notice.content || '';
    submitBtn.innerHTML = '<span class="lang-hindi">अपडेट करें</span><span class="lang-english">Update Notice</span>';
    editingNoticeId = notice._id;

    // Scroll to form
    document.getElementById('noticeForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ====== Delete Notice ======

async function deleteNotice(id) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const confirmDelete = confirm('क्या आप इस नोटिस को हटाना चाहते हैं? | Do you want to delete this notice?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${backendURL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('✅ नोटिस सफलतापूर्वक हटाई गई! | Notice deleted successfully!');
      await fetchNotices();
    } else {
      alert('❌ नोटिस हटाने में त्रुटि। | Failed to delete notice.');
    }
  } catch (error) {
    console.error('Error deleting notice:', error);
    alert('सर्वर से कनेक्शन त्रुटि। | Error connecting to server.');
  }
}

// ====== Add/Update Notice ======

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const title = (titleInput?.value || '').trim();
    const content = (contentInput?.value || '').trim();

    if (!title || !content) {
      alert('⚠️ कृपया शीर्षक और विवरण भरें। | Please fill in both title and content.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('⚠️ कृपया पहले लॉगिन करें। | Please login first.');
      return;
    }

    const method = editingNoticeId ? 'PUT' : 'POST';
    const url = editingNoticeId ? `${backendURL}/${editingNoticeId}` : backendURL;

    // Show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> <span class="lang-hindi">सहेजा जा रहा है...</span><span class="lang-english">Saving...</span>';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        const message = editingNoticeId 
          ? '✅ नोटिस अपडेट सफल! | Notice updated successfully!'
          : '✅ नोटिस जोड़ी गई! | Notice added successfully!';
        alert(message);
        resetForm();
        await fetchNotices();
      } else {
        alert('❌ नोटिस सहेजने में त्रुटि। लॉगिन स्थिति जांचें। | Failed to save notice. Check login status.');
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('सर्वर से कनेक्शन त्रुटि। | Error connecting to server.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="lang-hindi">नई नोटिस जोड़ें</span><span class="lang-english">Add Notice</span>';
      }
    }
  });
}

// ====== Reset Form ======

function resetForm() {
  if (form) {
    form.reset();
  }
  if (submitBtn) {
    submitBtn.innerHTML = '<span class="lang-hindi">नई नोटिस जोड़ें</span><span class="lang-english">Add Notice</span>';
  }
  editingNoticeId = null;
}

// ====== Navigation Toggle (Mobile) ======

function toggleNav() {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

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
  if (themeBtn) {
    themeBtn.innerHTML = newTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
  }
}

// ====== Load Preferences ======

function loadPreferences() {
  const savedLang = localStorage.getItem('preferred-language') || 'hi';
  const savedTheme = localStorage.getItem('preferred-theme') || 'light';
  
  document.body.setAttribute('data-lang', savedLang);
  document.body.setAttribute('data-theme', savedTheme);
  
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = savedTheme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
  }
}

// ====== Initialize ======

document.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
  checkAuth();
  fetchNotices();

  // Close mobile nav on link click
  document.querySelectorAll('.nav-content a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav) {
        nav.classList.remove('active');
      }
    });
  });
});

// ====== End of Script ======