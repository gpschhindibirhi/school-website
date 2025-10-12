const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET = process.env.JWT_SECRET || "secret123";

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Get all notices (public)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new notice (Teacher only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNotice = new Notice({ title, content });
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a notice (Teacher only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!updatedNotice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json(updatedNotice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a notice (Teacher only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;