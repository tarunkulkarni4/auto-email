require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const profileRoutes = require('./routes/profileRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean).map(o => o.replace(/\/$/, '')); // Remove trailing slashes

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Root Route ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).send('<h1>🚀 AI MailCraft API is live!</h1><p>Connect your frontend to start generating emails.</p>');
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api', profileRoutes);
app.use('/api', applicationRoutes);
app.use('/api', authRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Job Application Automation Tool - API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.',
    });
  }

  if (err.message?.includes('Only')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
