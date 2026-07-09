import { useState, useEffect } from 'react';

const AIProcessing = ({ stages = [], onComplete, campaign }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const theme = campaign?.theme || {};
  const pc = theme.primaryColor || '#ec4899';
  const sc = theme.secondaryColor || '#8b5cf6';
  const emoji = theme.emoji || '✨';

  useEffect(() => {
    // No stages configured — still give the AI call a moment, then complete
    if (!stages.length) {
      const pi = setInterval(() => setProgress(prev => Math.min(prev + 1.2, 100)), 40);
      const tm = setTimeout(() => onComplete?.(), 4000);
      setStageText('Consulting the AI oracle...'); setIsTyping(false);
      return () => { clearTimeout(tm); clearInterval(pi); };
    }
    if (currentStage >= stages.length) { onComplete?.(); return; }
    const stage = stages[currentStage];
    const duration = stage.duration || 1000;
    setStageText(''); setIsTyping(true);
    let ci = 0;
    const label = stage.label;
    const ti = setInterval(() => { if (ci < label.length) { setStageText(label.substring(0, ci + 1)); ci++; } else { clearInterval(ti); setIsTyping(false); } }, 20);
    const pi = setInterval(() => { setProgress(prev => Math.min(prev + 0.5, ((currentStage + 1) / stages.length) * 100)); }, 20);
    const tm = setTimeout(() => setCurrentStage(prev => prev + 1), duration);
    return () => { clearTimeout(tm); clearInterval(ti); clearInterval(pi); };
  }, [currentStage, stages]);

  const circ = 2 * Math.PI * 56;
  const offset = circ - (progress / 100) * circ;

  const cardStyle = {
    background: 'rgba(12,12,24,0.85)',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[65vh] px-4" style={{ animation: 'fade-in-scale 0.6s ease forwards' }}>
      {/* Progress Ring */}
      <div className="relative mb-12">
        <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${pc}, ${sc})`, transform: 'scale(1.8)', animation: 'glow-pulse 3s ease-in-out infinite' }} />
        <svg className="w-44 h-44 sm:w-52 sm:h-52" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle cx="64" cy="64" r="56" fill="none" stroke={`url(#pg)`} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'all 0.2s' }} />
          <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={pc} /><stop offset="50%" stopColor={sc} /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-1" style={{ animation: 'float 3s ease-in-out infinite', filter: `drop-shadow(0 0 12px ${pc}40)` }}>{emoji}</span>
          <span className="text-2xl font-black font-display text-white">{Math.round(progress)}%</span>
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute top-1/2 left-1/2" style={{ width: 6, height: 6, borderRadius: '50%', background: [pc, sc, '#06b6d4'][i], animation: `orbit ${3 + i * 0.8}s linear infinite`, animationDelay: `${i * 0.6}s`, boxShadow: `0 0 12px ${[pc, sc, '#06b6d4'][i]}` }} />
        ))}
      </div>

      {/* Stage Text */}
      <div className="text-center mb-8 min-h-[3.5rem] max-w-sm">
        <p className="text-lg sm:text-xl text-white font-display font-semibold tracking-wide">
          {stageText}
          {isTyping && <span className="inline-block w-[2px] h-5 ml-1 align-middle rounded-full" style={{ background: pc, animation: 'blink 0.7s infinite' }} />}
        </p>
      </div>

      {/* Stage dots */}
      <div className="flex gap-2 mb-8">
        {stages.map((_, i) => (
          <div key={i} className="relative">
            {i === currentStage && <div className="absolute inset-0 rounded-full blur-sm" style={{ background: pc, transform: 'scale(2.5)', opacity: 0.4, animation: 'glow-pulse 2s ease-in-out infinite' }} />}
            <div className={`relative h-2 rounded-full transition-all duration-500 ${i < currentStage ? 'w-5' : i === currentStage ? 'w-8' : 'w-2'}`}
              style={{ background: i <= currentStage ? `linear-gradient(90deg, ${pc}, ${sc})` : 'rgba(255,255,255,0.06)' }} />
          </div>
        ))}
      </div>

      {/* Bottom card */}
      <div className="rounded-2xl px-5 py-3 max-w-xs" style={cardStyle}>
        <p className="text-gray-500 text-xs text-center font-medium tracking-wide">💞 Reading the language of your hearts...</p>
      </div>
    </div>
  );
};

export default AIProcessing;
