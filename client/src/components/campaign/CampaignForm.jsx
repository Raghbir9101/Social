import { useState } from 'react';

const CampaignForm = ({ campaign, onSubmit, loading, initialName = '' }) => {
  const [name1, setName1] = useState(initialName);
  const [name2, setName2] = useState('');
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!name1.trim()) newErrors.name1 = 'Please enter a name';
    if (!name2.trim()) newErrors.name2 = 'Please enter a name';
    if (name1.trim().toLowerCase() === name2.trim().toLowerCase() && name1.trim()) {
      newErrors.name2 = 'Names must be different';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(name1.trim(), name2.trim());
  };

  const theme = campaign?.theme || {};
  const emoji = theme.emoji || '💗';
  const pc = theme.primaryColor || '#ec4899';
  const sc = theme.secondaryColor || '#8b5cf6';

  const inputStyle = (field, accent) => ({
    width: '100%', padding: '17px 22px 17px 52px', borderRadius: 18, fontSize: 15, fontWeight: 500,
    color: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif",
    background: focused === field ? 'rgba(20,12,24,0.9)' : 'rgba(16,10,20,0.8)',
    border: focused === field ? `2px solid ${accent}70` : errors[field] ? '2px solid #ef444460' : '2px solid rgba(255,255,255,0.08)',
    boxShadow: focused === field
      ? `0 0 0 4px ${accent}18, 0 0 24px ${accent}15, inset 0 2px 4px rgba(0,0,0,0.3)`
      : 'inset 0 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.25s ease',
  });

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', animation: 'fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        {/* Beating heart with pulsing rings */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 26 }}>
          <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: `1.5px solid ${pc}30`, animation: 'ring-pulse 2.4s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: `1.5px solid ${pc}25`, animation: 'ring-pulse 2.4s ease-out 0.8s infinite' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', filter: 'blur(42px)', background: `radial-gradient(circle, ${pc}60, transparent 70%)`, transform: 'scale(2.8)', animation: 'glow-pulse 3s ease-in-out infinite' }} />
          <span style={{ position: 'relative', fontSize: 76, display: 'block', animation: 'heartbeat 1.8s ease-in-out infinite', filter: `drop-shadow(0 0 26px ${pc}60)` }}>{emoji}</span>
        </div>

        {/* Script pre-title */}
        <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: 24, color: '#f9a8d4', marginBottom: 6, opacity: 0.9, animation: 'fade-in-up 0.6s ease 0.2s both' }}>
          two hearts, one destiny
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(38px, 8vw, 58px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.12, background: `linear-gradient(135deg, #fbcfe8, #f472b6, ${pc}, ${sc}, #c4b5fd)`, backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradient-shift 6s ease-in-out infinite' }}>
          {campaign?.title || 'Love Compatibility'}
        </h1>
        <p style={{ color: '#b6a8b8', fontSize: 16, lineHeight: 1.75, maxWidth: 420, margin: '0 auto', fontWeight: 400 }}>
          {campaign?.description || 'Enter two names and let our AI reveal the story your hearts are writing together.'}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          {/* Glow behind card */}
          <div style={{ position: 'absolute', inset: -2, borderRadius: 30, filter: 'blur(24px)', opacity: 0.22, background: `linear-gradient(135deg, ${pc}, ${sc})`, animation: 'glow-pulse 4s ease-in-out infinite' }} />

          {/* Animated border wrapper */}
          <div style={{ position: 'relative', borderRadius: 28, padding: 1.5, overflow: 'hidden' }}>
            {/* Rotating gradient beam */}
            <div style={{ position: 'absolute', inset: '-100%', background: `conic-gradient(from 0deg, transparent 0deg, ${pc} 40deg, transparent 80deg, transparent 180deg, ${sc} 220deg, transparent 260deg)`, animation: 'spin-border 7s linear infinite', opacity: 0.85 }} />
            {/* Static faint border under the beam */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 28, border: `1.5px solid ${pc}18` }} />

            {/* Card */}
            <div style={{
              position: 'relative',
              borderRadius: 26,
              padding: 'clamp(26px, 5vw, 38px)',
              background: 'linear-gradient(165deg, rgba(38,20,36,0.98) 0%, rgba(24,14,28,0.99) 45%, rgba(16,10,22,1) 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}>
              {/* Top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 90, height: 3, borderRadius: 3, background: `linear-gradient(90deg, ${pc}, ${sc})`, boxShadow: `0 0 12px ${pc}60` }} />

              {/* Corner rose glows */}
              <div style={{ position: 'absolute', top: 12, right: 12, width: 70, height: 70, borderRadius: '50%', filter: 'blur(32px)', opacity: 0.18, background: pc, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, width: 70, height: 70, borderRadius: '50%', filter: 'blur(32px)', opacity: 0.18, background: sc, pointerEvents: 'none' }} />

              {/* Input 1 */}
              <div style={{ marginBottom: 22, position: 'relative', zIndex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: '#c9a9c0', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  <span style={{ fontSize: 13 }}>💌</span> Your Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: focused === 'name1' ? 1 : 0.5, transition: 'opacity 0.25s' }}>🌹</span>
                  <input
                    id="input-name1" type="text" value={name1}
                    onChange={(e) => { setName1(e.target.value); setErrors(p => ({...p, name1: ''})); }}
                    onFocus={() => setFocused('name1')} onBlur={() => setFocused(null)}
                    placeholder="Enter your name" maxLength={100} autoComplete="off"
                    style={inputStyle('name1', pc)}
                  />
                </div>
                {errors.name1 && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8, marginLeft: 4 }}>⚠ {errors.name1}</p>}
              </div>

              {/* Heart connector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '2px 0', marginBottom: 22, position: 'relative', zIndex: 1 }}>
                <div style={{ height: 1.5, flex: 1, borderRadius: 2, background: `linear-gradient(to right, transparent, ${pc}50)` }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', filter: 'blur(18px)', background: pc, opacity: 0.45, transform: 'scale(2.4)', animation: 'glow-pulse 3s ease-in-out infinite' }} />
                  <span style={{ position: 'relative', fontSize: 30, display: 'block', animation: 'heartbeat 1.8s ease-in-out infinite', filter: `drop-shadow(0 0 10px ${pc}80)` }}>{emoji}</span>
                </div>
                <div style={{ height: 1.5, flex: 1, borderRadius: 2, background: `linear-gradient(to left, transparent, ${sc}50)` }} />
              </div>

              {/* Input 2 */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: '#c9a9c0', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  <span style={{ fontSize: 13 }}>💘</span> Their Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: focused === 'name2' ? 1 : 0.5, transition: 'opacity 0.25s' }}>🌹</span>
                  <input
                    id="input-name2" type="text" value={name2}
                    onChange={(e) => { setName2(e.target.value); setErrors(p => ({...p, name2: ''})); }}
                    onFocus={() => setFocused('name2')} onBlur={() => setFocused(null)}
                    placeholder="Enter their name" maxLength={100} autoComplete="off"
                    style={inputStyle('name2', sc)}
                  />
                </div>
                {errors.name2 && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8, marginLeft: 4 }}>⚠ {errors.name2}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: 26, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 18, filter: 'blur(18px)', opacity: 0.4, background: `linear-gradient(135deg, ${pc}, ${sc})`, top: 8 }} />
          <button id="btn-generate" type="submit" disabled={loading}
            style={{
              position: 'relative', width: '100%', padding: '19px 0', borderRadius: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: '0.02em',
              background: `linear-gradient(135deg, ${pc}, #d946ef, ${sc})`,
              boxShadow: `0 8px 28px ${pc}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
              opacity: loading ? 0.5 : 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = `0 10px 36px ${pc}55, inset 0 1px 0 rgba(255,255,255,0.25)`; } }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = `0 8px 28px ${pc}40, inset 0 1px 0 rgba(255,255,255,0.25)`; }}
            onMouseDown={e => { if (!loading) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { if (!loading) e.target.style.transform = 'scale(1.02)'; }}
          >
            {/* Shimmer */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)', animation: 'shimmer 3s ease-in-out infinite' }} />
            </div>
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? (
                <><svg className="animate-spin" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Reading your hearts...</>
              ) : (
                <><span style={{ animation: 'heartbeat 1.8s ease-in-out infinite', display: 'inline-block' }}>💘</span> Reveal Our Love Story</>
              )}
            </span>
          </button>
        </div>
      </form>

      {/* Trust */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 26, marginTop: 30 }}>
        {[{ i: '🔒', t: 'Private' }, { i: '🤖', t: 'AI Powered' }, { i: '⚡', t: 'Instant' }].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b7a8a', fontWeight: 500, animation: `fade-in-up 0.5s ease ${0.6 + idx * 0.1}s both` }}>
            <span>{item.i}</span><span>{item.t}</span>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', fontSize: 10, color: '#5d4f5c', marginTop: 20, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
        Powered by Advanced Neural Networks
      </p>
    </div>
  );
};

export default CampaignForm;
