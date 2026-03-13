'use strict';

// ====== Contact Form Handler ======
(function () {

  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const phoneInput = document.getElementById('phone');
  const messageTA  = document.getElementById('message');

  // The response banner — NOTE: we move it OUTSIDE the <form> on init
  // so form.reset() never wipes its content.
  const formResp = document.getElementById('formResponse');

  if (!form || !formResp) return;

  // ── Move response banner outside <form> so form.reset() can't clear it ──
  // Insert it right after the closing </form> tag in the DOM.
  if (form.contains(formResp)) {
    form.parentNode.insertBefore(formResp, form.nextSibling);
  }

  // ── showBanner: the ONE reliable way to show/hide the response ──────────
  function showBanner(message, type) {
    formResp.textContent     = message;
    formResp.className       = 'form-response ' + type;  // adds .success or .error
    formResp.style.display   = 'block';                   // explicit — never rely on :not(:empty)
    formResp.style.opacity   = '0';
    formResp.style.transform = 'translateY(6px)';

    // Small fade-in so user notices it appearing
    requestAnimationFrame(() => {
      formResp.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      formResp.style.opacity    = '1';
      formResp.style.transform  = 'translateY(0)';
    });

    // Scroll into view gently
    setTimeout(() => {
      formResp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }

  function hideBanner() {
    formResp.style.display  = 'none';
    formResp.textContent    = '';
    formResp.className      = 'form-response';
  }

  // ── Loading state ────────────────────────────────────────────────────────
  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('loading', on);
    submitBtn.innerHTML = on
      ? '<span class="spinner"></span><span class="lang-hindi"> भेजा जा रहा है…</span><span class="lang-english"> Sending…</span>'
      : '<span class="lang-hindi">📤 संदेश भेजें</span><span class="lang-english">📤 Send Message</span>';
  }

  // ── Phone prefix guard ───────────────────────────────────────────────────
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      if (!phoneInput.value.startsWith('+91 ')) {
        phoneInput.value = '+91 ' + phoneInput.value.replace(/^\+91\s?/, '');
      }
    });
    phoneInput.addEventListener('keydown', (e) => {
      if (phoneInput.selectionStart <= 4 &&
          (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
      }
    });
  }

  // ── Character counter for message ────────────────────────────────────────
  const MAX_MSG = 500;
  if (messageTA) {
    messageTA.setAttribute('maxlength', MAX_MSG);
    const counter = document.createElement('div');
    counter.setAttribute('aria-live', 'polite');
    counter.style.cssText = 'font-size:0.75rem;color:var(--text-muted);text-align:right;margin-top:4px;';
    counter.textContent = `0 / ${MAX_MSG}`;
    messageTA.parentNode.appendChild(counter);
    messageTA.addEventListener('input', () => {
      const len = messageTA.value.length;
      counter.textContent = `${len} / ${MAX_MSG}`;
      counter.style.color = len > MAX_MSG * 0.9 ? '#ef4444' : 'var(--text-muted)';
    });
  }

  // ── Inline field error helpers ───────────────────────────────────────────
  function setFieldError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('invalid');

    // Remove old hint first
    const old = document.getElementById(fieldId + '-hint');
    if (old) old.remove();

    const hint = document.createElement('p');
    hint.id           = fieldId + '-hint';
    hint.role         = 'alert';
    hint.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:5px;margin-bottom:0;';
    hint.textContent  = msg;
    field.parentNode.appendChild(hint);

    // Focus only the first invalid field
    if (!form.querySelector('.invalid:focus')) field.focus();
  }

  function clearAllFieldErrors() {
    form.querySelectorAll('.invalid').forEach(f => f.classList.remove('invalid'));
    form.querySelectorAll('[id$="-hint"]').forEach(el => el.remove());
  }

  // Clear field error as user types
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('invalid');
      const hint = document.getElementById(field.id + '-hint');
      if (hint) hint.remove();
    });
  });

  // ── Form Submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    hideBanner();
    clearAllFieldErrors();

    const name    = (document.getElementById('name')?.value  || '').trim();
    const email   = (document.getElementById('email')?.value || '').trim();
    const phone   = (phoneInput?.value                        || '').trim();
    const message = (messageTA?.value                         || '').trim();

    // ── Validation ──────────────────────────────────────────────
    let hasError = false;

    if (!name) {
      setFieldError('name', 'कृपया अपना नाम दर्ज करें | Please enter your name');
      hasError = true;
    }
    if (!message) {
      setFieldError('message', 'कृपया संदेश दर्ज करें | Please enter your message');
      hasError = true;
    }

    const phoneEmpty = !phone || phone === '+91 ';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+91\s?\d{10}$/;

    if (!email && phoneEmpty) {
      setFieldError('email', 'ईमेल या फोन में से एक दर्ज करें | Please enter email or phone');
      document.getElementById('phone')?.classList.add('invalid');
      hasError = true;
    }
    if (email && !emailRegex.test(email)) {
      setFieldError('email', 'वैध ईमेल दर्ज करें | Please enter a valid email');
      hasError = true;
    }
    if (!phoneEmpty && !phoneRegex.test(phone)) {
      setFieldError('phone', 'वैध 10 अंकों का नंबर (+91 सहित) | Valid 10-digit number with +91');
      hasError = true;
    }

    if (hasError) return;

    // ── Send ────────────────────────────────────────────────────
    setLoading(true);

    try {
      const response = await Promise.race([
        fetch('https://school-backend-14ld.onrender.com/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone:   phoneEmpty ? '' : phone,
            message
          })
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        )
      ]);

      // Read JSON regardless of status so we can show server's error message
      let data = {};
      try { data = await response.json(); } catch (_) {}

      if (!response.ok) {
        // Server returned 4xx/5xx — show its message if available
        const serverMsg = data.error || data.message || `Error ${response.status}`;
        throw new Error(serverMsg);
      }

      // ✅ SUCCESS — show banner BEFORE resetting form
      showBanner(
        data.message ||
        'आपका संदेश सफलतापूर्वक भेजा गया! ✅ हम शीघ्र संपर्क करेंगे। | Message sent successfully! ✅ We will contact you soon.',
        'success'
      );

      // Reset AFTER showing banner (banner is now outside <form> so safe)
      form.reset();
      if (phoneInput) phoneInput.value = '+91 ';
      if (messageTA) {
        const counter = messageTA.parentNode.querySelector('div[aria-live]');
        if (counter) counter.textContent = `0 / ${MAX_MSG}`;
      }

    } catch (err) {
      console.error('Contact form error:', err);

      let errorMsg;
      if (err.message === 'timeout' || err.name === 'TypeError') {
        errorMsg = 'कनेक्शन टाइमआउट। कृपया बाद में पुनः प्रयास करें। | Connection timeout. Please try again later.';
      } else {
        errorMsg = `त्रुटि: ${err.message} | Error: ${err.message}`;
      }

      // ❌ ERROR — show banner (form is NOT reset on error so user keeps their text)
      showBanner(errorMsg, 'error');

    } finally {
      setLoading(false);
    }
  });

})();