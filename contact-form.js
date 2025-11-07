// Contact Form Handler
    const form = document.getElementById('contactForm');
    const formResponse = document.getElementById('formResponse');
    const submitBtn = document.getElementById('submitBtn');
    const phoneInput = document.getElementById('phone');

    // Ensure +91 stays in phone input
    phoneInput.addEventListener('input', () => {
      if (!phoneInput.value.startsWith('+91 ')) {
        phoneInput.value = '+91 ' + phoneInput.value.replace(/^\+91\s?/, '');
      }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      formResponse.textContent = '';
      formResponse.className = 'form-response';
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = phoneInput.value.trim();
      const message = document.getElementById('message').value.trim();

      // Reset invalid field styles
      document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(field => {
        field.classList.remove('invalid');
      });

      // Validate required fields
      if (!name) {
        showError('कृपया अपना नाम दर्ज करें | Please enter your name', 'name');
        return;
      }

      if (!message) {
        showError('कृपया अपना संदेश दर्ज करें | Please enter your message', 'message');
        return;
      }

      if (!email && !phone) {
        showError('कृपया ईमेल या फोन नंबर में से एक दर्ज करें | Please enter either an email or phone number', 'email');
        document.getElementById('phone').classList.add('invalid');
        return;
      }

      // Validate email if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        showError('कृपया वैध ईमेल दर्ज करें | Please enter a valid email', 'email');
        return;
      }

      // Validate phone if provided
      const phoneRegex = /^\+91\s?\d{10}$/;
      if (phone && phone !== '+91 ' && !phoneRegex.test(phone)) {
        showError('कृपया वैध 10 अंकों का फोन नंबर दर्ज करें (+91 के साथ) | Please enter a valid 10-digit phone number (with +91)', 'phone');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> <span class="lang-hindi">भेजा जा रहा है...</span><span class="lang-english">Sending...</span>';
      submitBtn.classList.add('loading');

      // Create timeout promise (10 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      try {
        // Fetch with timeout
        const response = await Promise.race([
          fetch('https://school-backend-14ld.onrender.com/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name, 
              email, 
              phone: phone === '+91 ' ? '' : phone, 
              message 
            })
          }),
          timeoutPromise
        ]);

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          data = { message: 'आपका संदेश सफलतापूर्वक भेजा गया! | Your message was sent successfully!' };
          console.warn('JSON parse error, assuming success:', jsonError);
        }

        showSuccess(data.message || 'आपका संदेश सफलतापूर्वक भेजा गया! | Your message was sent successfully!');

        // Clear form on success
        form.reset();
        phoneInput.value = '+91 ';

      } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('timeout')) {
          showError('सर्वर से कनेक्शन त्रुटि या टाइमआउट। कृपया बाद में पुनः प्रयास करें। | Connection error or timeout. Please try again later.');
        } else {
          showError('सर्वर त्रुटि। आपका संदेश संभवतः भेजा गया है, लेकिन पुष्टि नहीं हो सकी। | Server error. Your message may have been sent, but confirmation failed.');
        }
        console.error('Form submission error:', error);

        // Clear form anyway
        form.reset();
        phoneInput.value = '+91 ';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="lang-hindi">संदेश भेजें</span><span class="lang-english">Send Message</span>';
        submitBtn.classList.remove('loading');
      }
    });

    // Helper functions
    function showError(message, fieldId = null) {
      formResponse.textContent = message;
      formResponse.className = 'form-response error';
      if (fieldId) {
        document.getElementById(fieldId).classList.add('invalid');
        document.getElementById(fieldId).focus();
      }
    }

    function showSuccess(message) {
      formResponse.textContent = message;
      formResponse.className = 'form-response success';
    }