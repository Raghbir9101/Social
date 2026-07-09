import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
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
  // Browser's first-ever visit timestamp (from localStorage — stays constant across visits)
  firstVisitTimestamp: {
    type: Date,
    required: true,
  },

  // Visitor's real name captured by the name modal before the campaign loads
  userName: { type: String, default: '' },

  // Variant tag from ?v= URL parameter
  variant: { type: String, default: '', index: true },

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
    viewportSize: { type: String, default: '' },
    pixelRatio: { type: Number, default: 1 },
    userAgent: { type: String, default: '' },
    language: { type: String, default: '' },
  },

  // Traffic Source
  traffic: {
    landingPage: { type: String, default: '' },
    currentUrl: { type: String, default: '' },
    referrer: { type: String, default: '' },
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    utmTerm: { type: String, default: '' },
    utmContent: { type: String, default: '' },
  },

  // Browser Capabilities
  browser: {
    cookiesEnabled: { type: Boolean, default: true },
    localStorageSupported: { type: Boolean, default: true },
    sessionStorageSupported: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

visitorSchema.index({ campaignId: 1, createdAt: -1 });
visitorSchema.index({ visitorId: 1, createdAt: -1 });
visitorSchema.index({ 'location.country': 1 });
visitorSchema.index({ 'device.browser': 1 });

export default mongoose.model('Visitor', visitorSchema);
