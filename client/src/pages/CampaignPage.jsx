import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getVisitorInfo } from '../lib/visitor';
import { getLocation } from '../lib/location';
import { collectAnalytics } from '../lib/analytics';
import { generateResult } from '../lib/resultGenerator';
import { CAMPAIGN_STATES } from '../lib/constants';
import { pageMeta } from '../lib/metaTags';
import ParticleBackground from '../components/campaign/ParticleBackground';
import CampaignForm from '../components/campaign/CampaignForm';
import AIProcessing from '../components/campaign/AIProcessing';
import ResultCard from '../components/campaign/ResultCard';
import SharePanel from '../components/campaign/SharePanel';
import NameCaptureModal from '../components/campaign/NameCaptureModal';

const USER_NAME_KEY = 'visitor_name';

const CampaignPage = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState(CAMPAIGN_STATES.LOADING);
  const [campaign, setCampaign] = useState(null);
  const [result, setResult] = useState(null);
  const [names, setNames] = useState({ name1: '', name2: '' });
  const [shareId, setShareId] = useState(null);
  const [error, setError] = useState('');
  // null = not checked yet; '' = checked, no name saved; 'Alice' = name known
  const [userName, setUserName] = useState(null);
  const pageLoadTime = useRef(Date.now());
  const predictPromise = useRef(null);
  const locationRef = useRef(null);

  // Check localStorage for saved name on mount
  useEffect(() => {
    const saved = localStorage.getItem(USER_NAME_KEY);
    setUserName(saved || '');
  }, []);

  // Handler called when user submits their name in the modal
  const handleNameSubmit = (name) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
  };

  useEffect(() => {
    // Don't start init until we know whether the user has a saved name
    // (userName null = still reading localStorage)
    if (userName === null) return;

    const init = async () => {
      try {
        const res = await api.get(`/campaigns/${campaignId}`);
        if (!res.data?.success) { setError('Campaign not found'); return; }
        const data = res.data.data;
        setCampaign(data);
        pageMeta.campaign(data);
        // Variant is sticky per campaign — first ?v= value seen is saved to localStorage
        // and reused for all future visits, even if a different ?v= arrives later.
        const storageKey = `variant_${campaignId}`;
        const savedVariant = localStorage.getItem(storageKey);
        const urlVariant = searchParams.get('v') || '';
        let variant = savedVariant || '';
        if (!savedVariant && urlVariant) {
          localStorage.setItem(storageKey, urlVariant);
          variant = urlVariant;
        }
        const [location, analytics] = await Promise.all([getLocation(), Promise.resolve(collectAnalytics())]);
        locationRef.current = location;
        const visitorInfo = getVisitorInfo();
        // Include captured userName in tracking
        const currentUserName = localStorage.getItem(USER_NAME_KEY) || '';
        api.post('/visitors/track', { ...visitorInfo, campaignId, variant, userName: currentUserName, location, ...analytics }).catch(() => {});

        // Shared result link (?r=shareId) — load the saved result directly
        const sharedId = searchParams.get('r');
        if (sharedId) {
          try {
            const shared = await api.get(`/submissions/share/${sharedId}`);
            if (shared.data?.success && shared.data.data) {
              const s = shared.data.data;
              setNames({ name1: s.name1, name2: s.name2 });
              setResult({
                score: s.score,
                aiConfidence: s.aiConfidence,
                prediction: s.prediction,
                paragraphs: s.paragraphs || [],
                insights: s.insights || [],
                result: s.result,
                source: 'shared',
              });
              setShareId(s.shareId);
              pageMeta.result(s.name1, s.name2, s.score);
              setState(CAMPAIGN_STATES.RESULT);
              return;
            }
          } catch { /* fall through to the form */ }
        }

        setState(CAMPAIGN_STATES.FORM);
      } catch (err) {
        console.error('Campaign init error:', err);
        setError('Campaign not found or unavailable');
      }
    };
    if (campaignId) init();
  }, [campaignId, userName]);

  const handleSubmit = (name1, name2) => {
    setNames({ name1, name2 });
    // Kick off the GPT prediction while the processing animation plays
    predictPromise.current = api
      .post('/ai/predict', { name1, name2, campaignId }, { timeout: 45000 })
      .then(res => (res.data?.success ? res.data.data : null))
      .catch(() => null);
    setState(CAMPAIGN_STATES.PROCESSING);
  };

  const handleProcessingComplete = async () => {
    const { name1, name2 } = names;
    // Prefer the server-side GPT result; fall back to the local generator
    const aiResult = await predictPromise.current;
    const gen = aiResult || generateResult(name1, name2, campaignId, campaign?.resultConfig);
    setResult(gen);
    pageMeta.result(name1, name2, gen.score);
    const visitorInfo = getVisitorInfo();
    const analytics = collectAnalytics();
    const variant = localStorage.getItem(`variant_${campaignId}`) || '';
    const submittedUserName = localStorage.getItem(USER_NAME_KEY) || '';
    // Save the result — the returned shareId powers the shareable result link
    api.post('/submissions', { ...visitorInfo, campaignId, variant, userName: submittedUserName, name1, name2, score: gen.score, result: gen.result, aiConfidence: gen.aiConfidence, prediction: gen.prediction, paragraphs: gen.paragraphs || [], insights: gen.insights || [], analytics: { ...analytics, location: locationRef.current || {}, performance: { ...analytics.performance, timeToSubmit: Date.now() - pageLoadTime.current } } })
      .then(res => {
        if (res.data?.success && res.data.data?.shareId) {
          const sid = res.data.data.shareId;
          setShareId(sid);
          // Update the URL to include ?r=shareId so the address bar shows the shareable link
          navigate(`/${campaignId}?r=${sid}`, { replace: true });
        }
      })
      .catch(() => {});
    setState(CAMPAIGN_STATES.RESULT);
  };

  // Shared card style
  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(22,22,38,0.95), rgba(14,14,26,0.98))',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  // Show name capture modal before anything else if name not yet saved
  if (userName === null || userName === '') {
    return <NameCaptureModal onSubmit={handleNameSubmit} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0c0610' }}>
        <div className="rounded-3xl p-10 text-center max-w-sm" style={cardStyle}>
          <div className="text-6xl mb-5" style={{ animation: 'float 3s ease-in-out infinite' }}>💔</div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">Campaign Not Found</h2>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (state === CAMPAIGN_STATES.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0610' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full animate-spin" style={{ border: '3px solid transparent', borderTopColor: '#ec4899', borderRightColor: '#8b5cf6', borderBottomColor: '#06b6d4' }} />
          </div>
          <p className="text-gray-500 text-sm animate-pulse font-medium">Loading experience...</p>
        </div>
      </div>
    );
  }

  const pc = campaign?.theme?.primaryColor || '#ec4899';
  const sc = campaign?.theme?.secondaryColor || '#8b5cf6';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0c0610' }}>
      <ParticleBackground primaryColor={pc} secondaryColor={sc} />

      {/* Rich layered romantic background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -5%, ${pc}18 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 85% 100%, ${sc}10 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 10% 70%, ${pc}08 0%, transparent 50%),
          radial-gradient(ellipse 50% 35% at 50% 50%, #d946ef06 0%, transparent 60%)
        `,
      }} />

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        {state === CAMPAIGN_STATES.FORM && <CampaignForm campaign={campaign} onSubmit={handleSubmit} initialName={userName} />}
        {state === CAMPAIGN_STATES.PROCESSING && <AIProcessing stages={campaign?.resultConfig?.stages || []} onComplete={handleProcessingComplete} campaign={campaign} />}
        {state === CAMPAIGN_STATES.RESULT && (
          <div className="w-full max-w-xl mx-auto px-4">
            <ResultCard result={result} name1={names.name1} name2={names.name2} campaign={campaign} />
            <SharePanel result={result} name1={names.name1} name2={names.name2} campaign={campaign} shareId={shareId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;
