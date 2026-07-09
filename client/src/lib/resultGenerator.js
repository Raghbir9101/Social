/**
 * Deterministic result generator (client-side fallback).
 * Same inputs always produce the same output using hash-based scoring.
 * Mirrors the server-side scoring rules in services/ai.service.js:
 *  - TARGET couple  → 84/100 (believable deep bond, not suspicious-perfect)
 *  - FRIEND pairs   → 20-30 (platonic / just friends)
 *  - Everyone else  → 15-70
 */

const TARGET = {
  person1: { first: 'raghbir', last: 'singh' },
  person2: { first: 'akanksha', last: 'paul' },
};

const SPECIAL_SCORE = 84;
const MAX_NORMAL_SCORE = 70;
const MAX_FRIEND_SCORE = 30;

const FRIEND_PAIRS = [
  { a: 'akanksha', b: 'vivek' },
  { a: 'akanksha', b: 'sonu' },
];

const normalize = (name) => name.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');

const levenshtein = (a, b) => {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
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

export const generateResult = (name1, name2, campaignId, resultConfig) => {
  const special = isSpecialPair(name1, name2);
  const friend = !special && isFriendPair(name1, name2);

  const sortedNames = [normalize(name1), normalize(name2)].sort().join('|');
  const hashInput = `${sortedNames}::${campaignId}`;
  const hash = djb2Hash(hashInput);

  let score;
  if (special) score = SPECIAL_SCORE;
  else if (friend) score = 20 + (hash % (MAX_FRIEND_SCORE - 19));
  else score = Math.min(15 + (hash % 56), MAX_NORMAL_SCORE);

  const confidenceHash = djb2Hash(hashInput + '::confidence');
  const aiConfidence = special ? 94 : 75 + (confidenceHash % 25);

  // Prediction card
  const predictions = resultConfig?.predictions || [];
  let prediction = predictions.find(p => score >= p.minScore && score <= p.maxScore);

  if (special) {
    prediction = {
      title: 'A Bond Worth Fighting For',
      description: `${name1} and ${name2} share the kind of connection that doesn't disappear — it just waits.`,
      emoji: '💖',
    };
  } else if (friend) {
    prediction = {
      title: 'Squad Goals, Not Soul Mates',
      description: `${name1} and ${name2} are friendship royalty — romantically, a different story.`,
      emoji: '🤝',
    };
  } else if (!prediction) {
    prediction = {
      title: 'Analysis Complete',
      description: 'Our AI has completed the analysis of your names.',
      emoji: '✨',
    };
  }

  // Paragraphs
  let paragraphs;
  if (special) {
    paragraphs = [
      `${name1} and ${name2} registered an 84/100 on our compatibility index — and that number tells a story that a perfect score never could. It speaks of two people who genuinely know each other, who have seen the rough edges and stayed anyway. Our analysis picks up on something most couples never develop: the rare ability to challenge each other without losing each other.`,
      `Like most deep connections, this one isn't without its storms. There are moments of stubborn silence, of feelings left unspoken for too long. But the friction between ${name1} and ${name2} comes not from incompatibility — it comes from how much they actually care. The people who push back the hardest are usually the ones who feel the deepest. Every great love story has a chapter of distance; the question is never whether the distance was real, but whether the courage to close it is.`,
      `Sometimes the bravest thing in the world is a single message. The bond between ${name1} and ${name2} is built not just for the good times, but especially for the hard ones — the kind that quietly holds its breath, waiting to exhale. That's not weakness. That's the mark of something real. If the stars keep score, these two are still in the game.`,
    ];
  } else if (friend) {
    paragraphs = [
      `${name1} and ${name2} scored ${score}/100 on our romantic compatibility index — which sounds low until you realize that some of the most valuable connections in life are simply not meant to be romantic. Our analysis detected an unusually strong platonic resonance between these two names: the signature of people who just get each other, no awkwardness, no pretense.`,
      `Romantically, the energy here reads more like two people who'd spend hours complaining about their actual crushes to each other. And honestly? That's a rare and beautiful thing. There's a quality in at least one of them of caring deeply but rarely showing it — and the other person in this pair probably already knows that about them, which is exactly why this friendship works.`,
      `The future for ${name1} and ${name2} is best written as a great friendship story. They'd make each other better, push each other forward, and be the first call when something big happens. Some connections are meant to be forever friends — and that's not a consolation prize.`,
    ];
  } else {
    paragraphs = [
      `${name1} and ${name2} scored ${score} out of 100 on our compatibility index — a connection with genuine substance, even if it isn't a fairy-tale lock just yet. Our analysis found meaningful overlap in their name resonance patterns, suggesting shared values and a natural ease in conversation. And here's something worth noticing: you probably care about this result more than you're admitting right now.`,
      `The data also shows friction points: their energy signatures pull in different directions at times, which can spark either exciting chemistry or the occasional clash. There's also a tendency in one of them to hold back feelings until they absolutely can't anymore — sound familiar? Compatibility at this level rewards the person who speaks first.`,
      `The road ahead for ${name1} and ${name2} depends on effort more than fate. With honest communication and a little humor, this connection has room to grow well beyond its current score. The spark is real — whether it becomes a flame is entirely up to them.`,
    ];
  }

  // Insights
  const topPercent = Math.max(1, 100 - score);
  const frequency = (hash % 900 + 100);
  const alignments = ['harmonious', 'dynamic', 'balanced', 'passionate', 'cosmic', 'electric'];
  const alignment = special ? 'deep-root' : friend ? 'platonic' : alignments[hash % alignments.length];

  const rawInsights = resultConfig?.insights || [];
  const insights = rawInsights.map(template =>
    template
      .replace('{score}', score)
      .replace('{confidence}', aiConfidence)
      .replace('{topPercent}', topPercent)
      .replace('{frequency}', frequency)
      .replace('{alignment}', alignment)
  );

  return {
    score,
    aiConfidence,
    prediction: {
      title: prediction.title,
      description: prediction.description,
      emoji: prediction.emoji,
    },
    paragraphs,
    insights,
    result: prediction.title,
    source: 'local',
  };
};
