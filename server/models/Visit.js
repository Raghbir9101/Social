import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  campaignId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  page: {
    type: String,
    default: '',
  },
  referrer: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

visitSchema.index({ campaignId: 1, timestamp: -1 });

export default mongoose.model('Visit', visitSchema);
