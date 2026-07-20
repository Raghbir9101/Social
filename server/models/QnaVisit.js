import mongoose from 'mongoose';

const qnaVisitSchema = new mongoose.Schema({
  boxId: {
    type: String,
    required: true,
    index: true,
  },

  // Visitor identity
  visitorId: { type: String, default: '' },
  sessionId: { type: String, default: '' },
  firstVisitTimestamp: { type: Date, default: null },

  // Network & Location
  ip: { type: String, default: '' },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    source: { type: String, enum: ['browser_gps', 'ip_lookup', 'unknown'], default: 'unknown' },
    timezone: { type: String, default: '' },
    isp: { type: String, default: '' },
    asn: { type: String, default: '' },
  },

  // Device Info
  device: {
    browser: { type: String, default: '' },
    browserVersion: { type: String, default: '' },
    os: { type: String, default: '' },
    deviceType: { type: String, default: '' },
    deviceModel: { type: String, default: '' },
    screenResolution: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    language: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

qnaVisitSchema.index({ boxId: 1, createdAt: -1 });
qnaVisitSchema.index({ visitorId: 1, createdAt: -1 });

export default mongoose.model('QnaVisit', qnaVisitSchema);
