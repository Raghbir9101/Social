import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { validateLogin } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Hash password on startup for comparison
let hashedPassword = null;
const getHashedPassword = async () => {
  if (!hashedPassword) {
    hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  }
  return hashedPassword;
};

/**
 * POST /api/auth/login
 * Authenticate admin user and return JWT.
 */
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username
    if (username !== env.ADMIN_USERNAME) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check password (compare against env password directly for simplicity)
    if (password !== env.ADMIN_PASSWORD) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { username, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return sendSuccess(res, { token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed');
  }
});

export default router;
