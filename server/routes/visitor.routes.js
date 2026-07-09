import { Router } from 'express';
import visitorService from '../services/visitor.service.js';
import locationService from '../services/location.service.js';
import auth from '../middleware/auth.js';
import { validateVisitorTrack, validatePagination } from '../middleware/validate.js';
import { publicLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const router = Router();

/**
 * POST /api/visitors/track
 * Track a visitor's analytics data (public).
 */
router.post('/track', publicLimiter, validateVisitorTrack, async (req, res) => {
  try {
    // Get real IP from headers or connection
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || req.ip
      || '';

    const trackingData = {
      ...req.body,
      ip,
    };

    const loc = trackingData.location;
    if (loc?.source === 'browser_gps' && loc.latitude != null && loc.longitude != null) {
      // GPS coordinates present — reverse geocode to fill in city/state/country
      const geoNames = await locationService.reverseGeocode(loc.latitude, loc.longitude);
      trackingData.location = { ...loc, ...geoNames };
    } else {
      // No GPS — fall back to IP-based lookup
      const ipLocation = await locationService.lookupByIP(ip);
      trackingData.location = {
        ...ipLocation,
        ...(loc || {}),
        source: loc?.source || ipLocation.source,
      };
    }

    const result = await visitorService.track(trackingData);
    return sendSuccess(res, { tracked: true }, 'Visitor tracked');
  } catch (error) {
    console.error('Track visitor error:', error);
    return sendError(res, 'Failed to track visitor');
  }
});

/**
 * POST /api/visitors/location
 * IP-based location lookup for client fallback (public).
 */
router.post('/location', publicLimiter, async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || req.ip
      || '';

    const location = await locationService.lookupByIP(ip);
    return sendSuccess(res, location);
  } catch (error) {
    console.error('Location lookup error:', error);
    return sendError(res, 'Failed to lookup location');
  }
});

/**
 * GET /api/visitors
 * List all visitors with pagination (admin).
 */
router.get('/', auth, validatePagination, async (req, res) => {
  try {
    const { page, limit, campaignId, variant, search, sortBy, sortOrder } = req.query;
    const result = await visitorService.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      campaignId,
      variant,
      search,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1,
    });
    return sendPaginated(res, result.visitors, result.pagination);
  } catch (error) {
    console.error('List visitors error:', error);
    return sendError(res, 'Failed to fetch visitors');
  }
});

/**
 * GET /api/visitors/:visitorId
 * Get a single visitor's details (admin).
 */
router.get('/:visitorId', auth, async (req, res) => {
  try {
    const visitor = await visitorService.getByVisitorId(req.params.visitorId);
    if (!visitor) {
      return sendError(res, 'Visitor not found', 404);
    }
    return sendSuccess(res, visitor);
  } catch (error) {
    console.error('Get visitor error:', error);
    return sendError(res, 'Failed to fetch visitor');
  }
});

export default router;
