import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { getVisitorInfo } from '../lib/visitor';
import { getLocation } from '../lib/location';
import { collectAnalytics } from '../lib/analytics';
import { pageMeta } from '../lib/metaTags';

const MAX_CHARS = 500;

const QuestionPage = () => {
  const { boxId } = useParams();
  const [box, setBox] = useState(null);
  const [message, setMessage] = useState('');
  const [state, setState] = useState('loading'); // loading | form | submitting | done | error | notfound
  const [charCount, setCharCount] = useState(0);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting | gps | ip | none
  const locationRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get(`/qna/boxes/${boxId}`);
        if (!res.data?.success) { setState('notfound'); return; }
        setBox(res.data.data);
        pageMeta.questionBox(res.data.data);

        // Show form immediately
        setState('form');

        // Collect location and track visit in background
        const location = await getLocation();
        locationRef.current = location;

        // Update location status based on source
        if (location?.source === 'browser_gps') {
          setLocationStatus('gps');
        } else if (location?.source === 'ip_lookup') {
          setLocationStatus('ip');
        } else {
          setLocationStatus('none');
        }

        // Track the visit with location data
        const visitorInfo = getVisitorInfo();
        const analytics = collectAnalytics();
        console.log('🗺 Tracking QNA visit with location:', { boxId, location, source: location?.source });
        api.post('/qna/track-visit', {
          boxId,
          ...visitorInfo,
          location,
          device: analytics.device,
        })
        .then(() => console.log('✅ QNA visit tracked successfully'))
        .catch((err) => {
          console.error('❌ Failed to track QNA visit:', err);
        });
      } catch {
        setState('notfound');
      }
    };
    if (boxId) init();
  }, [boxId]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setMessage(val);
      setCharCount(val.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || state === 'submitting') return;
    setState('submitting');
    try {
      const visitorInfo = getVisitorInfo();
      const analytics = collectAnalytics();
      await api.post(`/qna/ask/${boxId}`, {
        message: message.trim(),
        ...visitorInfo,
        location: locationRef.current || {},
        device: analytics.device,
      });
      setState('done');
    } catch {
      setState('error');
    }
  };

  // ─── Screens ────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070d' }}>
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#a855f7', borderRightColor: '#ec4899' }} />
      </div>
    );
  }

  if (state === 'notfound') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#07070d' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Link not found</h2>
          <p className="text-gray-500 text-sm">This anonymous question link doesn't exist or has been disabled.</p>
        </div>
      </div>
    );
  }

  const bg = '#07070d';
  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(20,18,35,0.98), rgba(12,10,22,0.99))',
    border: '1px solid rgba(168,85,247,0.12)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.04), inset 0 1px 0 rgba(168,85,247,0.06)',
  };

  if (state === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        {/* Glow */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168,85,247,0.06) 0%, transparent 70%)',
        }} />
        <div className="relative w-full max-w-md">
          <div className="rounded-3xl p-10 text-center" style={cardStyle}>
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <span className="text-4xl">✉️</span>
              <span className="absolute -top-1 -right-1 text-xl" style={{ animation: 'float 2s ease-in-out infinite' }}>✨</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Sent anonymously!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Your message was delivered. {box?.title ? `${box.title} will` : 'They will'} see it — but they'll never know it was you.
            </p>
            <button
              onClick={() => { setMessage(''); setCharCount(0); setState('form'); }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.12)'}
            >
              Ask another question
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: bg }}>
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168,85,247,0.08) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 50% 40% at 80% 100%, rgba(236,72,153,0.05) 0%, transparent 50%)',
        }} />
        {/* Subtle grid */}
        <div className="opacity-[0.015]" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-medium" style={{ background: 'rgba(168,85,247,0.08)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.15)' }}>
            <span>🔒</span> 100% Anonymous
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {box?.title || 'Ask me anything'}
          </h1>
          {box?.description && (
            <p className="text-gray-400 text-sm">{box.description}</p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 sm:p-8" style={cardStyle}>
          <form onSubmit={handleSubmit}>
            {/* Textarea */}
            <div className="relative mb-5">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                placeholder="Type your anonymous question or message..."
                rows={5}
                className="w-full resize-none rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${message.length > 0 ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  lineHeight: '1.7',
                }}
              />
              {/* Char counter */}
              <span className="absolute bottom-3 right-4 text-xs" style={{ color: charCount > MAX_CHARS * 0.9 ? '#f87171' : '#4b5563' }}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!message.trim() || state === 'submitting'}
              className="w-full py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: message.trim()
                  ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                  : 'rgba(168,85,247,0.15)',
                color: message.trim() ? '#fff' : '#6b7280',
                boxShadow: message.trim() ? '0 4px 24px rgba(168,85,247,0.3)' : 'none',
              }}
            >
              {state === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending...
                </span>
              ) : (
                '🔒 Send Anonymously'
              )}
            </button>

            {state === 'error' && (
              <p className="text-red-400 text-xs text-center mt-3">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>

        {/* Footer note */}
        <div className="mt-5 space-y-2">
          <p className="text-center text-xs text-gray-700">
            Your identity is hidden. Messages are delivered anonymously.
          </p>

          {/* Location status indicator */}
          {locationStatus !== 'detecting' && (
            <div className="flex items-center justify-center gap-2">
              {locationStatus === 'gps' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span className="text-emerald-400">📍</span>
                  <span className="text-emerald-300 font-medium">Location shared via GPS</span>
                </div>
              )}
              {locationStatus === 'ip' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <span className="text-blue-400">🌐</span>
                  <span className="text-blue-300 font-medium">Approximate location from IP</span>
                </div>
              )}
              {locationStatus === 'none' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(156,163,175,0.08)', border: '1px solid rgba(156,163,175,0.15)' }}>
                  <span className="text-gray-500">🔒</span>
                  <span className="text-gray-500 font-medium">No location shared</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
