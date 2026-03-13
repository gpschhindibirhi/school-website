const express = require('express');
const router  = express.Router();
const Notice  = require('../models/Notice');
const jwt     = require('jsonwebtoken');
const dotenv  = require('dotenv');
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'secret123';

// ===== Auth Middleware =====

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required | प्रमाणीकरण आवश्यक है' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please login again | सत्र समाप्त हो गया। पुनः लॉगिन करें।' });
      }
      return res.status(403).json({ error: 'Invalid token | अमान्य टोकन' });
    }
    req.user = decoded;
    next();
  });
};

// ===== GET /api/notices — Public =====

router.get('/', async (_req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 }).lean();
    res.json(notices);
  } catch (err) {
    console.error('❌ Get notices error:', err.message);
    res.status(500).json({ error: 'Could not fetch notices | नोटिस लोड नहीं हो सकीं' });
  }
});

// ===== POST /api/notices — Teacher only =====

router.post('/', authenticateToken, async (req, res) => {
  try {
    const title   = (req.body.title   || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required | शीर्षक और विवरण आवश्यक हैं' });
    }

    const notice = await new Notice({ title, content }).save();
    console.log('✅ Notice created:', notice._id, '—', title.slice(0, 40));
    res.status(201).json(notice);
  } catch (err) {
    console.error('❌ Create notice error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ===== PUT /api/notices/:id — Teacher only =====

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const title   = (req.body.title   || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required | शीर्षक और विवरण आवश्यक हैं' });
    }

    const updated = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Notice not found | नोटिस नहीं मिली' });
    }

    console.log('✅ Notice updated:', updated._id);
    res.json(updated);
  } catch (err) {
    console.error('❌ Update notice error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ===== DELETE /api/notices/:id — Teacher only =====

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Notice not found | नोटिस नहीं मिली' });
    }
    console.log('✅ Notice deleted:', req.params.id);
    res.json({ message: 'Notice deleted successfully | नोटिस सफलतापूर्वक हटाई गई' });
  } catch (err) {
    console.error('❌ Delete notice error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;