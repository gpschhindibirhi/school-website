const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const SECRET         = process.env.JWT_SECRET || 'secret123';
const TOKEN_EXPIRY   = process.env.JWT_EXPIRY  || '8h';  // 8 hours — more practical than 1h

// ===== Simple in-memory brute-force guard =====
// Stores { count, firstAttempt } per email
const loginAttempts = new Map();
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email) {
  const now    = Date.now();
  const record = loginAttempts.get(email);

  if (!record) return { blocked: false };

  // Reset if lockout window has passed
  if (now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(email);
    return { blocked: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingMs  = LOCKOUT_MS - (now - record.firstAttempt);
    const remainingMin = Math.ceil(remainingMs / 60000);
    return { blocked: true, remainingMin };
  }

  return { blocked: false };
}

function recordFailedAttempt(email) {
  const now    = Date.now();
  const record = loginAttempts.get(email);
  if (!record) {
    loginAttempts.set(email, { count: 1, firstAttempt: now });
  } else {
    loginAttempts.set(email, { count: record.count + 1, firstAttempt: record.firstAttempt });
  }
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

// ===== POST /api/auth/teacher/login =====

router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input check
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required | ईमेल और पासवर्ड आवश्यक हैं' });
    }

    const emailLower = email.toLowerCase().trim();

    // Rate-limit check
    const limit = checkRateLimit(emailLower);
    if (limit.blocked) {
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${limit.remainingMin} minute(s). | बहुत अधिक प्रयास। ${limit.remainingMin} मिनट बाद पुनः प्रयास करें।`
      });
    }

    // Find teacher
    const teacher = await Teacher.findOne({ email: emailLower });
    if (!teacher) {
      recordFailedAttempt(emailLower);
      // Generic message to prevent email enumeration
      return res.status(401).json({ message: 'Invalid email or password | अमान्य ईमेल या पासवर्ड' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      recordFailedAttempt(emailLower);
      return res.status(401).json({ message: 'Invalid email or password | अमान्य ईमेल या पासवर्ड' });
    }

    // Success — clear failed attempts
    clearAttempts(emailLower);

    // Generate JWT
    const token = jwt.sign(
      { id: teacher._id, role: teacher.role, name: teacher.name },
      SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('✅ Teacher login:', teacher.email);

    res.status(200).json({
      message: 'Login successful | लॉगिन सफल',
      token,
      teacher: {
        name:  teacher.name,
        email: teacher.email,
        role:  teacher.role
      }
    });

  } catch (err) {
    console.error('❌ Auth error:', err.message);
    res.status(500).json({ message: 'Server error | सर्वर त्रुटि' });
  }
});

module.exports = router;