import { Router } from 'express';
import questionService from '../services/question.service.js';
import locationService from '../services/location.service.js';
import auth from '../middleware/auth.js';
import { publicLimiter, submissionLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const router = Router();

// ─── Public ──────────────────────────────────────────────

/**
 * GET /api/qna/boxes/:boxId — get box info for the public form page
 */
router.get('/boxes/:boxId', publicLimiter, async (req, res) => {
  try {
    const box = await questionService.getBoxById(req.params.boxId);
    if (!box || !box.isActive) return sendError(res, 'Question box not found', 404);
    // Return only public-safe fields
    return sendSuccess(res, { boxId: box.boxId, title: box.title, description: box.description });
  } catch (err) {
    return sendError(res, 'Failed to fetch question box');
  }
});

/**
 * POST /api/qna/ask/:boxId — submit an anonymous question
 */
router.post('/ask/:boxId', submissionLimiter, async (req, res) => {
  try {
    const box = await questionService.getBoxById(req.params.boxId);
    if (!box || !box.isActive) return sendError(res, 'Question box not found', 404);

    const { message, visitorId, sessionId, firstVisitTimestamp, location: clientLocation, device } = req.body;
    if (!message?.trim()) return sendError(res, 'Message is required', 400);
    if (message.trim().length > 1000) return sendError(res, 'Message too long', 400);

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || req.ip
      || '';

    // Location resolution — same logic as visitor tracking
    let location;
    const loc = clientLocation;
    if (loc?.source === 'browser_gps' && loc.latitude != null && loc.longitude != null) {
      const geoNames = await locationService.reverseGeocode(loc.latitude, loc.longitude);
      location = { ...loc, ...geoNames };
    } else {
      const ipLocation = await locationService.lookupByIP(ip);
      location = { ...ipLocation, ...(loc || {}), source: loc?.source || ipLocation.source };
    }

    const question = await questionService.submitQuestion({
      boxId: box.boxId,
      message: message.trim(),
      visitorId, sessionId, firstVisitTimestamp,
      ip, location, device: device || {},
    });

    return sendSuccess(res, { id: question._id }, 'Question sent', 201);
  } catch (err) {
    console.error('Submit question error:', err);
    return sendError(res, 'Failed to send question');
  }
});

// ─── Admin (protected) ───────────────────────────────────

/**
 * GET /api/qna/boxes — list all boxes
 */
router.get('/boxes', auth, async (req, res) => {
  try {
    const boxes = await questionService.getAllBoxes();
    return sendSuccess(res, boxes);
  } catch (err) {
    return sendError(res, 'Failed to fetch boxes');
  }
});

/**
 * POST /api/qna/boxes — create a new box
 */
router.post('/boxes', auth, async (req, res) => {
  try {
    const { boxId, title, description } = req.body;
    if (!boxId?.trim() || !title?.trim()) return sendError(res, 'boxId and title are required', 400);
    const slug = boxId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const box = await questionService.createBox({ boxId: slug, title: title.trim(), description: description?.trim() || '' });
    return sendSuccess(res, box, 'Box created', 201);
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'A box with this ID already exists', 409);
    return sendError(res, 'Failed to create box');
  }
});

/**
 * DELETE /api/qna/boxes/:boxId — delete a box and all its questions
 */
router.delete('/boxes/:boxId', auth, async (req, res) => {
  try {
    const result = await questionService.deleteBox(req.params.boxId);
    if (!result) return sendError(res, 'Box not found', 404);
    return sendSuccess(res, null, 'Box deleted');
  } catch (err) {
    return sendError(res, 'Failed to delete box');
  }
});

/**
 * GET /api/qna/questions — paginated list of questions
 */
router.get('/questions', auth, async (req, res) => {
  try {
    const { page, limit, boxId, search, sortOrder } = req.query;
    const result = await questionService.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      boxId,
      search,
      sortOrder: sortOrder === 'asc' ? 1 : -1,
    });
    return sendPaginated(res, result.questions, result.pagination);
  } catch (err) {
    return sendError(res, 'Failed to fetch questions');
  }
});

/**
 * PATCH /api/qna/questions/:id/read — mark a question as read
 */
router.patch('/questions/:id/read', auth, async (req, res) => {
  try {
    await questionService.markRead(req.params.id);
    return sendSuccess(res, null, 'Marked as read');
  } catch (err) {
    return sendError(res, 'Failed to mark as read');
  }
});

/**
 * DELETE /api/qna/questions/:id — delete a question
 */
router.delete('/questions/:id', auth, async (req, res) => {
  try {
    await questionService.deleteQuestion(req.params.id);
    return sendSuccess(res, null, 'Question deleted');
  } catch (err) {
    return sendError(res, 'Failed to delete question');
  }
});

export default router;
