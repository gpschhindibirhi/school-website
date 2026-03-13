const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');

// Load environment variables
dotenv.config({ override: true });

const app = express();

// ===== ALLOWED ORIGINS =====
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'https://pschhindibirhi.netlify.app',
  'https://gps-chhindibirhi.netlify.app'
];

// ===== MIDDLEWARE =====

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger
app.use((req, _res, next) => {
  console.log(`📨 ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root
app.get('/', (_req, res) => {
  res.json({
    message: '🏫 Government Primary School Chhindibirhi — Backend API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health:      'GET  /health',
      notices:     'GET  /api/notices',
      addNotice:   'POST /api/notices (auth required)',
      login:       'POST /api/auth/teacher/login',
      contact:     'POST /api/contact',
      emailStatus: 'GET  /api/contact/email-status'
    }
  });
});

// Mount routes
const noticeRoutes  = require('./routes/noticeroutes');
const authRoutes    = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/notices', noticeRoutes);
app.use('/api/auth',    authRoutes);
app.use('/api/contact', contactRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error:   'Route not found',
    path:    req.path,
    method:  req.method,
    message: 'The requested endpoint does not exist'
  });
});

// ===== GLOBAL ERROR HANDLER =====
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err.stack);
  res.status(err.status || 500).json({
    error:     'Internal server error',
    message:   process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// ===== MONGODB =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ MongoDB connected —', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('💡 Check MONGO_URI in your .env file');
    process.exit(1);
  }
};

connectDB();

mongoose.connection.on('error',        err  => console.error('❌ MongoDB error:', err.message));
mongoose.connection.on('disconnected', ()   => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected',  ()   => console.log('✅ MongoDB reconnected'));

// ===== START SERVER =====
const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local:  http://localhost:${PORT}`);
  console.log(`🌐 Env:    ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
  console.log('');
});

// ===== GRACEFUL SHUTDOWN =====
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));