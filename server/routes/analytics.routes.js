import { Router } from 'express';
import analyticsService from '../services/analytics.service.js';
import auth from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Get aggregated dashboard statistics (admin).
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { campaignId } = req.query;
    const stats = await analyticsService.getDashboardStats(campaignId);
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return sendError(res, 'Failed to fetch dashboard stats');
  }
});

/**
 * GET /api/analytics/charts/:type
 * Get chart data by type (admin).
 * Types: visitors-by-day, submissions-by-day, top-countries, top-states,
 *        top-cities, browsers, devices, operating-systems, traffic-sources, utm-analytics
 */
router.get('/charts/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { campaignId, days } = req.query;
    const data = await analyticsService.getChartData(type, campaignId, Number(days) || 30);
    return sendSuccess(res, data);
  } catch (error) {
    console.error('Chart data error:', error);
    if (error.message.startsWith('Unknown chart type')) {
      return sendError(res, error.message, 400);
    }
    return sendError(res, 'Failed to fetch chart data');
  }
});

export default router;
