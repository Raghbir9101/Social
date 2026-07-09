/**
 * Generates a minimal HTML document containing Open Graph and Twitter Card
 * meta tags. This is returned to social-media crawlers (WhatsApp, Discord,
 * Telegram, Twitter, Facebook…) so they can render a rich link preview.
 *
 * Real browsers never see this HTML — the middleware redirects them straight
 * to the React SPA (or Vite dev server).
 */

/**
 * List of well-known crawler / link-preview bot user-agent substrings.
 */
const BOT_UA_PATTERNS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'slackbot',
  'linkedinbot',
  'googlebot',
  'bingbot',
  'applebot',
  'pinterest',
  'outbrain',
  'redditbot',
  'iframely',
  'embedly',
  'Twitterbot',
  'crawler',
  'spider',
  'prerender',
  'preview',
];

/**
 * Returns true when the User-Agent belongs to a link-preview bot.
 * @param {string} ua  - User-Agent header value
 */
export const isBot = (ua = '') =>
  BOT_UA_PATTERNS.some(p => ua.toLowerCase().includes(p.toLowerCase()));

/**
 * Escapes characters that are special inside HTML attribute values.
 * @param {string} str
 */
const esc = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Builds the full OG HTML document.
 *
 * @param {object} opts
 * @param {string} opts.title        - Page title shown in the preview card
 * @param {string} opts.description  - Short description (1-2 sentences)
 * @param {string} opts.image        - Absolute URL to the thumbnail image
 * @param {string} opts.url          - Canonical page URL
 * @param {string} [opts.themeColor] - Brand colour for the browser chrome
 * @param {string} [opts.siteName]   - Site name shown by some platforms
 */
export const buildOGHtml = ({
  title,
  description,
  image,
  url,
  themeColor = '#ec4899',
  siteName = 'AI Predictions',
}) => {
  const t = esc(title);
  const d = esc(description);
  const i = esc(image);
  const u = esc(url);
  const s = esc(siteName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary -->
  <title>${t}</title>
  <meta name="title" content="${t}" />
  <meta name="description" content="${d}" />
  <meta name="theme-color" content="${esc(themeColor)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${u}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${i}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${s}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${u}" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${i}" />

  <!-- Immediately redirect real browsers to the SPA -->
  <meta http-equiv="refresh" content="0;url=${u}" />
  <link rel="canonical" href="${u}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
</head>
<body style="background:#07070e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <p>Redirecting… <a href="${u}" style="color:#ec4899;">${t}</a></p>
</body>
</html>`;
};
