const express = require('express');
const router = express.Router();
const ContactMessage = require('./../models/ContactMessage');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Email configuration status
let emailConfigStatus = {
  ready: false,
  error: null
};

// Initialize transporter with better error handling
let transporter = null;

async function initializeTransporter() {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured in .env file');
      emailConfigStatus.error = 'Missing EMAIL_USER or EMAIL_PASS in .env';
      return;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Simplified config - remove pooling for better reliability
      tls: {
        rejectUnauthorized: false // For development, remove in production
      }
    });

    // Verify transporter
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    emailConfigStatus.ready = true;
    emailConfigStatus.error = null;

  } catch (error) {
    console.error('❌ Email transporter initialization failed:', error.message);
    emailConfigStatus.error = error.message;
    emailConfigStatus.ready = false;
    
    // Common issues and solutions
    if (error.message.includes('Invalid login')) {
      console.error('💡 Solution: Enable "App Passwords" in Gmail settings');
      console.error('   Visit: https://myaccount.google.com/apppasswords');
    }
  }
}

// Initialize on startup
initializeTransporter();

// Validation functions
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+91\s?\d{10}$/.test(phone);
}

// Send email with retry logic
async function sendEmailWithRetry(mailOptions, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error(`Email attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        return { success: false, error: error.message };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Input validation
    if (!name || !message) {
      return res.status(400).json({ 
        error: 'Name and message are required | नाम और संदेश आवश्यक हैं' 
      });
    }
    
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'Either email or phone is required | ईमेल या फोन में से एक आवश्यक है' 
      });
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format | अमान्य ईमेल प्रारूप' 
      });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number (must be +91 followed by 10 digits) | अमान्य फोन नंबर (+91 के बाद 10 अंक)' 
      });
    }

    // Save to database first (priority)
    const newMessage = new ContactMessage({ 
      name, 
      email: email || null, 
      phone: phone || null, 
      message 
    });
    
    await newMessage.save();
    console.log('✅ Message saved to database:', { 
      name, 
      email: email || 'N/A', 
      phone: phone || 'N/A' 
    });

    // Track email sending results
    let emailResults = {
      schoolEmail: false,
      userEmail: false
    };

    // Try to send emails if transporter is ready
    if (emailConfigStatus.ready && transporter) {
      
      // 1. Send notification email to school
      try {
        const schoolMailOptions = {
          from: `"Government Primary School" <${process.env.EMAIL_USER}>`,
          to: process.env.TEACHER_EMAIL || 'gps.chhindibirhi@gmail.com',
          subject: '🔔 New Contact Form Submission | नया संपर्क फॉर्म सबमिशन',
          text: `
नया संदेश प्राप्त हुआ | New message received

नाम | Name: ${name}
ईमेल | Email: ${email || 'नहीं दिया गया | Not provided'}
फोन | Phone: ${phone || 'नहीं दिया गया | Not provided'}

संदेश | Message:
${message}

---
Government Primary School, Chhindibirhi
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          `,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .field { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
    .label { font-weight: bold; color: #2196F3; }
    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔔 नया संपर्क फॉर्म | New Contact Form</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">नाम | Name:</div>
        <div>${name}</div>
      </div>
      <div class="field">
        <div class="label">ईमेल | Email:</div>
        <div>${email || 'नहीं दिया गया | Not provided'}</div>
      </div>
      <div class="field">
        <div class="label">फोन | Phone:</div>
        <div>${phone || 'नहीं दिया गया | Not provided'}</div>
      </div>
      <div class="field">
        <div class="label">संदेश | Message:</div>
        <div>${message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="footer">
      <p>Government Primary School, Chhindibirhi</p>
      <p>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    </div>
  </div>
</body>
</html>
          `
        };

        const schoolResult = await sendEmailWithRetry(schoolMailOptions);
        emailResults.schoolEmail = schoolResult.success;
        
        if (schoolResult.success) {
          console.log('✅ School notification email sent');
        } else {
          console.error('❌ School email failed:', schoolResult.error);
        }
        
      } catch (error) {
        console.error('❌ School email error:', error.message);
      }

      // 2. Send confirmation email to user (only if email provided)
      if (email) {
        try {
          const userMailOptions = {
            from: `"Government Primary School" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✅ Thank You for Contacting Us | संपर्क करने के लिए धन्यवाद',
            text: `
प्रिय ${name},

आपका संदेश सफलतापूर्वक प्राप्त हो गया है। हम शीघ्र ही आपके संपर्क में होंगे।

आपका संदेश:
${message}

धन्यवाद,
सरकारी प्राथमिक स्कूल, छिंदिबिरही
राजनांदगाँव, छत्तीसगढ़

---
Dear ${name},

Thank you for your message. We have received it successfully and will get back to you soon.

Your message:
${message}

Best regards,
Government Primary School, Chhindibirhi
Rajnandgaon, Chhattisgarh

Phone: +91 7000810232
Email: gps.chhindibirhi@gmail.com
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .message-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ धन्यवाद! | Thank You!</h2>
    </div>
    <div class="content">
      <p><strong>प्रिय ${name},</strong></p>
      <p>आपका संदेश सफलतापूर्वक प्राप्त हो गया है। हम शीघ्र ही आपके संपर्क में होंगे।</p>
      
      <div class="message-box">
        <strong>आपका संदेश | Your message:</strong><br><br>
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p><em>Dear ${name},</em></p>
      <p><em>Thank you for contacting us. We have received your message and will respond soon.</em></p>
    </div>
    <div class="footer">
      <p><strong>सरकारी प्राथमिक स्कूल, छिंदिबिरही</strong><br>
      <strong>Government Primary School, Chhindibirhi</strong></p>
      <p>राजनांदगाँव, छत्तीसगढ़ | Rajnandgaon, Chhattisgarh</p>
      <p>📞 +91 7000810232 | ✉️ gps.chhindibirhi@gmail.com</p>
    </div>
  </div>
</body>
</html>
            `
          };

          const userResult = await sendEmailWithRetry(userMailOptions);
          emailResults.userEmail = userResult.success;
          
          if (userResult.success) {
            console.log('✅ User confirmation email sent to', email);
          } else {
            console.error('❌ User email failed:', userResult.error);
          }
          
        } catch (error) {
          console.error('❌ User email error:', error.message);
        }
      }
    } else {
      console.warn('⚠️ Emails not sent - Transporter not ready');
      console.warn('   Error:', emailConfigStatus.error || 'Not initialized');
    }

    // Return success response (DB save succeeded)
    const responseMessage = emailConfigStatus.ready
      ? (emailResults.schoolEmail || emailResults.userEmail)
        ? 'आपका संदेश सफलतापूर्वक भेजा गया! हम शीघ्र संपर्क करेंगे। | Your message was sent successfully! We will contact you soon.'
        : 'आपका संदेश सहेजा गया, लेकिन ईमेल भेजने में त्रुटि। हम संपर्क करेंगे। | Message saved, but email sending failed. We will contact you.'
      : 'आपका संदेश सहेजा गया है। ईमेल सिस्टम अभी उपलब्ध नहीं है। | Your message is saved. Email system is currently unavailable.';

    res.status(200).json({ 
      message: responseMessage,
      emailStatus: {
        configured: emailConfigStatus.ready,
        schoolEmailSent: emailResults.schoolEmail,
        userEmailSent: emailResults.userEmail
      }
    });

  } catch (error) {
    console.error('❌ Route error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें। | Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint for email system
router.get('/email-status', (req, res) => {
  res.json({
    emailConfigured: emailConfigStatus.ready,
    error: emailConfigStatus.error,
    emailUser: process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured',
    emailPass: process.env.EMAIL_PASS ? '✅ Configured' : '❌ Not configured',
    teacherEmail: process.env.TEACHER_EMAIL || 'Using default: gps.chhindibirhi@gmail.com'
  });
});

module.exports = router;