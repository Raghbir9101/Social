import { useState, useRef, useEffect } from 'react';

/**
 * Full-screen name capture overlay shown before the campaign reveals itself.
 * Intentionally neutral — no hearts, no love theme — so the user doesn't know
 * what comes next and can't pre-think a fake name.
 */
const NameCaptureModal = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Small delay so the mount animation has a moment to run
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: '#07070e',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(99,102,241,0.07) 0%, transparent 65%)',
      }} />

      <div
        className="relative w-full max-w-sm"
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <span style={{ fontSize: 26 }}>✨</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Before we begin
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          What should we call you?
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name..."
            maxLength={50}
            autoComplete="given-name"
            className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-all placeholder-gray-600"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${name.trim() ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(99,102,241,0.15)',
              color: '#fff',
              boxShadow: name.trim() ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            Continue →
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
};

export default NameCaptureModal;
