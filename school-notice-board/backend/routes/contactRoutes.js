const express = require('express');
const router = express.Router();
const ContactMessage = require('./../models/ContactMessage');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const newMessage = new ContactMessage({ name, email, phone, message });
    await newMessage.save();

    // Email to teacher
    const teacherMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEACHER_EMAIL,
      subject: 'New Contact Form Submission',
      text: `New submission from ${name}:\n\nName: ${name}\nEmail: ${email || 'Not provided'}\nPhone: ${phone || 'Not provided'}\nMessage: ${message}`
    };

    await transporter.sendMail(teacherMailOptions);

    // Optional email to user
    if (email) {
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Submission Confirmation',
        text: `Dear ${name},\n\nThank you for your submission. We have received your message and will get back to you soon.\n\nBest regards,\nGovernment Primary School, Chhindibirhi`
      };

      await transporter.sendMail(userMailOptions);
    }

    res.status(201).json({ message: 'संदेश सफलतापूर्वक जमा हुआ! | Message submitted successfully!' });
  } catch (err) {
    console.error('Error saving contact message or sending email:', err);
    res.status(500).json({ error: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें। | Server error. Please try again later.' });
  }
});

module.exports = router;