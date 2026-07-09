import { Router } from 'express';
import submissionService from '../services/submission.service.js';
import auth from '../middleware/auth.js';
import { validateSubmission, validatePagination } from '../middleware/validate.js';
import { submissionLimiter, publicLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const router = Router();

/**
 * POST /api/submissions
 * Create a new submission (public).
 */
router.post('/', submissionLimiter, validateSubmission, async (req, res) => {
  try {
    const submission = await submissionService.create(req.body);
    return sendSuccess(res, submission, 'Submission recorded', 201);
  } catch (error) {
    console.error('Create submission error:', error);
    return sendError(res, 'Failed to record submission');
  }
});

/**
 * GET /api/submissions/share/:shareId
 * Get a shared result by its public share ID (public).
 */
router.get('/share/:shareId', publicLimiter, async (req, res) => {
  try {
    const submission = await submissionService.getByShareId(req.params.shareId);
    if (!submission) {
      return sendError(res, 'Shared result not found', 404);
    }
    return sendSuccess(res, submission);
  } catch (error) {
    console.error('Get shared result error:', error);
    return sendError(res, 'Failed to fetch shared result');
  }
});

/**
 * GET /api/submissions
 * List all submissions with pagination (admin).
 */
router.get('/', auth, validatePagination, async (req, res) => {
  try {
    const { page, limit, campaignId, variant, search, sortBy, sortOrder } = req.query;
    const result = await submissionService.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      campaignId,
      variant,
      search,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1,
    });
    return sendPaginated(res, result.submissions, result.pagination);
  } catch (error) {
    console.error('List submissions error:', error);
    return sendError(res, 'Failed to fetch submissions');
  }
});

/**
 * GET /api/submissions/export
 * Export submissions as CSV (admin).
 */
router.get('/export', auth, async (req, res) => {
  try {
    const { campaignId, variant } = req.query;
    const submissions = await submissionService.exportCSV(campaignId, variant);

    // Build CSV
    const headers = [
      'Name 1', 'Name 2', 'Score', 'Result', 'AI Confidence',
      'Campaign', 'Variant', 'Visitor ID', 'Session ID',
      'Country', 'State', 'City', 'Location Source',
      'Browser', 'Device', 'OS', 'IP',
      'Submission Time',
    ];

    const rows = submissions.map(s => [
      s.name1, s.name2, s.score, s.result, s.aiConfidence,
      s.campaignId, s.variant || '', s.visitorId, s.sessionId,
      s.analytics?.location?.country || '', s.analytics?.location?.state || '',
      s.analytics?.location?.city || '', s.analytics?.location?.source || '',
      s.analytics?.device?.browser || '', s.analytics?.device?.deviceType || '',
      s.analytics?.device?.os || '', s.analytics?.ip || '',
      s.submissionTimestamp?.toISOString() || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=submissions_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error('Export submissions error:', error);
    return sendError(res, 'Failed to export submissions');
  }
});

export default router;
