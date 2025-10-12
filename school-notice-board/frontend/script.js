// ====== School Notice Board Script ======
const backendURL = "https://school-backend-14ld.onrender.com/api/notices";

const form = document.getElementById("noticeForm");
const noticeList = document.getElementById("noticeList");
const teacherTools = document.getElementById("teacherTools");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");
const submitBtn = document.getElementById("submitBtn");

let allNotices = [];
let showingAll = false;
let editingNoticeId = null; // Track if in edit mode

function safeEl(el, name) {
  if (!el) console.warn(`Missing element: ${name}`);
  return el;
}

// ---- Check Authentication Status ----
function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    teacherTools.style.display = 'block';
    loginLink.style.display = 'none';
  } else {
    teacherTools.style.display = 'none';
    loginLink.style.display = 'block';
  }
}

// ---- Fetch and display all notices ----
async function fetchNotices() {
  if (!noticeList) return;
  try {
    const response = await fetch(backendURL, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const notices = await response.json();

    allNotices = Array.isArray(notices)
      ? notices.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];
    renderNotices(showingAll);
  } catch (error) {
    console.error("Error fetching notices:", error);
    noticeList.innerHTML = "<p>नोटिस लोड करने में त्रुटि। बैकेंड जांचें। | Failed to load notices. Check backend.</p>";
  }
}

// ---- Render Notices ----
function renderNotices(showAll = false) {
  if (!noticeList) return;
  noticeList.innerHTML = "";
  const token = localStorage.getItem('token');

  const noticesToShow = showAll ? allNotices : allNotices.slice(0, 10);

  if (!noticesToShow || noticesToShow.length === 0) {
    noticeList.innerHTML = "<p>कोई नोटिस नहीं। | No notices yet.</p>";
    return;
  }

  noticesToShow.forEach((notice) => {
    const div = document.createElement("div");
    div.classList.add("notice");

    div.innerHTML = `
      <h4>${escapeHtml(notice.title || "")}</h4>
      <p>${escapeHtml(notice.content || "")}</p>
      <small>${notice.date ? new Date(notice.date).toLocaleString() : ""}</small>
    `;

    if (token) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ संपादित करें | Edit";
      editBtn.classList.add("editBtn");
      editBtn.addEventListener("click", () => editNotice(notice));
      div.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️ हटाएं | Delete";
      delBtn.classList.add("deleteBtn");
      delBtn.addEventListener("click", () => deleteNotice(notice._id));
      div.appendChild(delBtn);
    }

    noticeList.appendChild(div);
  });

  if (allNotices.length > 10) {
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = showAll ? "⬆️ कम दिखाएं | Show Less" : "⬇️ और दिखाएं | Show More";
    toggleBtn.classList.add("toggleBtn");
    toggleBtn.addEventListener("click", () => {
      showingAll = !showingAll;
      renderNotices(showingAll);
    });
    noticeList.appendChild(toggleBtn);
  }
}

// ---- Edit a Notice (Populate Form) ----
function editNotice(notice) {
  document.getElementById("title").value = notice.title || "";
  document.getElementById("content").value = notice.content || "";
  submitBtn.textContent = "अपडेट करें | Update Notice";
  editingNoticeId = notice._id;
}

// ---- Delete a Notice ----
async function deleteNotice(id) {
  if (!localStorage.getItem('token')) return;
  if (!confirm("नोटिस हटाएं? | Delete notice?")) return;

  try {
    const response = await fetch(`${backendURL}/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      alert("नोटिस सफलतापूर्वक हटाई गई! | Notice deleted successfully!");
      await fetchNotices();
    } else {
      alert("नोटिस हटाने में त्रुटि। | Failed to delete notice.");
    }
  } catch (error) {
    console.error("Error deleting notice:", error);
    alert("सर्वर से कनेक्शन त्रुटि। | Error connecting to server.");
  }
}

// ---- Add or Update a notice ----
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleEl = document.getElementById("title");
    const contentEl = document.getElementById("content");
    const title = (titleEl && titleEl.value || "").trim();
    const content = (contentEl && contentEl.value || "").trim();

    if (!title || !content) {
      alert("⚠️ कृपया शीर्षक और विवरण भरें। | Please fill in both title and content.");
      return;
    }

    const method = editingNoticeId ? "PUT" : "POST";
    const url = editingNoticeId ? `${backendURL}/${editingNoticeId}` : backendURL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        alert(editingNoticeId ? "✅ नोटिस अपडेट सफल! | Notice updated successfully!" : "✅ नोटिस जोड़ी गई! | Notice added successfully!");
        resetForm();
        await fetchNotices();
      } else {
        alert("❌ नोटिस सहेजने में त्रुटि। लॉगिन स्थिति जांचें। | Failed to save notice. Check login status.");
      }
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("सर्वर से कनेक्शन त्रुटि। | Error connecting to server.");
    }
  });
}

// ---- Reset Form to Add Mode ----
function resetForm() {
  form.reset();
  submitBtn.textContent = "नई नोटिस जोड़ें | Add Notice";
  editingNoticeId = null;
}

// ---- Logout ----
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacherName');
    window.location.href = "index.html"; // Redirect to notice board
  });
}

// ---- Load all notices and check auth when page opens ----
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchNotices();
});

// ---- Helper: Escape HTML to prevent XSS ----
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[match]);
}
// ====== End of Script ======