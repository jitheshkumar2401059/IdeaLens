const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const errorHandler = require('./middleware/error');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const similarityRoutes = require('./routes/similarity.routes');
const reviewRoutes = require('./routes/review.routes');
const traceabilityRoutes = require('./routes/traceability.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const domainRoutes = require('./routes/domain.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Disable ETags globally so dynamic authenticated REST endpoints never return 304 Not Modified
app.set('etag', false);

// CORS configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:4200',
  'http://127.0.0.1:4200'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Prevent stale HTTP caching on all authenticated and dynamic REST API endpoints
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'IdeaLens - AI Project Idea & Novelty Analysis Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes - mount specific sub-resource routes before generic parameterized routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', traceabilityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/similarity', similarityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/domains', domainRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`
  });
});

// Global centralized error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[IdeaLens Backend] Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`[IdeaLens Backend] Health check: http://localhost:${PORT}/api/health`);
    });
    return server;
  } catch (error) {
    console.error('[IdeaLens Backend] Startup error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
