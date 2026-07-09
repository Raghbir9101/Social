import crypto from 'crypto';
import Submission from '../models/Submission.js';

/**
 * Submission Service — Handles submission creation and admin queries.
 */
class SubmissionService {
  /**
   * Create a new submission with a unique shareable ID.
   */
  async create(data) {
    return Submission.create({
      shareId: crypto.randomBytes(6).toString('base64url'),
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      campaignId: data.campaignId,
      userName: data.userName || '',
      variant: data.variant || '',
      firstVisitTimestamp: data.firstVisitTimestamp,
      submissionTimestamp: new Date(),
      name1: data.name1,
      name2: data.name2,
      score: data.score,
      result: data.result,
      aiConfidence: data.aiConfidence,
      prediction: data.prediction || {},
      paragraphs: data.paragraphs || [],
      insights: data.insights || [],
      analytics: data.analytics || {},
    });
  }

  /**
   * Get a shared result by its public shareId.
   * Returns only the fields safe to expose publicly (no analytics/visitor data).
   */
  async getByShareId(shareId) {
    return Submission.findOne({ shareId })
      .select('shareId campaignId name1 name2 score result aiConfidence prediction paragraphs insights submissionTimestamp')
      .lean();
  }

  /**
   * Get paginated list of submissions (admin).
   */
  async getAll({ page = 1, limit = 25, campaignId, variant, search, sortBy = 'submissionTimestamp', sortOrder = -1 }) {
    const query = {};

    if (campaignId) query.campaignId = campaignId;
    if (variant) query.variant = variant;
    if (search) {
      query.$or = [
        { name1: { $regex: search, $options: 'i' } },
        { name2: { $regex: search, $options: 'i' } },
        { visitorId: { $regex: search, $options: 'i' } },
        { result: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      submissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export all submissions as flat objects for CSV generation.
   */
  async exportCSV(campaignId, variant) {
    const query = campaignId ? { campaignId } : {};
    if (variant) query.variant = variant;
    return Submission.find(query)
      .sort({ submissionTimestamp: -1 })
      .lean();
  }
}

export default new SubmissionService();
