const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const metaRoutes = require('./routes/meta');
const papersRoutes = require('./routes/papers');
const suggestionsRoutes = require('./routes/suggestions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting if behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Rate limiter for general public requests (300 req per 15 min)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter rate limiter for paper uploads and suggestions (30 submissions per 15 min)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Submission limit reached for your IP. Please try again after 15 minutes.' },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PaperVault API',
    institution: 'UPTTI Kanpur',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/meta', publicLimiter, metaRoutes);
app.use('/api/papers', publicLimiter, papersRoutes);
app.use('/api/suggestions', submissionLimiter, suggestionsRoutes);
app.use('/api/admin', adminRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[PaperVault Server] running on http://localhost:${PORT}`);
  });
}

module.exports = app;
