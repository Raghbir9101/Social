/**
 * Location collection — Browser GPS with IP fallback.
 */

import api from './api';

/**
 * Request browser GPS location.
 * Returns a promise that resolves with location data or null.
 */
const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          country: '',
          state: '',
          city: '',
          source: 'browser_gps',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          isp: '',
          asn: '',
        });
      },
      () => {
        // Permission denied or error
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};

/**
 * Get location from IP via backend endpoint.
 * Falls back to a direct ipapi.co browser call when the server can't detect the
 * client IP (e.g. localhost development where the server sees ::1).
 */
const getIPLocation = async () => {
  try {
    const response = await api.post('/visitors/location');
    if (response.data?.success && response.data.data?.source !== 'unknown') {
      return response.data.data;
    }
  } catch { /* fall through */ }

  // Direct browser-side lookup — the request goes from the user's browser to
  // ipapi.co, so ipapi.co sees the user's real public IP regardless of server config.
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    if (d.country_code) {
      return {
        latitude: d.latitude || null,
        longitude: d.longitude || null,
        accuracy: null,
        country: d.country_name || '',
        state: d.region || '',
        city: d.city || '',
        source: 'ip_lookup',
        timezone: d.timezone || '',
        isp: d.org || '',
        asn: '',
      };
    }
  } catch { /* fall through */ }

  return null;
};

/**
 * Get visitor location — tries GPS first, falls back to IP.
 * @returns {Object} Location data with source field
 */
export const getLocation = async () => {
  // Try browser GPS first
  const gpsLocation = await getBrowserLocation();
  if (gpsLocation) {
    return gpsLocation;
  }

  // Fallback to IP lookup
  const ipLocation = await getIPLocation();
  if (ipLocation) {
    return ipLocation;
  }

  // Return empty location
  return {
    latitude: null,
    longitude: null,
    accuracy: null,
    country: '',
    state: '',
    city: '',
    source: 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    isp: '',
    asn: '',
  };
};
