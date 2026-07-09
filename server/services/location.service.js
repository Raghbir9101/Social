/**
 * Location Service — IP-to-location lookup using ip-api.com (free, no API key).
 * Reverse geocoding via OpenStreetMap Nominatim (free, no API key).
 * Rate limit: 45 req/min for ip-api, 1 req/sec for Nominatim.
 */
class LocationService {
  /**
   * Reverse geocode GPS coordinates to city/state/country using Nominatim.
   * @param {number} lat
   * @param {number} lon
   * @returns {Object} — Partial location data with country/state/city filled in
   */
  async reverseGeocode(lat, lon) {
    try {
      if (lat == null || lon == null) return {};
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'SocialCampaignApp/1.0' },
      });
      if (!response.ok) return {};
      const data = await response.json();
      const addr = data?.address || {};
      return {
        country: addr.country || '',
        state: addr.state || addr.county || '',
        city: addr.city || addr.town || addr.village || addr.municipality || '',
      };
    } catch {
      return {};
    }
  }

  /**
   * Look up location from an IP address using ip-api.com.
   * @param {string} ip — The IP address to look up
   * @returns {Object} — Location data object
   */
  async lookupByIP(ip) {
    try {
      // Skip private/localhost IPs
      if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
        return this._getDefaultLocation();
      }

      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,timezone,isp,as`);
      const data = await response.json();

      if (data.status === 'success') {
        return {
          latitude: data.lat || null,
          longitude: data.lon || null,
          accuracy: null,
          country: data.country || '',
          state: data.regionName || '',
          city: data.city || '',
          source: 'ip_lookup',
          timezone: data.timezone || '',
          isp: data.isp || '',
          asn: data.as || '',
        };
      }

      return this._getDefaultLocation();
    } catch (error) {
      console.error('IP lookup failed:', error.message);
      return this._getDefaultLocation();
    }
  }

  /**
   * Default location when lookup fails.
   */
  _getDefaultLocation() {
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      country: '',
      state: '',
      city: '',
      source: 'unknown',
      timezone: '',
      isp: '',
      asn: '',
    };
  }
}

export default new LocationService();
