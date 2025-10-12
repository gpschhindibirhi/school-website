const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const SECRET = process.env.JWT_SECRET || "secret123";

// Teacher Login Route
router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Check if teacher exists
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Step 3: Generate JWT token
    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      teacher: { name: teacher.name, email: teacher.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;