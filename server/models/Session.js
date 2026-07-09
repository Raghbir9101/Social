import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  campaignId: {
    type: String,
    required: true,
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  // Performance metrics
  performance: {
    pageLoadTime: { type: Number, default: null },
    timeToSubmit: { type: Number, default: null },
    timeOnPage: { type: Number, default: null },
  },
}, {
  timestamps: true,
});

sessionSchema.index({ campaignId: 1, startedAt: -1 });

export default mongoose.model('Session', sessionSchema);
