import { webcrypto } from 'crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import env from './config/env.js';
import { securityMiddleware, sanitizeInput } from './middleware/security.js';
import logger from './middleware/logger.js';
import seedCampaigns from './utils/seed.js';
import { isBot, buildOGHtml } from './utils/ogMeta.js';

// Models needed for dynamic OG tag lookups
import Campaign from './models/Campaign.js';
import QuestionBox from './models/QuestionBox.js';
import Submission from './models/Submission.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import visitorRoutes from './routes/visitor.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import questionRoutes from './routes/question.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const app = express();

// ─── Middleware ──────────────────────────────────────
// Security headers & CORS
securityMiddleware().forEach(mw => app.use(mw));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// XSS sanitization
app.use(sanitizeInput);

// Request logging
app.use(logger(env.NODE_ENV));

// ─── API Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/qna', questionRoutes);

// ─── Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// ─── 404 Handler (API only) ─────────────────────────
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ─── Static files ───────────────────────────────────
app.use(express.static(CLIENT_DIST));

// ─── OG / Social-Preview Middleware ─────────────────
// Intercepts link-preview bots before serving the SPA and returns a lightweight
// HTML page populated with the correct Open Graph / Twitter Card meta tags.
app.use(async (req, res, next) => {
  const ua = req.headers['user-agent'] || '';

  // Only handle crawler requests for non-API, non-asset paths
  if (!isBot(ua) || req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|ico|svg|woff2?)$/)) {
    return next();
  }

  const base = `${req.protocol}://${req.get('host')}`;
  const url = `${base}${req.originalUrl}`;
  const defaultImage = `${base}/og-campaign.png`;

  try {
    // ── Shared result link: e.g. /love-compatibility?r=abc123 ──
    const shareId = req.query.r;
    if (shareId) {
      const sub = await Submission.findOne({ shareId })
        .select('name1 name2 score result campaignId')
        .lean();
      if (sub) {
        return res.send(buildOGHtml({
          title: `${sub.name1} & ${sub.name2} scored ${sub.score}% 💖`,
          description: `Our AI reveals: "${(sub.result || '').slice(0, 120)}…" — Check your own match now!`,
          image: defaultImage,
          url,
        }));
      }
    }

    // ── Anonymous question box: /q/:boxId ──
    const qMatch = req.path.match(/^\/q\/([^/]+)$/);
    if (qMatch) {
      const box = await QuestionBox.findOne({ boxId: qMatch[1] }).lean();
      if (box) {
        return res.send(buildOGHtml({
          title: box.title,
          description: box.description || 'Send me an anonymous question — they will never know it was you.',
          image: `${base}/og-question.png`,
          url,
          themeColor: '#7c3aed',
        }));
      }
    }

    // ── Campaign page: /:campaignId ──
    const campaignMatch = req.path.match(/^\/([^/]+)$/);
    if (campaignMatch && !req.path.startsWith('/admin')) {
      const campaignId = req.path.replace(/^\//, '');
      const campaign = await Campaign.findOne({ campaignId }).lean();
      if (campaign) {
        return res.send(buildOGHtml({
          title: `${campaign.title} 💕 — AI Compatibility Test`,
          description: campaign.description || 'Discover your compatibility score with AI-powered predictions!',
          image: defaultImage,
          url,
        }));
      }
    }
  } catch (err) {
    console.error('OG meta lookup error:', err.message);
  }

  // ── Default OG fallback ──
  return res.send(buildOGHtml({
    title: 'AI Predictions — Love Compatibility',
    description: 'Discover your AI-powered compatibility score! Enter two names and let our advanced AI reveal your prediction. 💕',
    image: defaultImage,
    url,
  }));
});

// ─── SPA Fallback ───────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// ─── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ───────────────────────────────────
const start = async () => {
  await connectDB();
  await seedCampaigns();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
  });
};

start();
