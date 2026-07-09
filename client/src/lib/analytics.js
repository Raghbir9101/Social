/**
 * Client-side analytics data collector.
 * Gathers device, browser, traffic, and performance information.
 */

/**
 * Parse UTM parameters from the current URL.
 */
const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmTerm: params.get('utm_term') || '',
    utmContent: params.get('utm_content') || '',
  };
};

/**
 * Parse device model from a user agent string.
 * Returns a human-readable model string, e.g. "Pixel 7 (Android 13)" or "iPhone (iOS 17.0)".
 * Exported so admin pages can call it against stored userAgent values.
 */
export const parseDeviceModel = (ua) => {
  if (!ua) return '';

  // iPhone — iOS doesn't include model name in UA, so we show iOS version
  const iphoneMatch = ua.match(/\(iPhone; CPU iPhone OS ([\d_]+)/);
  if (iphoneMatch) return `iPhone (iOS ${iphoneMatch[1].replace(/_/g, '.')})`;

  // iPad
  const ipadMatch = ua.match(/\(iPad; CPU OS ([\d_]+)/);
  if (ipadMatch) return `iPad (iPadOS ${ipadMatch[1].replace(/_/g, '.')})`;

  // Android — model sits between "Android X.X; " and ")" or " Build/"
  const androidMatch = ua.match(/Android\s([\d.]+);\s([^;)]+?)(?:\sBuild\/|\))/);
  if (androidMatch) {
    const ver = androidMatch[1];
    const model = androidMatch[2].trim();
    if (model && !['Mobile', 'wv', 'K'].includes(model)) return `${model} (Android ${ver})`;
    return `Android ${ver}`;
  }

  return '';
};

/**
 * Detect device type from user agent.
 */
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobi|android|phone|ipod/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

/**
 * Parse browser name and version from user agent.
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = '';

  if (ua.includes('SamsungBrowser/')) {
    browser = 'Samsung Internet';
    version = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    browser = 'Opera';
    version = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('EdgA/')) {
    // Edge on Android/iOS
    browser = 'Edge';
    version = ua.match(/EdgA\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('CriOS/')) {
    // Chrome on iOS (Apple forces WebKit; UA shows CriOS not Chrome)
    browser = 'Chrome';
    version = ua.match(/CriOS\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('FxiOS/')) {
    // Firefox on iOS
    browser = 'Firefox';
    version = ua.match(/FxiOS\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari/')) {
    browser = 'Safari';
    version = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  return { browser, browserVersion: version };
};

/**
 * Detect operating system from user agent.
 */
const getOS = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'Unknown';
};

/**
 * Collect all analytics data from the browser.
 * @returns {Object} — Full analytics payload
 */
export const collectAnalytics = () => {
  const { browser, browserVersion } = getBrowserInfo();
  const utm = getUTMParams();

  return {
    device: {
      browser,
      browserVersion,
      os: getOS(),
      deviceType: getDeviceType(),
      deviceModel: parseDeviceModel(navigator.userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
      language: navigator.language || navigator.userLanguage || '',
    },
    traffic: {
      landingPage: window.location.pathname,
      currentUrl: window.location.href,
      referrer: document.referrer || '',
      ...utm,
    },
    browser: {
      cookiesEnabled: navigator.cookieEnabled,
      localStorageSupported: (() => {
        try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return true; } catch { return false; }
      })(),
      sessionStorageSupported: (() => {
        try { sessionStorage.setItem('_test', '1'); sessionStorage.removeItem('_test'); return true; } catch { return false; }
      })(),
    },
    performance: {
      pageLoadTime: (() => {
        try {
          const nav = performance.getEntriesByType('navigation')[0];
          return nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
        } catch { return null; }
      })(),
    },
  };
};
