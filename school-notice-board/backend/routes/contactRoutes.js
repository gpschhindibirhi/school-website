const express = require('express');
const router = express.Router();
const ContactMessage = require('./../models/ContactMessage');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify transporter at startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('Transporter verification failed:', error);
    } else {
      console.log('Transporter ready for emails');
    }
  });
} catch (error) {
  console.error('Failed to create transporter:', error);
}

// Validate email
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone (India format: +91 followed by 10 digits)
function validatePhone(phone) {
  return /^\+91\s?\d{10}$/.test(phone);
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Input validation
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required | नाम और संदेश आवश्यक हैं' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Either email or phone is required | ईमेल या फोन में से एक आवश्यक है' });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format | अमान्य ईमेल प्रारूप' });
    }
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number (must be +91 followed by 10 digits) | अमान्य फोन नंबर (+91 के बाद 10 अंक)' });
    }

    // Save to database first
    const newMessage = new ContactMessage({ name, email, phone, message });
    await newMessage.save();
    console.log('Message saved to DB:', { name, email: email || 'N/A', phone: phone || 'N/A' });

    let emailSuccess = true;

    // Send email to school (notification)
    try {
      const schoolMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.TEACHER_EMAIL || 'gps.chhindibirhi@gmail.com',
        subject: 'New Contact Form Submission | नया संपर्क फॉर्म सबमिशन',
        text: `
नया संदेश प्राप्त हुआ | New message received from ${name}:

नाम | Name: ${name}
ईमेल | Email: ${email || 'नहीं दिया गया | Not provided'}
फोन | Phone: ${phone || 'नहीं दिया गया | Not provided'}
संदेश | Message: ${message}

---
Government Primary School, Chhindibirhi
        `,
        html: `
<h3>नया संदेश प्राप्त हुआ | New message received</h3>
<p><strong>नाम | Name:</strong> ${name}</p>
<p><strong>ईमेल | Email:</strong> ${email || 'नहीं दिया गया | Not provided'}</p>
<p><strong>फोन | Phone:</strong> ${phone || 'नहीं दिया गया | Not provided'}</p>
<p><strong>संदेश | Message:</strong><br>${message}</p>
<hr>
<p>Government Primary School, Chhindibirhi</p>
        `
      };

      await transporter.sendMail(schoolMailOptions);
      console.log('School notification email sent successfully');
    } catch (emailError) {
      console.error('School email failed:', emailError);
      emailSuccess = false;
    }

    // Send confirmation email to user (if email provided)
    if (email) {
      try {
        const userMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Thank You for Contacting Us | संपर्क करने के लिए धन्यवाद',
          text: `
प्रिय ${name},

आपका संदेश प्राप्त हो गया है। हम शीघ्र ही आपके संपर्क में होंगे।

आपका संदेश: ${message}

धन्यवाद,
सरकारी प्राथमिक स्कूल, छिंदिबिरही

---
Dear ${name},

Thank you for your message. We will get back to you soon.

Your message: ${message}

Best regards,
Government Primary School, Chhindibirhi
          `,
          html: `
<h3>धन्यवाद! | Thank You!</h3>
<p>प्रिय ${name},</p>
<p>आपका संदेश सफलतापूर्वक प्राप्त हो गया है। हम शीघ्र ही आपके संपर्क में होंगे।</p>
<p><strong>आपका संदेश | Your message:</strong><br>${message}</p>
<hr>
<p>धन्यवाद,<br>सरकारी प्राथमिक स्कूल, छिंदिबिरही</p>
          `
        };

        await transporter.sendMail(userMailOptions);
        console.log('User confirmation email sent successfully');
      } catch (emailError) {
        console.error('User email failed:', emailError);
        emailSuccess = false;
      }
    }

    // Success response (always return success since DB saves, but note if email failed)
    res.status(200).json({ 
      message: emailSuccess 
        ? 'आपका संदेश सफलतापूर्वक भेजा गया! हम शीघ्र संपर्क करेंगे। | Your message was sent successfully! We will contact you soon.' 
        : 'आपका संदेश सहेजा गया, लेकिन ईमेल भेजने में त्रुटि। हम संपर्क करेंगे। | Message saved, but email sending failed. We will contact you.'
    });

  } catch (dbError) {
    console.error('Database error:', dbError);
    res.status(500).json({ error: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें। | Server error. Please try again later.' });
  }
});

module.exports = router;