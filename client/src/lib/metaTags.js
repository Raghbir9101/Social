/**
 * Lightweight client-side meta tag manager.
 *
 * Modern crawlers (Google, Bing) DO execute JavaScript, so updating the DOM
 * after hydration still improves SEO. WhatsApp / Discord read the *server*
 * response, so the Express OG middleware handles those — but keeping the
 * document title and description in sync improves the native share sheet on
 * iOS/Android.
 */

const BASE_URL = window.location.origin;

/**
 * Set or create a <meta> tag identified by the given attribute+value pair.
 * @param {'name'|'property'} attr
 * @param {string} key
 * @param {string} value
 */
const setMeta = (attr, key, value) => {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

/**
 * Update all title / OG / Twitter meta tags at once.
 *
 * @param {object} opts
 * @param {string} opts.title        - Document & OG title
 * @param {string} [opts.description]
 * @param {string} [opts.image]      - Absolute or root-relative image URL
 * @param {string} [opts.url]        - Canonical URL (defaults to current href)
 */
export const setPageMeta = ({ title, description, image, url }) => {
  const resolvedUrl  = url  || window.location.href;
  const resolvedImg  = image
    ? (image.startsWith('http') ? image : `${BASE_URL}${image}`)
    : `${BASE_URL}/og-campaign.png`;

  // Document title
  if (title) document.title = title;

  // Standard meta
  setMeta('name',     'title',       title);
  setMeta('name',     'description', description);

  // Open Graph
  setMeta('property', 'og:title',       title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image',       resolvedImg);
  setMeta('property', 'og:url',         resolvedUrl);

  // Twitter Card
  setMeta('name', 'twitter:title',       title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image',       resolvedImg);
  setMeta('name', 'twitter:url',         resolvedUrl);
};

/**
 * Pre-built presets for each page type.
 */
export const pageMeta = {
  campaign: (campaign) =>
    setPageMeta({
      title:       `${campaign?.title ?? 'Love Compatibility'} 💕 — AI Predictions`,
      description: campaign?.description ?? 'Discover your AI-powered compatibility score!',
      image:       '/og-campaign.png',
    }),

  result: (name1, name2, score) =>
    setPageMeta({
      title:       `${name1} & ${name2} scored ${score}% 💖 — AI Predictions`,
      description: `The AI says ${name1} and ${name2} have a ${score}% compatibility score. Check yours now!`,
      image:       '/og-campaign.png',
    }),

  questionBox: (box) =>
    setPageMeta({
      title:       box?.title ?? 'Ask Me Anything',
      description: box?.description || 'Send an anonymous question — they will never know it was you.',
      image:       '/og-question.png',
    }),

  default: () =>
    setPageMeta({
      title:       'AI Predictions — Love Compatibility',
      description: 'Discover your AI-powered compatibility score! Enter two names and let our advanced AI reveal your prediction. 💕',
      image:       '/og-campaign.png',
    }),
};
