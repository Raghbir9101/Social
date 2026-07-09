import Campaign from '../models/Campaign.js';

/**
 * Seed default campaigns if none exist in the database.
 * Called once on server startup.
 */
const seedCampaigns = async () => {
  const count = await Campaign.countDocuments();
  if (count > 0) {
    console.log(`📦 ${count} campaigns already exist. Skipping seed.`);
    return;
  }

  const defaultCampaigns = [
    {
      campaignId: 'love-compatibility',
      title: 'Love Compatibility',
      description: 'Discover your love compatibility score powered by our advanced AI algorithm. Enter two names and let the AI reveal your romantic destiny!',
      theme: {
        primaryColor: '#ec4899',
        secondaryColor: '#8b5cf6',
        gradient: 'from-pink-500 to-purple-600',
        emoji: '💕',
        bgPattern: 'hearts',
      },
      resultConfig: {
        stages: [
          { label: 'Initializing Love AI Engine...', duration: 1000 },
          { label: 'Reading Name Frequencies...', duration: 1200 },
          { label: 'Analyzing Emotional Wavelengths...', duration: 1000 },
          { label: 'Matching Heart Patterns...', duration: 1100 },
          { label: 'Comparing Romantic Energies...', duration: 1000 },
          { label: 'Calculating Love Chemistry...', duration: 900 },
          { label: 'Processing Millions of Love Stories...', duration: 1200 },
          { label: 'Generating Final Love Prediction...', duration: 800 },
        ],
        scoreRange: { min: 0, max: 100 },
        predictions: [
          { minScore: 0, maxScore: 20, title: 'Not Meant to Be', description: 'The stars suggest a different path for both of you. Sometimes the universe has other plans, but every connection teaches us something beautiful.', emoji: '💔' },
          { minScore: 21, maxScore: 40, title: 'Friendly Vibes', description: 'Your energies align more on a friendship level. There is warmth between you, but the romantic spark needs a bit more cosmic fuel.', emoji: '🤝' },
          { minScore: 41, maxScore: 60, title: 'Growing Connection', description: 'There is a budding connection between your names! With time and effort, this could blossom into something truly special.', emoji: '🌱' },
          { minScore: 61, maxScore: 80, title: 'Strong Match', description: 'The AI detects powerful romantic compatibility! Your names vibrate at similar frequencies, suggesting a deep and meaningful connection.', emoji: '💖' },
          { minScore: 81, maxScore: 95, title: 'Soulmate Alert!', description: 'Incredible compatibility detected! Your names share an extraordinary bond that transcends ordinary connections. This is rare and beautiful.', emoji: '🔥' },
          { minScore: 96, maxScore: 100, title: 'Perfect Match!', description: 'The AI has spoken — you are a PERFECT match! The universe itself conspired to bring your names together. This is destiny!', emoji: '💕' },
        ],
        insights: [
          'Your names share {score}% emotional resonance',
          'AI detected {confidence}% certainty in this prediction',
          'Out of millions of name combinations analyzed, yours ranks in the top {topPercent}%',
          'Your combined name energy vibrates at frequency level {frequency}',
          'The cosmic alignment of your initials suggests {alignment}',
        ],
      },
      status: 'active',
    },
    {
      campaignId: 'friendship-score',
      title: 'Friendship Score',
      description: 'How strong is your friendship? Our AI analyzes the bond between two names to reveal your friendship compatibility score!',
      theme: {
        primaryColor: '#06b6d4',
        secondaryColor: '#3b82f6',
        gradient: 'from-cyan-500 to-blue-600',
        emoji: '👯',
        bgPattern: 'stars',
      },
      resultConfig: {
        stages: [
          { label: 'Initializing Friendship AI...', duration: 1000 },
          { label: 'Scanning Name Vibrations...', duration: 1100 },
          { label: 'Analyzing Friendship Patterns...', duration: 1000 },
          { label: 'Matching Personality Types...', duration: 1200 },
          { label: 'Evaluating Bond Strength...', duration: 1000 },
          { label: 'Processing Friendship Database...', duration: 1100 },
          { label: 'Generating Friendship Report...', duration: 800 },
        ],
        scoreRange: { min: 0, max: 100 },
        predictions: [
          { minScore: 0, maxScore: 20, title: 'Acquaintances', description: 'You might be in the early stages of getting to know each other. Give it time — great friendships often start slowly!', emoji: '👋' },
          { minScore: 21, maxScore: 40, title: 'Casual Friends', description: 'A comfortable friendship foundation exists. You enjoy each other\'s company, and there\'s room to grow closer!', emoji: '😊' },
          { minScore: 41, maxScore: 60, title: 'Good Friends', description: 'The AI detects genuine friendship chemistry! You share common interests and have a reliable, trust-worthy bond.', emoji: '🤗' },
          { minScore: 61, maxScore: 80, title: 'Best Friends', description: 'Wow! You two have an incredible friendship bond. The AI sees deep loyalty, shared laughter, and mutual respect.', emoji: '💙' },
          { minScore: 81, maxScore: 95, title: 'Soul Friends!', description: 'This friendship transcends the ordinary! You share a rare cosmic connection that most people only dream of.', emoji: '⭐' },
          { minScore: 96, maxScore: 100, title: 'Legendary Duo!', description: 'The AI has declared you a LEGENDARY friendship duo! Your bond is unbreakable, timeless, and absolutely iconic.', emoji: '🏆' },
        ],
        insights: [
          'Your friendship vibrates at {score}% harmony',
          'AI confidence in this friendship analysis: {confidence}%',
          'Your combined name energy suggests {alignment} friendship style',
          'Bond strength ranking: top {topPercent}% of all friendships analyzed',
        ],
      },
      status: 'active',
    },
    {
      campaignId: 'future-prediction',
      title: 'Future Prediction',
      description: 'What does the future hold for you and another person? Our AI peers into the cosmic patterns of your names to reveal your shared destiny!',
      theme: {
        primaryColor: '#a855f7',
        secondaryColor: '#6366f1',
        gradient: 'from-purple-500 to-indigo-600',
        emoji: '🔮',
        bgPattern: 'cosmic',
      },
      resultConfig: {
        stages: [
          { label: 'Activating Cosmic AI Engine...', duration: 1000 },
          { label: 'Scanning Astral Name Patterns...', duration: 1200 },
          { label: 'Reading Temporal Frequencies...', duration: 1100 },
          { label: 'Analyzing Destiny Algorithms...', duration: 1000 },
          { label: 'Comparing Cosmic Signatures...', duration: 1200 },
          { label: 'Processing Universal Timelines...', duration: 1000 },
          { label: 'Channeling Future Probabilities...', duration: 1100 },
          { label: 'Generating Destiny Report...', duration: 800 },
        ],
        scoreRange: { min: 0, max: 100 },
        predictions: [
          { minScore: 0, maxScore: 20, title: 'Divergent Paths', description: 'The cosmic AI sees your paths moving in different directions. But remember — the future is always full of surprises!', emoji: '🌊' },
          { minScore: 21, maxScore: 40, title: 'Crossing Paths', description: 'Your futures will intersect at key moments. These encounters will be brief but meaningful, shaping both your journeys.', emoji: '🌟' },
          { minScore: 41, maxScore: 60, title: 'Intertwined Futures', description: 'The AI sees your destinies becoming increasingly connected. Important shared experiences lie ahead!', emoji: '🌙' },
          { minScore: 61, maxScore: 80, title: 'Shared Destiny', description: 'Your futures are deeply connected! The cosmic AI predicts significant shared milestones and life-changing moments together.', emoji: '✨' },
          { minScore: 81, maxScore: 95, title: 'Cosmic Bond', description: 'An extraordinary cosmic bond detected! Your destinies are woven together by the fabric of the universe itself.', emoji: '🔮' },
          { minScore: 96, maxScore: 100, title: 'Written in the Stars!', description: 'Your shared future is literally WRITTEN IN THE STARS! The AI sees an epic, legendary journey ahead for both of you.', emoji: '💫' },
        ],
        insights: [
          'Your combined destiny score: {score}%',
          'Cosmic certainty level: {confidence}%',
          'Future alignment ranking: top {topPercent}% of all pairs analyzed',
          'Your shared destiny frequency: level {frequency}',
        ],
      },
      status: 'active',
    },
  ];

  await Campaign.insertMany(defaultCampaigns);
  console.log('✅ Seeded 3 default campaigns.');
};

export default seedCampaigns;
