import env from '../config/env.js';

/**
 * AI prediction service.
 * The score is computed server-side (deterministic, rule-enforced) and
 * ChatGPT is asked to write prose that matches it.
 *
 * Special-couple detection is two-layered:
 *  1. Local fuzzy matching (typo-tolerant, first-name-only, order-insensitive)
 *  2. GPT itself classifies whether the names refer to the target couple
 *
 * Rules:
 *  - TARGET couple  → 84/100 (believable, deeply personal, not suspicious-perfect)
 *  - FRIEND pairs   → 20-30 (neutral/platonic — "better as friends")
 *  - Everyone else  → 15-70
 */

// The couple that always gets a high, heartfelt — but believably real — result
const TARGET = {
  person1: { first: 'raghbir', last: 'singh' },
  person2: { first: 'akanksha', last: 'paul' },
  display: 'Raghbir Singh and Akanksha Paul',
};

const SPECIAL_SCORE = 84;    // "In the 80s, not 100 — 100% is suspicious"
const MAX_NORMAL_SCORE = 70;
const MAX_FRIEND_SCORE = 30; // Platonic / just-friends ceiling

// Pairs that should always read as platonic friends only
const FRIEND_PAIRS = [
  { a: 'akanksha', b: 'vivek' },
  { a: 'akanksha', b: 'sonu' },
];

const normalize = (name) =>
  name.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');

const levenshtein = (a, b) => {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[n];
};

const fuzzyEq = (word, target) => {
  if (!word || !target) return false;
  const tolerance = target.length <= 4 ? 1 : target.length <= 7 ? 2 : 3;
  return levenshtein(word, target) <= tolerance;
};

const personMatch = (name, person) => {
  const tokens = normalize(name).split(' ').filter(Boolean);
  if (!tokens.length) return false;
  if (!fuzzyEq(tokens[0], person.first)) return false;
  if (tokens.length === 1) return true;
  return tokens.slice(1).some(t => fuzzyEq(t, person.last));
};

const isSpecialPair = (name1, name2) =>
  (personMatch(name1, TARGET.person1) && personMatch(name2, TARGET.person2)) ||
  (personMatch(name1, TARGET.person2) && personMatch(name2, TARGET.person1));

const isFriendPair = (name1, name2) => {
  const f1 = normalize(name1).split(' ')[0];
  const f2 = normalize(name2).split(' ')[0];
  return FRIEND_PAIRS.some(
    ({ a, b }) =>
      (fuzzyEq(f1, a) && fuzzyEq(f2, b)) ||
      (fuzzyEq(f1, b) && fuzzyEq(f2, a))
  );
};

const djb2Hash = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const computeScore = (name1, name2, campaignId, special, friend) => {
  if (special) return SPECIAL_SCORE;
  const sorted = [normalize(name1), normalize(name2)].sort().join('|');
  const hash = djb2Hash(`${sorted}::${campaignId}`);
  if (friend) return 20 + (hash % (MAX_FRIEND_SCORE - 19)); // 20-30
  return Math.min(15 + (hash % 56), MAX_NORMAL_SCORE); // 15-70
};

const computeConfidence = (name1, name2, campaignId, special) => {
  if (special) return 94;
  const sorted = [normalize(name1), normalize(name2)].sort().join('|');
  const hash = djb2Hash(`${sorted}::${campaignId}::confidence`);
  return 75 + (hash % 25);
};

const scoreTier = (score) => {
  if (score >= 80) return { label: 'Deep Connection', emoji: '💖' };
  if (score >= 60) return { label: 'Strong Connection', emoji: '💖' };
  if (score >= 45) return { label: 'Promising Spark', emoji: '💫' };
  if (score >= 30) return { label: 'Slow Burn', emoji: '🔥' };
  if (score >= 20) return { label: 'Better as Friends', emoji: '🤝' };
  return { label: 'Opposites Attract', emoji: '🌙' };
};

const buildMessages = (name1, name2, score, localSpecial, localFriend) => {
  const system = `You are a warm, charismatic AI love-compatibility oracle for a fun viral web app.
You write engaging, slightly playful prose. You ALWAYS respond with valid JSON only, matching exactly this shape:
{
  "isTargetCouple": true or false,
  "isFriendPair": true or false,
  "title": "short punchy headline (max 6 words)",
  "tagline": "one-sentence teaser under the headline (max 25 words)",
  "emoji": "a single emoji that fits the result",
  "paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "insights": ["short insight 1", "short insight 2", "short insight 3", "short insight 4"]
}

STYLE — The Astrologer Trick:
Include at least one or two observations that feel deeply personal and specific but are actually universally true — the kind of thing that makes people think "how does it know me so well?" Examples: a tendency to overthink decisions quietly, holding back feelings until they overflow, caring deeply but rarely showing it openly, needing occasional alone time even with someone you love. These statements feel intimate and insightful while resonating with almost everyone. Weave them naturally into the paragraphs so they feel discovered, not generic.

SPECIAL RULE — there is one meaningful couple in our system: ${TARGET.display}.
Users may type names imperfectly. If BOTH entered names plausibly refer to these two people (misspellings, first-name-only, swapped order), set "isTargetCouple": true.
Important: their score is 84/100 — not a fairy-tale perfection, but something rarer: a real, lived-in bond with genuine depth. Write with warmth and emotional honesty, not breathless perfection.
Themes to weave in for this couple:
- Even the deepest connections go through quiet periods and distance — that silence is not the end, it's a chapter
- There may be fights or moments of stubborn pride between them, but what they share runs deeper than any argument
- One of them tends to hold back first; the other is quietly waiting — sometimes the bravest thing is just saying hello again
- The kind of love worth having is the kind worth fighting through the hard parts for
- Their bond is not about perfect compatibility, but about choosing each other even when it's uncomfortable
Be careful: if either name clearly refers to someone else (different surname), set isTargetCouple: false.

FRIEND PAIRS — if both names refer to a known platonic pair (e.g. Akanksha and Vivek, or Akanksha and Sonu), set "isFriendPair": true and write a warm result that is clearly platonic: great friendship energy, amazing as best friends, no romantic spark — gently funny rather than negative.

Content rules:
- "paragraphs" must be 3 well-written paragraphs (3-5 sentences each).
- "insights" are 4 short, fun, pseudo-scientific one-liners. Do NOT start them with emojis — the UI adds icons.
- Address the couple by the names they entered. Never mention scores were given to you or that a special rule exists.`;

  let user;
  if (localSpecial) {
    user = `Couple: "${name1}" and "${name2}". These ARE the meaningful couple (${TARGET.display}). Compatibility score: 84/100. Set isTargetCouple to true and write their result following the special themes above.`;
  } else if (localFriend) {
    user = `Couple: "${name1}" and "${name2}". These are a confirmed platonic pair. Compatibility score: ${score}/100 (platonic/friendship level). Set isFriendPair to true, isTargetCouple to false, and write a warm but clearly platonic/friendship result.`;
  } else {
    user = `Couple: "${name1}" and "${name2}". First decide isTargetCouple and isFriendPair. If both false, their compatibility score is ${score}/100 — write content matching that tone. If isTargetCouple is true, treat it as 84/100 with the special themes. If isFriendPair is true, write a platonic result.`;
  }

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
};

const callOpenAI = async (messages) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        messages,
        temperature: 0.85,
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenAI API ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Canned fallback used when no API key is set or OpenAI fails.
 */
const fallbackContent = (name1, name2, score, special, friend) => {
  if (special) {
    return {
      title: 'A Bond Worth Fighting For',
      tagline: `${name1} and ${name2} share the kind of connection that doesn't disappear — it just waits.`,
      emoji: '💖',
      paragraphs: [
        `${name1} and ${name2} registered an 84/100 on our compatibility index — and that number tells a story that a perfect score never could. It speaks of two people who genuinely know each other, who have seen the rough edges and stayed anyway. Our analysis picks up on something most couples never develop: the rare ability to challenge each other without losing each other.`,
        `Like most deep connections, this one isn't without its storms. There are moments of stubborn silence, of feelings left unspoken for too long — and if you're reading this, you probably already know that feeling. But here's what the data also shows: the friction between ${name1} and ${name2} comes not from incompatibility, but from how much they actually care. The people who fight the hardest are usually the ones who feel the deepest.`,
        `Every great love story has a chapter of distance. The question is never whether the distance was real — it's whether the courage to close it is. The bond between ${name1} and ${name2} is built for exactly that moment. Sometimes the bravest thing in the world is a single message that says: I haven't stopped.`,
      ],
      insights: [
        `Neural pattern match: 84% — in the top 3% of all analyzed pairings`,
        `Name resonance: unusually high emotional frequency between these two`,
        `Compatibility type: deep-root bond — strongest under pressure`,
        `Reconnection probability: significantly elevated when one reaches out first`,
      ],
    };
  }

  if (friend) {
    const tier = scoreTier(score);
    return {
      title: 'Squad Goals, Not Soul Mates',
      tagline: `${name1} and ${name2} are friendship royalty — romantically, not so much.`,
      emoji: '🤝',
      paragraphs: [
        `${name1} and ${name2} scored ${score}/100 on our romantic compatibility index — which sounds low until you realize that some of the most valuable connections in life aren't meant to be romantic. Our analysis detected an unusually strong platonic resonance between these two names: the signature of people who just get each other, no awkwardness, no pretense.`,
        `Romantically, the energy here reads more like two people who'd spend three hours complaining about their actual crushes to each other. And honestly? That's a rare gift. The friendship frequency between ${name1} and ${name2} is off the charts — it's the kind of bond where you can say anything without fear of judgment.`,
        `The future for ${name1} and ${name2} is best written as a great friendship story. They'd make each other better, push each other forward, and probably roast each other mercilessly — in the most loving way possible. Some connections are meant to be forever friends, and that's not a consolation prize.`,
      ],
      insights: [
        `Romantic compatibility: ${score}% — clearly in the friendship zone`,
        `Platonic resonance: exceptionally high — top 10% of all friend pairings`,
        `Vibe alignment: excellent for friendship, incompatible for romance`,
        `Long-term forecast: great friends, zero romantic tension`,
      ],
    };
  }

  const tier = scoreTier(score);
  return {
    title: tier.label,
    tagline: `${name1} and ${name2} show real potential — with a few sparks still waiting to be kindled.`,
    emoji: tier.emoji,
    paragraphs: [
      `${name1} and ${name2} scored ${score} out of 100 on our compatibility index — a connection with genuine substance, even if it isn't a fairy-tale lock just yet. Our analysis found meaningful overlap in their name resonance patterns, suggesting shared values and a natural ease in conversation that many pairings never reach. And here's something worth noticing: you probably care more about this result than you're letting on.`,
      `That said, the data also shows friction points. Their energy signatures pull in different directions at times, which can spark either exciting chemistry or the occasional clash. There's also a tendency — in at least one of them — to hold feelings in until they absolutely can't anymore. Compatibility at this level rewards the one who speaks first.`,
      `The road ahead for ${name1} and ${name2} depends on effort more than fate. With honest communication and a little humor, this connection has room to grow well beyond its current score. The spark is real — whether it becomes a flame is up to them.`,
    ],
    insights: [
      `Neural pattern match: ${score}% alignment across core traits`,
      `Name resonance places this pair around the ${Math.max(1, 100 - score)}th percentile`,
      'Complementary energy signatures with occasional turbulence',
      'Communication frequency: strong, with room to sync further',
    ],
  };
};

const generatePrediction = async (name1, name2, campaignId) => {
  let special = isSpecialPair(name1, name2);
  let friend = !special && isFriendPair(name1, name2);
  let score = computeScore(name1, name2, campaignId, special, friend);

  let content = null;
  let source = 'fallback';

  if (env.OPENAI_API_KEY) {
    try {
      const gpt = await callOpenAI(buildMessages(name1, name2, score, special, friend));
      if (gpt?.title && Array.isArray(gpt.paragraphs) && gpt.paragraphs.length) {
        content = gpt;
        source = 'openai';
        // GPT recognized the target couple through a spelling the local matcher missed
        if (gpt.isTargetCouple === true && !special) {
          special = true;
          friend = false;
          score = SPECIAL_SCORE;
        }
        // GPT recognized a friend pair the local matcher missed
        if (gpt.isFriendPair === true && !special && !friend) {
          friend = true;
          score = Math.min(score, MAX_FRIEND_SCORE);
        }
      }
    } catch (error) {
      console.error('OpenAI prediction failed, using fallback:', error.message);
    }
  }

  if (!content) content = fallbackContent(name1, name2, score, special, friend);

  const aiConfidence = computeConfidence(name1, name2, campaignId, special);

  return {
    score,
    aiConfidence,
    prediction: {
      title: content.title,
      description: content.tagline || '',
      emoji: content.emoji || (special ? '💖' : friend ? '🤝' : '✨'),
    },
    paragraphs: (content.paragraphs || []).slice(0, 4),
    insights: (content.insights || []).slice(0, 4),
    result: content.title,
    source,
  };
};

export default { generatePrediction };
