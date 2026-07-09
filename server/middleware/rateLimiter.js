import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for public API endpoints.
 * 100 requests per minute per IP.
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for auth endpoints.
 * 10 requests per minute per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for submission endpoints.
 * 30 requests per minute per IP.
 */
export const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many submissions. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
