import Campaign from '../models/Campaign.js';

/**
 * Campaign Service — CRUD operations for campaigns.
 */
class CampaignService {
  /**
   * Get a campaign by its URL slug.
   */
  async getByCampaignId(campaignId) {
    return Campaign.findOne({ campaignId, status: 'active' });
  }

  /**
   * Get all campaigns (admin), with optional search/status filters.
   */
  async getAll({ search, status } = {}) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { campaignId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return Campaign.find(query).sort({ createdAt: -1 });
  }

  /**
   * Create a new campaign.
   */
  async create(data) {
    const existing = await Campaign.findOne({ campaignId: data.campaignId });
    if (existing) {
      throw new Error('Campaign ID already exists');
    }
    return Campaign.create(data);
  }

  /**
   * Update a campaign by MongoDB _id.
   */
  async update(id, data) {
    const campaign = await Campaign.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  }

  /**
   * Delete a campaign by MongoDB _id.
   */
  async delete(id) {
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  }

  /**
   * Toggle campaign status.
   */
  async toggleStatus(id) {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    campaign.status = campaign.status === 'active' ? 'inactive' : 'active';
    return campaign.save();
  }
}

export default new CampaignService();
