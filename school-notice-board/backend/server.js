const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const noticeRoutes = require('./routes/noticeroutes');
app.use('/api/notices', noticeRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const contactRoutes = require('./routes/contactRoutes'); // New route
app.use('/api/contact', contactRoutes); // New endpoint

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));