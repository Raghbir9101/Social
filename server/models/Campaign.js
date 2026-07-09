import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  // Unique slug for URL routing (e.g., "love-compatibility")
  campaignId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Visual theme configuration
  theme: {
    primaryColor: { type: String, default: '#ec4899' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    gradient: { type: String, default: 'from-pink-500 to-purple-600' },
    emoji: { type: String, default: '💕' },
    bgPattern: { type: String, default: 'hearts' }, // hearts, stars, sparkles, cosmic
  },
  // AI processing stage configuration
  resultConfig: {
    stages: [{
      label: { type: String, required: true },
      duration: { type: Number, default: 1000 }, // ms
    }],
    scoreRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
    },
    // Prediction tiers mapped from score ranges
    predictions: [{
      minScore: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      emoji: { type: String, default: '✨' },
    }],
    // Fun insight templates
    insights: [{ type: String }],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Index for fast lookups (campaignId already indexed via unique:true)
campaignSchema.index({ status: 1 });

export default mongoose.model('Campaign', campaignSchema);
