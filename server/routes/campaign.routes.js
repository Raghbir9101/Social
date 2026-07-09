import { Router } from 'express';
import campaignService from '../services/campaign.service.js';
import auth from '../middleware/auth.js';
import { validateCampaignCreate } from '../middleware/validate.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/campaigns
 * List all campaigns (admin).
 * IMPORTANT: This route MUST come before /:campaignId to avoid
 * Express matching "export" or other paths as a campaignId.
 */
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const campaigns = await campaignService.getAll({ search, status });
    return sendSuccess(res, campaigns);
  } catch (error) {
    console.error('List campaigns error:', error);
    return sendError(res, 'Failed to fetch campaigns');
  }
});

/**
 * POST /api/campaigns
 * Create a new campaign (admin).
 */
router.post('/', auth, validateCampaignCreate, async (req, res) => {
  try {
    const campaign = await campaignService.create(req.body);
    return sendSuccess(res, campaign, 'Campaign created', 201);
  } catch (error) {
    console.error('Create campaign error:', error);
    if (error.message === 'Campaign ID already exists') {
      return sendError(res, error.message, 409);
    }
    return sendError(res, 'Failed to create campaign');
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Get campaign config by slug (public).
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const campaign = await campaignService.getByCampaignId(req.params.campaignId);
    if (!campaign) {
      return sendError(res, 'Campaign not found', 404);
    }
    return sendSuccess(res, campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    return sendError(res, 'Failed to fetch campaign');
  }
});

/**
 * PUT /api/campaigns/:id
 * Update a campaign (admin).
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await campaignService.update(req.params.id, req.body);
    return sendSuccess(res, campaign, 'Campaign updated');
  } catch (error) {
    console.error('Update campaign error:', error);
    if (error.message === 'Campaign not found') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, 'Failed to update campaign');
  }
});

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign (admin).
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await campaignService.delete(req.params.id);
    return sendSuccess(res, null, 'Campaign deleted');
  } catch (error) {
    console.error('Delete campaign error:', error);
    if (error.message === 'Campaign not found') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, 'Failed to delete campaign');
  }
});

/**
 * PATCH /api/campaigns/:id/toggle
 * Toggle campaign active/inactive status (admin).
 */
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const campaign = await campaignService.toggleStatus(req.params.id);
    return sendSuccess(res, campaign, `Campaign ${campaign.status}`);
  } catch (error) {
    console.error('Toggle campaign error:', error);
    return sendError(res, 'Failed to toggle campaign status');
  }
});

export default router;
