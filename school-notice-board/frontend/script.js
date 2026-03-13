'use strict';

// ====== Notice Board Script ======
const BACKEND_URL = 'https://school-backend-14ld.onrender.com/api/notices';

// DOM refs
const form           = document.getElementById('noticeForm');
const noticeList     = document.getElementById('noticeList');
const teacherTools   = document.getElementById('teacherTools');
const loginLinkDiv   = document.getElementById('loginLink');
const logoutBtn      = document.getElementById('logoutBtn');
const submitBtn      = document.getElementById('submitBtn');
const cancelEditBtn  = document.getElementById('cancelEditBtn');
const countBadge     = document.getElementById('noticeCountBadge');
const teacherWelcome = document.getElementById('teacherWelcome');
const teacherNameEl  = document.getElementById('teacherNameDisplay');

// State
let allNotices      = [];
let showingAll      = false;
let editingNoticeId = null;

// ====== Helpers ======

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
  });
}

function toast(msg, duration = 2400) {
  // Use global toast from script.js if available
  if (typeof showToast === 'function') {
    showToast(msg, duration);
    return;
  }
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ====== Auth ======

function getToken() { return localStorage.getItem('token'); }

function checkAuth() {
  const token = getToken();
  if (token) {
    if (teacherTools)  teacherTools.style.display  = 'block';
    if (loginLinkDiv)  loginLinkDiv.style.display   = 'none';

    // Show teacher name
    const name = localStorage.getItem('teacherName');
    if (teacherWelcome && teacherNameEl && name) {
      teacherNameEl.textContent = name;
      teacherWelcome.style.display = 'flex';
    }
  } else {
    if (teacherTools)  teacherTools.style.display  = 'none';
    if (loginLinkDiv)  loginLinkDiv.style.display   = 'block';
  }
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    const lang = document.body.getAttribute('data-lang') || 'hi';
    const msg  = lang === 'hi'
      ? 'क्या आप लॉगआउट करना चाहते हैं?'
      : 'Do you want to logout?';
    if (confirm(msg)) {
      localStorage.removeItem('token');
      localStorage.removeItem('teacherName');
      localStorage.removeItem('cachedNotices');
      toast('✅ Logged out');
      setTimeout(() => window.location.reload(), 600);
    }
  });
}

// ====== Fetch Notices ======

async function fetchNotices() {
  if (!noticeList) return;

  // Show skeletons while loading (only on first load)
  if (allNotices.length === 0) {
    showSkeletons();
  }

  // Serve cache instantly while fetching fresh data
  const cached = localStorage.getItem('cachedNotices');
  if (cached) {
    try {
      allNotices = JSON.parse(cached);
      renderNotices(showingAll);
    } catch (_) {}
  }

  try {
    const res = await fetch(BACKEND_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    allNotices = Array.isArray(data)
      ? [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    localStorage.setItem('cachedNotices', JSON.stringify(allNotices));
    renderNotices(showingAll);

  } catch (err) {
    console.error('Fetch notices error:', err);
    if (!cached) {
      noticeList.innerHTML = `
        <div class="no-notices">
          <div style="font-size:2.5rem; margin-bottom:12px;">📡</div>
          <p>
            <span class="lang-hindi">नोटिस लोड नहीं हो सके। कृपया बाद में पुनः प्रयास करें।</span>
            <span class="lang-english">Could not load notices. Please try again later.</span>
          </p>
        </div>
      `;
    }
  }
}

function showSkeletons() {
  noticeList.innerHTML = `
    <div class="notice-skeleton" aria-hidden="true">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line skeleton-short"></div>
    </div>
    <div class="notice-skeleton" aria-hidden="true">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line skeleton-short"></div>
    </div>
    <div class="notice-skeleton" aria-hidden="true">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line skeleton-short"></div>
    </div>
  `;
}

// ====== Render Notices ======

function renderNotices(showAll = false) {
  if (!noticeList) return;
  noticeList.innerHTML = '';

  const token        = getToken();
  const toShow       = showAll ? allNotices : allNotices.slice(0, 10);
  const lang         = document.body.getAttribute('data-lang') || 'hi';

  // Update count badge
  if (countBadge) {
    countBadge.textContent = allNotices.length;
    countBadge.style.display = allNotices.length > 0 ? 'inline-flex' : 'none';
  }

  if (toShow.length === 0) {
    noticeList.innerHTML = `
      <div class="no-notices">
        <div style="font-size:2.5rem; margin-bottom:12px;">📭</div>
        <p>
          <span class="lang-hindi">कोई नोटिस उपलब्ध नहीं है।</span>
          <span class="lang-english">No notices available.</span>
        </p>
      </div>
    `;
    return;
  }

  toShow.forEach((notice, i) => {
    const card = document.createElement('div');
    card.className = 'notice-card';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = `${i * 0.05}s`;

    card.innerHTML = `
      <div class="notice-card-header">
        <h4 class="notice-title">${escapeHtml(notice.title || 'Untitled')}</h4>
        <span class="notice-date-badge">${formatDate(notice.date)}</span>
      </div>
      <p class="notice-body">${escapeHtml(notice.content || '')}</p>
    `;

    // Teacher action buttons
    if (token) {
      const actions = document.createElement('div');
      actions.className = 'notice-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'editBtn';
      editBtn.innerHTML = `<span class="lang-hindi">✏️ संपादित</span><span class="lang-english">✏️ Edit</span>`;
      editBtn.setAttribute('aria-label', `Edit notice: ${notice.title}`);
      editBtn.addEventListener('click', () => editNotice(notice));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'deleteBtn';
      deleteBtn.innerHTML = `<span class="lang-hindi">🗑️ हटाएं</span><span class="lang-english">🗑️ Delete</span>`;
      deleteBtn.setAttribute('aria-label', `Delete notice: ${notice.title}`);
      deleteBtn.addEventListener('click', () => deleteNotice(notice._id, notice.title));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);
    }

    noticeList.appendChild(card);
  });

  // Show more / less button
  if (allNotices.length > 10) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggleBtn';
    toggleBtn.innerHTML = showAll
      ? `<span class="lang-hindi">⬆️ कम दिखाएं</span><span class="lang-english">⬆️ Show Less</span>`
      : `<span class="lang-hindi">⬇️ और ${allNotices.length - 10} नोटिस देखें</span><span class="lang-english">⬇️ Show ${allNotices.length - 10} More</span>`;

    toggleBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      renderNotices(showingAll);
      toggleBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    noticeList.appendChild(toggleBtn);
  }
}

// ====== Edit Notice ======

function editNotice(notice) {
  const titleEl   = document.getElementById('title');
  const contentEl = document.getElementById('content');
  if (!titleEl || !contentEl) return;

  titleEl.value   = notice.title   || '';
  contentEl.value = notice.content || '';
  editingNoticeId = notice._id;

  const lang = document.body.getAttribute('data-lang') || 'hi';
  submitBtn.innerHTML = lang === 'hi'
    ? '💾 अपडेट करें'
    : '💾 Update Notice';

  if (cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';

  // Scroll to form
  form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  titleEl.focus();
}

function resetForm() {
  form?.reset();
  editingNoticeId = null;
  submitBtn.innerHTML = `<span class="lang-hindi">➕ नई नोटिस जोड़ें</span><span class="lang-english">➕ Add Notice</span>`;
  if (cancelEditBtn) cancelEditBtn.style.display = 'none';
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', resetForm);
}

// ====== Delete Notice ======

async function deleteNotice(id, title) {
  const token = getToken();
  if (!token) return;

  const lang = document.body.getAttribute('data-lang') || 'hi';
  const msg  = lang === 'hi'
    ? `"${title}" नोटिस हटाना चाहते हैं?`
    : `Delete notice "${title}"?`;
  if (!confirm(msg)) return;

  try {
    const res = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      toast(lang === 'hi' ? '🗑️ नोटिस हटाई गई' : '🗑️ Notice deleted');
      await fetchNotices();
    } else if (res.status === 401 || res.status === 403) {
      handleSessionExpired();
    } else {
      toast(lang === 'hi' ? '❌ नोटिस नहीं हटाई जा सकी' : '❌ Could not delete notice');
    }
  } catch (err) {
    console.error('Delete error:', err);
    toast('❌ Connection error');
  }
}

// ====== Add / Update Notice ======

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleVal   = (document.getElementById('title')?.value   || '').trim();
    const contentVal = (document.getElementById('content')?.value || '').trim();
    const lang       = document.body.getAttribute('data-lang') || 'hi';

    if (!titleVal || !contentVal) {
      toast(lang === 'hi'
        ? '⚠️ शीर्षक और विवरण दोनों भरें'
        : '⚠️ Please fill in both title and content');
      return;
    }

    const token = getToken();
    if (!token) {
      toast(lang === 'hi' ? '⚠️ कृपया पहले लॉगिन करें' : '⚠️ Please login first');
      return;
    }

    const isEdit = !!editingNoticeId;
    const method = isEdit ? 'PUT' : 'POST';
    const url    = isEdit ? `${BACKEND_URL}/${editingNoticeId}` : BACKEND_URL;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span class="lang-hindi">सहेजा जा रहा है…</span><span class="lang-english">Saving…</span>`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: titleVal, content: contentVal })
      });

      if (res.ok) {
        toast(lang === 'hi'
          ? (isEdit ? '✅ नोटिस अपडेट हुई' : '✅ नोटिस जोड़ी गई')
          : (isEdit ? '✅ Notice updated' : '✅ Notice added'));
        resetForm();
        await fetchNotices();
      } else if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
      } else {
        toast(lang === 'hi' ? '❌ नोटिस सहेजने में त्रुटि' : '❌ Failed to save notice');
      }

    } catch (err) {
      console.error('Submit error:', err);
      toast('❌ Connection error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = isEdit
        ? `<span class="lang-hindi">💾 अपडेट करें</span><span class="lang-english">💾 Update</span>`
        : `<span class="lang-hindi">➕ नई नोटिस जोड़ें</span><span class="lang-english">➕ Add Notice</span>`;
    }
  });
}

// ====== Session Expired Handler ======

function handleSessionExpired() {
  localStorage.removeItem('token');
  localStorage.removeItem('teacherName');
  const lang = document.body.getAttribute('data-lang') || 'hi';
  toast(lang === 'hi'
    ? '⚠️ सत्र समाप्त हो गया। कृपया पुनः लॉगिन करें।'
    : '⚠️ Session expired. Please login again.');
  setTimeout(() => window.location.reload(), 1200);
}

// ====== Init ======

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchNotices();
});