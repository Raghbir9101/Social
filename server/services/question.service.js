import QuestionBox from '../models/QuestionBox.js';
import Question from '../models/Question.js';

class QuestionService {
  // ─── Boxes ────────────────────────────────────────────

  async createBox({ boxId, title, description }) {
    return QuestionBox.create({ boxId, title, description });
  }

  async getAllBoxes() {
    return QuestionBox.find().sort({ createdAt: -1 }).lean();
  }

  async getBoxById(boxId) {
    return QuestionBox.findOne({ boxId }).lean();
  }

  async deleteBox(boxId) {
    await Question.deleteMany({ boxId });
    return QuestionBox.findOneAndDelete({ boxId });
  }

  // ─── Questions ────────────────────────────────────────

  async submitQuestion(data) {
    return Question.create({
      boxId: data.boxId,
      message: data.message,
      visitorId: data.visitorId || '',
      sessionId: data.sessionId || '',
      firstVisitTimestamp: data.firstVisitTimestamp || null,
      ip: data.ip || '',
      location: data.location || {},
      device: data.device || {},
    });
  }

  async getAll({ page = 1, limit = 25, boxId, search, sortOrder = -1 }) {
    const query = {};
    if (boxId) query.boxId = boxId;
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { visitorId: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      questions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markRead(id) {
    return Question.findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true });
  }

  async deleteQuestion(id) {
    return Question.findByIdAndDelete(id);
  }

  async getUnreadCount(boxId) {
    const query = { isRead: false };
    if (boxId) query.boxId = boxId;
    return Question.countDocuments(query);
  }
}

export default new QuestionService();
