import Visitor from '../models/Visitor.js';
import Session from '../models/Session.js';
import Submission from '../models/Submission.js';
import Campaign from '../models/Campaign.js';

/**
 * Analytics Service — Dashboard aggregations and chart data.
 */
class AnalyticsService {
  /**
   * Get dashboard overview stats.
   */
  async getDashboardStats(campaignId) {
    const matchStage = campaignId ? { campaignId } : {};

    const [
      totalVisitors,
      uniqueVisitors,
      totalSubmissions,
      activeCampaigns,
      activeSessions,
    ] = await Promise.all([
      Visitor.countDocuments(matchStage),
      Visitor.distinct('visitorId', matchStage).then(ids => ids.length),
      Submission.countDocuments(matchStage),
      Campaign.countDocuments({ status: 'active' }),
      Session.countDocuments({
        ...matchStage,
        lastActiveAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Active in last 30 min
      }),
    ]);

    const conversionRate = totalVisitors > 0
      ? ((totalSubmissions / totalVisitors) * 100).toFixed(1)
      : 0;

    return {
      totalVisitors,
      uniqueVisitors,
      totalSubmissions,
      activeCampaigns,
      activeSessions,
      conversionRate: Number(conversionRate),
    };
  }

  /**
   * Get chart data by type.
   */
  async getChartData(type, campaignId, days = 30) {
    const matchStage = {};
    if (campaignId) matchStage.campaignId = campaignId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    switch (type) {
      case 'visitors-by-day':
        return this._getByDay(Visitor, 'createdAt', matchStage, startDate);

      case 'submissions-by-day':
        return this._getByDay(Submission, 'submissionTimestamp', matchStage, startDate);

      case 'top-countries':
        return this._getTopField(Visitor, 'location.country', matchStage, 10);

      case 'top-states':
        return this._getTopField(Visitor, 'location.state', matchStage, 10);

      case 'top-cities':
        return this._getTopField(Visitor, 'location.city', matchStage, 10);

      case 'browsers':
        return this._getTopField(Visitor, 'device.browser', matchStage, 10);

      case 'devices':
        return this._getTopField(Visitor, 'device.deviceType', matchStage, 10);

      case 'operating-systems':
        return this._getTopField(Visitor, 'device.os', matchStage, 10);

      case 'traffic-sources':
        return this._getTopField(Visitor, 'traffic.referrer', matchStage, 10);

      case 'utm-analytics':
        return this._getTopField(Visitor, 'traffic.utmSource', matchStage, 10);

      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }

  /**
   * Aggregate documents by day for time-series charts.
   */
  async _getByDay(Model, dateField, matchStage, startDate) {
    return Model.aggregate([
      {
        $match: {
          ...matchStage,
          [dateField]: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);
  }

  /**
   * Aggregate top values for a specific field.
   */
  async _getTopField(Model, field, matchStage, limit) {
    return Model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
        },
      },
    ]);
  }
}

export default new AnalyticsService();
