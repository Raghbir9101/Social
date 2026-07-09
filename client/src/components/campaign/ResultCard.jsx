import { useState, useEffect, useMemo } from 'react';

// Strip any leading emoji/symbols the AI may have added — the UI renders its own icons
const cleanInsight = (text) => text.replace(/^[^\p{L}\p{N}]+\s*/u, '');

const ResultCard = ({ result, name1, name2, campaign }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const theme = campaign?.theme || {};
  const pc = theme.primaryColor || '#ec4899';
  const sc = theme.secondaryColor || '#8b5cf6';

  const score = result?.score || 0;
  const isPerfect = score >= 90;

  useEffect(() => {
    setIsVisible(true);
    const target = result?.score || 0;
    const duration = 2200;
    const start = Date.now();
    const anim = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setDisplayScore(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }, [result?.score]);

  // Floating celebration hearts for top-tier results
  const hearts = useMemo(() => {
    if (!isPerfect) return [];
    return Array.from({ length: 16 }, (_, i) => ({
      left: (i * 6.7 + 3) % 100,
      delay: (i * 0.4) % 4.5,
      duration: 4.5 + (i % 3) * 1.3,
      size: 13 + (i % 4) * 7,
      emoji: ['💖', '💕', '✨', '💞', '🌹'][i % 5],
    }));
  }, [isPerfect]);

  if (!result) return null;

  const r = 65, circ = 2 * Math.PI * r;
  const offset = circ - (displayScore / 100) * circ;

  const tier = score >= 90
    ? { label: 'Soulmate Match', color: '#f472b6' }
    : score >= 60 ? { label: 'Strong Connection', color: '#a78bfa' }
    : score >= 45 ? { label: 'Promising Spark', color: '#22d3ee' }
    : score >= 30 ? { label: 'Slow Burn', color: '#fbbf24' }
    : { label: 'Opposites Attract', color: '#94a3b8' };

  const cardStyle = {
    background: 'linear-gradient(160deg, rgba(40,22,38,0.97) 0%, rgba(26,15,30,0.98) 45%, rgba(17,10,23,0.99) 100%)',
    border: isPerfect ? `1px solid ${pc}35` : '1px solid rgba(255,255,255,0.07)',
    boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 90px ${pc}${isPerfect ? '18' : '08'}`,
  };

  const badgeStyle = {
    background: 'rgba(28,16,30,0.9)',
    border: `1px solid ${pc}20`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  };

  const insightStyle = {
    background: 'rgba(22,12,26,0.75)',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };

  const insightIcons = ['💘', '🌹', '💫', '⚡'];

  return (
    <div className={`w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="rounded-3xl relative overflow-hidden" style={{ ...cardStyle, padding: 'clamp(30px, 6vw, 46px)' }}>
        {/* Celebration hearts for perfect matches */}
        {hearts.map((h, i) => (
          <span key={i} className="absolute pointer-events-none" style={{
            left: `${h.left}%`, bottom: -30, fontSize: h.size, opacity: 0, zIndex: 5,
            animation: `heart-rise ${h.duration}s ease-in ${h.delay}s infinite`,
          }}>{h.emoji}</span>
        ))}

        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl" style={{ background: pc, opacity: isPerfect ? 0.2 : 0.1 }} />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full blur-3xl" style={{ background: sc, opacity: isPerfect ? 0.2 : 0.1 }} />
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${pc}70, ${sc}70, transparent)`, boxShadow: `0 0 14px ${pc}50` }} />

        {/* Names joined by a heart */}
        <div className="relative z-10 mb-10" style={{ animation: 'fade-in-up 0.5s ease 0.2s both' }}>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="rounded-2xl px-4 sm:px-6 py-3 text-base sm:text-lg font-bold text-white max-w-[38%] truncate" style={{ ...badgeStyle, fontFamily: "'Playfair Display', serif" }}>{name1}</span>
            <div className="flex flex-col items-center px-1 shrink-0">
              <span className="text-3xl sm:text-4xl" style={{ animation: 'heartbeat 1.8s ease-in-out infinite', filter: `drop-shadow(0 0 12px ${pc}70)` }}>{theme.emoji || '💕'}</span>
            </div>
            <span className="rounded-2xl px-4 sm:px-6 py-3 text-base sm:text-lg font-bold text-white max-w-[38%] truncate" style={{ ...badgeStyle, fontFamily: "'Playfair Display', serif" }}>{name2}</span>
          </div>
          {/* Connecting line under names */}
          <div className="mx-auto mt-4 h-px w-48" style={{ background: `linear-gradient(to right, transparent, ${pc}40, ${sc}40, transparent)` }} />
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-5 relative z-10" style={{ animation: 'fade-in-scale 0.7s ease 0.4s both' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${pc}, transparent)`, transform: 'scale(1.5)', opacity: isPerfect ? 0.4 : 0.2, animation: 'glow-pulse 3s ease-in-out infinite' }} />
            <svg className="w-48 h-48 sm:w-56 sm:h-56" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="75" cy="75" r={r} fill="none" stroke={`url(#rg)`} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.08s linear', filter: isPerfect ? `drop-shadow(0 0 7px ${pc}90)` : `drop-shadow(0 0 3px ${pc}40)` }} />
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f9a8d4" /><stop offset="45%" stopColor={pc} /><stop offset="100%" stopColor={sc} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl mb-0.5" style={{ animation: 'heartbeat 1.8s ease-in-out infinite' }}>{isPerfect ? '💞' : '💗'}</span>
              <span className="text-5xl sm:text-6xl font-display font-black text-white tracking-tighter leading-none">{displayScore}<span className="text-2xl sm:text-3xl align-top" style={{ color: pc }}>%</span></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] mt-1.5" style={{ color: '#a58ba0' }}>love score</span>
            </div>
          </div>
        </div>

        {/* Tier chip */}
        <div className="flex justify-center mb-9 relative z-10" style={{ animation: 'fade-in-up 0.5s ease 0.5s both' }}>
          <span className="rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{
            color: tier.color, background: `${tier.color}12`, border: `1px solid ${tier.color}35`,
            boxShadow: isPerfect ? `0 0 24px ${tier.color}30` : 'none',
          }}>
            {isPerfect ? '👑 ' : ''}{tier.label}
          </span>
        </div>

        {/* Prediction */}
        <div className="text-center mb-9 relative z-10" style={{ animation: 'fade-in-up 0.6s ease 0.6s both' }}>
          <div className="text-5xl mb-4" style={isPerfect ? { animation: 'heartbeat 1.8s ease-in-out infinite', filter: `drop-shadow(0 0 18px ${pc}70)` } : undefined}>{result.prediction?.emoji || '✨'}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, #fbcfe8, #f472b6, ${pc}, ${sc})`, backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradient-shift 6s ease-in-out infinite' }}>
            {result.prediction?.title}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto" style={{ color: '#c4b0c0' }}>{result.prediction?.description}</p>
        </div>

        {/* AI Confidence */}
        <div className="flex justify-center mb-10 relative z-10" style={{ animation: 'fade-in-up 0.5s ease 0.7s both' }}>
          <div className="rounded-full px-5 py-2.5 flex items-center gap-2.5" style={badgeStyle}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: '#c4b0c0' }}>AI Confidence: <span className="text-emerald-400 font-bold">{result.aiConfidence}%</span></span>
          </div>
        </div>

        {/* Love-letter analysis */}
        {result.paragraphs?.length > 0 && (
          <div className="relative z-10 mb-10" style={{ animation: 'fade-in-up 0.6s ease 0.8s both' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${pc}30)` }} />
              <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 24, color: '#f9a8d4' }}>the love letter</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${sc}30)` }} />
            </div>

            <div className="relative rounded-2xl px-6 sm:px-9 py-8" style={{
              background: `linear-gradient(170deg, ${pc}09, rgba(18,10,22,0.85) 30%)`,
              border: `1px solid ${pc}18`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.3)`,
            }}>
              {/* Decorative quote mark */}
              <span className="absolute top-3 left-5 select-none pointer-events-none" style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, lineHeight: 1, color: `${pc}30` }}>"</span>

              <div className="relative space-y-5 pt-4">
                {result.paragraphs.map((p, i) => (
                  <p key={i} className="text-[15px]" style={{
                    fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500,
                    color: '#dcc9d8', lineHeight: 2, letterSpacing: '0.01em',
                    animation: `fade-in-up 0.5s ease ${1 + i * 0.15}s both`,
                  }}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Signature */}
              <p className="text-right mt-7" style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: `${pc}cc`, animation: 'fade-in-up 0.5s ease 1.5s both' }}>
                — your AI love oracle 💝
              </p>
            </div>
          </div>
        )}

        {/* Insights */}
        {result.insights?.length > 0 && (
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${pc}30)` }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#a58ba0' }}>Love Signals</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${sc}30)` }} />
            </div>
            {result.insights.slice(0, 4).map((insight, i) => (
              <div key={i} className="rounded-2xl px-5 py-4 text-sm flex items-start gap-3.5" style={{ ...insightStyle, color: '#cdbac9', animation: `fade-in-up 0.5s ease ${1.4 + i * 0.12}s both` }}>
                <span className="text-lg mt-0.5 shrink-0" style={{ filter: `drop-shadow(0 0 6px ${pc}40)` }}>{insightIcons[i % 4]}</span>
                <span className="leading-relaxed">{cleanInsight(insight)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Source badge */}
        <div className="flex justify-center mt-8 relative z-10" style={{ animation: 'fade-in-up 0.5s ease 1.9s both' }}>
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em]" style={{ color: '#6d5a6b' }}>
            {result.source === 'openai' ? '⚡ Generated by GPT Neural Engine' : '⚡ Powered by Advanced Neural Networks'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
