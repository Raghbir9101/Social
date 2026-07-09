import { Router } from 'express';
import aiService from '../services/ai.service.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * POST /api/ai/predict
 * Generate an AI compatibility prediction for two names (public).
 */
router.post('/predict', submissionLimiter, async (req, res) => {
  try {
    const { name1, name2, campaignId } = req.body;
    if (!name1?.trim() || !name2?.trim()) {
      return sendError(res, 'Both names are required', 400);
    }
    if (name1.length > 100 || name2.length > 100) {
      return sendError(res, 'Names are too long', 400);
    }
    const result = await aiService.generatePrediction(
      name1.trim(),
      name2.trim(),
      (campaignId || 'default').toString()
    );
    return sendSuccess(res, result);
  } catch (error) {
    console.error('AI predict error:', error);
    return sendError(res, 'Failed to generate prediction');
  }
});

export default router;
