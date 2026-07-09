import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';

/**
 * Security middleware setup.
 * Returns an array of middleware functions.
 */
export const securityMiddleware = () => [
  // Set secure HTTP headers
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disabled for dev flexibility
  }),

  // CORS configuration
  cors({
    origin: env.NODE_ENV === 'development'
      ? (origin, callback) => {
          // Allow any localhost origin in development
          if (!origin || origin.startsWith('http://localhost')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      : env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];

/**
 * XSS sanitization middleware.
 * Strips potential XSS from string fields in request body.
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove script tags and event handlers
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/on\w+\s*=\s*'[^']*'/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};
