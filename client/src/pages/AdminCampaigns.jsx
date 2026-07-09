import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { formatDateTime } from '../lib/dateFormat';
import Sidebar from '../components/admin/Sidebar';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ campaignId: '', title: '', description: '' });
  const [createError, setCreateError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/campaigns', { params });
      if (res.data?.success) setCampaigns(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, [search, statusFilter]);

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/campaigns/${id}/toggle`);
      fetchCampaigns();
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.post('/campaigns', {
        ...newCampaign,
        theme: { primaryColor: '#ec4899', secondaryColor: '#8b5cf6', gradient: 'from-pink-500 to-purple-600', emoji: '✨', bgPattern: 'stars' },
        resultConfig: {
          stages: [
            { label: 'Initializing AI Engine...', duration: 1000 },
            { label: 'Analyzing Name Patterns...', duration: 1100 },
            { label: 'Processing Data Points...', duration: 1000 },
            { label: 'Calculating Compatibility...', duration: 1200 },
            { label: 'Generating Prediction...', duration: 800 },
          ],
          scoreRange: { min: 0, max: 100 },
          predictions: [
            { minScore: 0, maxScore: 25, title: 'Low Match', description: 'The AI sees different paths ahead.', emoji: '🌊' },
            { minScore: 26, maxScore: 50, title: 'Moderate Match', description: 'There is potential for growth.', emoji: '🌟' },
            { minScore: 51, maxScore: 75, title: 'Strong Match', description: 'Great compatibility detected!', emoji: '✨' },
            { minScore: 76, maxScore: 100, title: 'Perfect Match', description: 'Incredible bond detected!', emoji: '🔥' },
          ],
          insights: ['Compatibility score: {score}%', 'AI confidence: {confidence}%', 'Ranking: top {topPercent}%'],
        },
      });
      setShowCreate(false);
      setNewCampaign({ campaignId: '', title: '', description: '' });
      fetchCampaigns();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create');
    }
  };

  const deleteCampaign = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) { console.error(err); }
  };

  const inputStyle = { background: '#0c0c1a', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff' };
  const cardStyle = { background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };

  return (
    <Sidebar>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-display font-bold text-white">Campaigns</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}
              className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input type="text" placeholder="Search campaigns..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              style={inputStyle} className="px-4 py-2 rounded-xl text-sm placeholder-gray-500 outline-none w-full sm:w-48" />
            <button onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
              + New Campaign
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-3" style={{ ...cardStyle, animation: 'fade-in-up 0.3s ease' }}>
            {createError && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }} className="rounded-xl px-4 py-2 text-red-400 text-sm">{createError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="campaign-slug" value={newCampaign.campaignId} onChange={e => setNewCampaign(p => ({ ...p, campaignId: e.target.value }))}
                style={inputStyle} className="px-4 py-2.5 rounded-xl text-sm placeholder-gray-500 outline-none" required />
              <input placeholder="Campaign Title" value={newCampaign.title} onChange={e => setNewCampaign(p => ({ ...p, title: e.target.value }))}
                style={inputStyle} className="px-4 py-2.5 rounded-xl text-sm placeholder-gray-500 outline-none" required />
            </div>
            <textarea placeholder="Description..." value={newCampaign.description} onChange={e => setNewCampaign(p => ({ ...p, description: e.target.value }))} rows={2}
              style={inputStyle} className="w-full px-4 py-2.5 rounded-xl text-sm placeholder-gray-500 outline-none resize-none" required />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)' }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={cardStyle}>
              <div className="h-5 rounded w-3/4 mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 rounded w-full mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          )) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No campaigns found</p>
              <p className="text-gray-600 text-sm">Try adjusting your filters or create a new campaign</p>
            </div>
          ) : campaigns.map(c => (
            <div key={c._id} className="rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform" style={cardStyle}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10" style={{ background: `linear-gradient(135deg, ${c.theme?.primaryColor || '#ec4899'}, ${c.theme?.secondaryColor || '#8b5cf6'})` }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-white flex items-center gap-2">
                    <span>{c.theme?.emoji || '✨'}</span>
                    {c.title}
                  </h3>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">/{c.campaignId}</p>
                </div>
                <button onClick={() => toggleStatus(c._id)} className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    background: c.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: c.status === 'active' ? '#34d399' : '#f87171',
                  }}>
                  {c.status}
                </button>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{c.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created: {formatDateTime(c.createdAt)}</span>
                <button onClick={() => deleteCampaign(c._id)} className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminCampaigns;
