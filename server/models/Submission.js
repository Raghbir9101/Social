import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  // Short public ID used in shareable result links (/:campaignId?r=shareId)
  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },
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
  firstVisitTimestamp: {
    type: Date,
    required: true,
  },

  // Visitor's real name (from name capture modal, stored in localStorage)
  userName: { type: String, default: '' },

  // Variant tag from ?v= URL parameter at submission time
  variant: { type: String, default: '', index: true },

  submissionTimestamp: {
    type: Date,
    default: Date.now,
  },

  // Submitted names
  name1: {
    type: String,
    required: true,
    trim: true,
  },
  name2: {
    type: String,
    required: true,
    trim: true,
  },

  // Generated result
  score: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  aiConfidence: {
    type: Number,
    required: true,
  },
  prediction: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    emoji: { type: String, default: '' },
  },
  paragraphs: {
    type: [String],
    default: [],
  },
  insights: {
    type: [String],
    default: [],
  },

  // Full analytics snapshot at submission time
  analytics: {
    ip: { type: String, default: '' },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      country: { type: String, default: '' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      source: { type: String, default: 'unknown' },
    },
    device: {
      browser: { type: String, default: '' },
      browserVersion: { type: String, default: '' },
      os: { type: String, default: '' },
      deviceType: { type: String, default: '' },
      deviceModel: { type: String, default: '' },
      screenResolution: { type: String, default: '' },
      userAgent: { type: String, default: '' },
    },
    traffic: {
      referrer: { type: String, default: '' },
      utmSource: { type: String, default: '' },
      utmMedium: { type: String, default: '' },
      utmCampaign: { type: String, default: '' },
    },
    performance: {
      pageLoadTime: { type: Number, default: null },
      timeToSubmit: { type: Number, default: null },
    },
  },
}, {
  timestamps: true,
});

// Indexes for admin queries
submissionSchema.index({ campaignId: 1, submissionTimestamp: -1 });
submissionSchema.index({ name1: 'text', name2: 'text' });

export default mongoose.model('Submission', submissionSchema);
