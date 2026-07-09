import Visitor from '../models/Visitor.js';
import Session from '../models/Session.js';
import Visit from '../models/Visit.js';

/**
 * Visitor Service — Handles visitor tracking, session management, and visit logging.
 */
class VisitorService {
  /**
   * Track a visitor — create a new row per visit, upsert session, log visit.
   * @param {Object} data — Full tracking payload from the client
   * @returns {Object} — { visitor, session, visit }
   */
  async track(data) {
    const {
      visitorId, sessionId, campaignId, variant, userName,
      firstVisitTimestamp, ip, location,
      device, traffic, browser,
    } = data;

    // Create a new row for every visit
    const visitor = await Visitor.create({
      visitorId,
      campaignId,
      userName: userName || '',
      variant: variant || '',
      firstVisitTimestamp: firstVisitTimestamp || new Date(),
      ip: ip || '',
      location: location || {},
      device: device || {},
      traffic: traffic || {},
      browser: browser || {},
    });

    // Upsert session
    const session = await Session.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          visitorId,
          campaignId,
          lastActiveAt: new Date(),
        },
        $setOnInsert: {
          sessionId,
          startedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Create visit log
    const visit = await Visit.create({
      visitorId,
      sessionId,
      campaignId,
      page: traffic?.currentUrl || '',
      referrer: traffic?.referrer || '',
    });

    return { visitor, session, visit };
  }

  /**
   * Get paginated list of visitors (admin).
   */
  async getAll({ page = 1, limit = 25, campaignId, variant, search, sortBy = 'createdAt', sortOrder = -1 }) {
    const query = {};

    if (campaignId) query.campaignId = campaignId;
    if (variant) query.variant = variant;
    if (search) {
      query.$or = [
        { visitorId: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'device.browser': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Visitor.countDocuments(query);
    const visitors = await Visitor.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      visitors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get the most recent visit record for a visitorId.
   */
  async getByVisitorId(visitorId) {
    return Visitor.findOne({ visitorId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Update session performance data.
   */
  async updateSessionPerformance(sessionId, performance) {
    return Session.findOneAndUpdate(
      { sessionId },
      { $set: { performance, lastActiveAt: new Date() } },
      { new: true }
    );
  }
}

export default new VisitorService();
