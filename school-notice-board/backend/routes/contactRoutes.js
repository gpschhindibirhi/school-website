const express        = require('express');
const router         = express.Router();
const ContactMessage = require('../models/ContactMessage');
const nodemailer     = require('nodemailer');
const dotenv         = require('dotenv');
dotenv.config();

// ===== EMAIL TRANSPORTER =====

let transporter        = null;
let emailConfigStatus  = { ready: false, error: null };

async function initTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    emailConfigStatus.error = 'Missing EMAIL_USER or EMAIL_PASS in .env';
    console.warn('⚠️  Email not configured:', emailConfigStatus.error);
    return;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS     // Use Gmail App Password
      },
      tls: { rejectUnauthorized: false } // Remove in strict production
    });

    await transporter.verify();
    emailConfigStatus = { ready: true, error: null };
    console.log('✅ Email transporter ready');
  } catch (err) {
    emailConfigStatus = { ready: false, error: err.message };
    console.error('❌ Email transporter init failed:', err.message);
    if (err.message.includes('Invalid login')) {
      console.error('💡 Enable Gmail App Passwords: https://myaccount.google.com/apppasswords');
    }
  }
}

initTransporter();

// ===== HELPERS =====

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  // Accept +91 followed by 10 digits (with optional space)
  return /^\+91\s?\d{10}$/.test(phone);
}

// Sanitise input — strip dangerous HTML chars
function sanitise(str) {
  if (!str) return '';
  return String(str).replace(/[<>"'`]/g, '').trim().slice(0, 2000);
}

async function sendWithRetry(options, retries = 2) {
  for (let i = 1; i <= retries; i++) {
    try {
      await transporter.sendMail(options);
      return { success: true };
    } catch (err) {
      console.error(`Email attempt ${i} failed:`, err.message);
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * i));
      else return { success: false, error: err.message };
    }
  }
}

function buildSchoolEmail(name, email, phone, message) {
  const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return {
    from:    `"GPS Chhindibirhi" <${process.env.EMAIL_USER}>`,
    to:      process.env.TEACHER_EMAIL || 'gps.chhindibirhi@gmail.com',
    subject: '🔔 New Contact Form Submission | नया संपर्क फॉर्म',
    text:    `Name: ${name}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}\n\n${date}`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#333;line-height:1.6}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .hdr{background:#1e40af;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center}
  .body{background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px}
  .row{background:#fff;margin:10px 0;padding:12px;border-radius:6px;border-left:3px solid #1e40af}
  .lbl{font-weight:bold;color:#1e40af;font-size:0.85rem;margin-bottom:4px}
  .ftr{text-align:center;color:#888;font-size:12px;margin-top:16px}
</style></head><body><div class="wrap">
  <div class="hdr"><h2>🔔 New Contact Form Submission</h2></div>
  <div class="body">
    <div class="row"><div class="lbl">Name / नाम</div><div>${name}</div></div>
    <div class="row"><div class="lbl">Email / ईमेल</div><div>${email || 'Not provided'}</div></div>
    <div class="row"><div class="lbl">Phone / फोन</div><div>${phone || 'Not provided'}</div></div>
    <div class="row"><div class="lbl">Message / संदेश</div><div>${message.replace(/\n/g,'<br>')}</div></div>
  </div>
  <div class="ftr"><p>Government Primary School, Chhindibirhi — ${date}</p></div>
</div></body></html>`
  };
}

function buildUserEmail(name, email, message) {
  return {
    from:    `"GPS Chhindibirhi" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: '✅ Thank You for Contacting Us | संपर्क करने के लिए धन्यवाद',
    text:    `Dear ${name},\n\nThank you! We received your message and will contact you soon.\n\nYour message:\n${message}\n\nGovernment Primary School, Chhindibirhi\n📞 +91 7000810232 | ✉️ gps.chhindibirhi@gmail.com`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#333;line-height:1.6}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .hdr{background:#16a34a;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center}
  .body{background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px}
  .msg{background:#fff;padding:15px;margin:12px 0;border-left:4px solid #16a34a;border-radius:4px}
  .ftr{text-align:center;color:#888;font-size:12px;margin-top:16px;border-top:1px solid #e2e8f0;padding-top:14px}
</style></head><body><div class="wrap">
  <div class="hdr"><h2>✅ धन्यवाद! | Thank You!</h2></div>
  <div class="body">
    <p><strong>प्रिय ${name} | Dear ${name},</strong></p>
    <p>आपका संदेश मिल गया। हम जल्द संपर्क करेंगे।<br>
    <em>We have received your message and will get back to you soon.</em></p>
    <div class="msg"><strong>Your message:</strong><br><br>${message.replace(/\n/g,'<br>')}</div>
  </div>
  <div class="ftr">
    <p><strong>Government Primary School, Chhindibirhi</strong><br>
    Rajnandgaon, Chhattisgarh | 📞 +91 7000810232 | ✉️ gps.chhindibirhi@gmail.com</p>
  </div>
</div></body></html>`
  };
}

// ===== POST /api/contact =====

router.post('/', async (req, res) => {
  try {
    // Sanitise inputs
    const name    = sanitise(req.body.name);
    const email   = sanitise(req.body.email);
    const phone   = sanitise(req.body.phone);
    const message = sanitise(req.body.message);

    // ---- Validation ----
    if (!name) {
      return res.status(400).json({ error: 'Name is required | नाम आवश्यक है' });
    }
    if (!message) {
      return res.status(400).json({ error: 'Message is required | संदेश आवश्यक है' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone required | ईमेल या फोन आवश्यक है' });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email | अमान्य ईमेल' });
    }
    if (phone && phone !== '+91 ' && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone (need +91 + 10 digits) | अमान्य फोन (+91 और 10 अंक)' });
    }

    // ---- Save to DB (always, regardless of email status) ----
    const saved = await new ContactMessage({
      name,
      email:   email   || null,
      phone:   (phone && phone !== '+91 ') ? phone : null,
      message
    }).save();

    console.log('✅ Contact message saved:', { id: saved._id, name, email: email || 'N/A' });

    // ---- Send emails ----
    const emailResults = { schoolEmail: false, userEmail: false };

    if (emailConfigStatus.ready && transporter) {
      // Notification to school
      const schoolResult = await sendWithRetry(buildSchoolEmail(name, email, phone, message));
      emailResults.schoolEmail = schoolResult.success;
      if (schoolResult.success) console.log('✅ School notification sent');
      else console.error('❌ School email failed:', schoolResult.error);

      // Confirmation to user (only if email provided)
      if (email) {
        const userResult = await sendWithRetry(buildUserEmail(name, email, message));
        emailResults.userEmail = userResult.success;
        if (userResult.success) console.log('✅ User confirmation sent to', email);
        else console.error('❌ User email failed:', userResult.error);
      }
    } else {
      console.warn('⚠️  Emails skipped — transporter not ready:', emailConfigStatus.error);
    }

    // ---- Response message ----
    let responseMessage;
    if (!emailConfigStatus.ready) {
      responseMessage = 'आपका संदेश सहेजा गया है। | Your message has been saved.';
    } else if (emailResults.schoolEmail || emailResults.userEmail) {
      responseMessage = 'आपका संदेश सफलतापूर्वक भेजा गया! हम शीघ्र संपर्क करेंगे। | Message sent successfully! We will contact you soon.';
    } else {
      responseMessage = 'आपका संदेश सहेजा गया, ईमेल में देरी हो सकती है। | Message saved, email may be delayed.';
    }

    res.status(200).json({
      message: responseMessage,
      emailStatus: {
        configured:      emailConfigStatus.ready,
        schoolEmailSent: emailResults.schoolEmail,
        userEmailSent:   emailResults.userEmail
      }
    });

  } catch (err) {
    console.error('❌ Contact route error:', err.message);
    res.status(500).json({
      error:   'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें। | Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ===== GET /api/contact/email-status =====

router.get('/email-status', (_req, res) => {
  res.json({
    emailConfigured: emailConfigStatus.ready,
    error:           emailConfigStatus.error,
    emailUser:       process.env.EMAIL_USER  ? '✅ Set' : '❌ Not set',
    emailPass:       process.env.EMAIL_PASS  ? '✅ Set' : '❌ Not set',
    teacherEmail:    process.env.TEACHER_EMAIL || 'gps.chhindibirhi@gmail.com (default)'
  });
});

module.exports = router;