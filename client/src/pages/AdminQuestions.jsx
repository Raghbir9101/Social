import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { formatDateTime } from '../lib/dateFormat';
import { parseDeviceModel } from '../lib/analytics';
import Sidebar from '../components/admin/Sidebar';

// ─── Full-message modal ──────────────────────────────────
const MessageModal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div className="relative w-full max-w-lg rounded-2xl p-6 sm:p-7"
        style={{ background: 'linear-gradient(145deg,#1e1e32,#161628)', border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Full Message</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>
        <p className="text-gray-100 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</p>
      </div>
    </div>
  );
};

const AdminQuestions = () => {
  const [expandedMessage, setExpandedMessage] = useState(null);

  // ─── Boxes ─────────────────────────────────────────────
  const [boxes, setBoxes] = useState([]);
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [newBox, setNewBox] = useState({ boxId: '', title: '', description: '' });
  const [boxError, setBoxError] = useState('');
  const [creatingBox, setCreatingBox] = useState(false);

  // ─── Questions ─────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [boxFilter, setBoxFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const debounceRef = useRef(null);

  // ─── Fetch boxes ────────────────────────────────────────
  const fetchBoxes = useCallback(async () => {
    try {
      const res = await api.get('/qna/boxes');
      if (res.data?.success) setBoxes(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchBoxes(); }, [fetchBoxes]);

  // ─── Debounced search ────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ─── Fetch questions ─────────────────────────────────────
  const fetchQuestions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 25, sortOrder };
      if (boxFilter) params.boxId = boxFilter;
      if (search) params.search = search;
      const res = await api.get('/qna/questions', { params });
      if (res.data?.success) {
        setQuestions(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 25, pages: 0 });
      }
    } catch {}
    finally { setLoading(false); }
  }, [boxFilter, search, sortOrder]);

  useEffect(() => { fetchQuestions(1); }, [fetchQuestions]);

  // ─── Box create ──────────────────────────────────────────
  const handleCreateBox = async (e) => {
    e.preventDefault();
    setBoxError('');
    if (!newBox.boxId.trim() || !newBox.title.trim()) { setBoxError('ID and Title are required'); return; }
    setCreatingBox(true);
    try {
      const res = await api.post('/qna/boxes', newBox);
      if (res.data?.success) {
        setBoxes(prev => [res.data.data, ...prev]);
        setNewBox({ boxId: '', title: '', description: '' });
        setShowCreateBox(false);
      }
    } catch (err) {
      setBoxError(err.response?.data?.message || 'Failed to create box');
    } finally {
      setCreatingBox(false);
    }
  };

  const handleDeleteBox = async (boxId) => {
    if (!confirm(`Delete box "${boxId}" and ALL its questions? This cannot be undone.`)) return;
    try {
      await api.delete(`/qna/boxes/${boxId}`);
      setBoxes(prev => prev.filter(b => b.boxId !== boxId));
      if (boxFilter === boxId) setBoxFilter('');
      fetchQuestions(1);
    } catch {}
  };

  // ─── Question actions ────────────────────────────────────
  const markRead = async (id) => {
    try {
      await api.patch(`/qna/questions/${id}/read`);
      setQuestions(prev => prev.map(q => q._id === id ? { ...q, isRead: true } : q));
    } catch {}
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/qna/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch {}
  };

  // ─── Styles ──────────────────────────────────────────────
  const cardStyle = { background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };
  const inputStyle = { background: '#0c0c1a', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff' };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Sidebar>
      <MessageModal message={expandedMessage} onClose={() => setExpandedMessage(null)} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-display font-bold text-white">Anonymous Q&amp;A</h1>
          <button
            onClick={() => setShowCreateBox(v => !v)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
            style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            {showCreateBox ? '✕ Cancel' : '+ New Question Box'}
          </button>
        </div>

        {/* ─── Create box form ─────────────────────────── */}
        {showCreateBox && (
          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 className="text-white font-semibold mb-4 text-sm">Create Question Box</h3>
            <form onSubmit={handleCreateBox} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Box ID (URL slug) *</label>
                <input type="text" placeholder="e.g. raghbir-anon" value={newBox.boxId}
                  onChange={e => setNewBox(v => ({ ...v, boxId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  style={inputStyle} className="w-full px-3 py-2 rounded-xl text-sm outline-none placeholder-gray-600" />
                {newBox.boxId && <p className="text-gray-600 text-[11px] mt-1 font-mono truncate">{origin}/q/{newBox.boxId}</p>}
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Display Title *</label>
                <input type="text" placeholder="e.g. Ask me anything!" value={newBox.title}
                  onChange={e => setNewBox(v => ({ ...v, title: e.target.value }))}
                  style={inputStyle} className="w-full px-3 py-2 rounded-xl text-sm outline-none placeholder-gray-600" />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Description (optional)</label>
                <input type="text" placeholder="Subtitle shown on the form" value={newBox.description}
                  onChange={e => setNewBox(v => ({ ...v, description: e.target.value }))}
                  style={inputStyle} className="w-full px-3 py-2 rounded-xl text-sm outline-none placeholder-gray-600" />
              </div>
              {boxError && <p className="sm:col-span-3 text-red-400 text-xs">{boxError}</p>}
              <div className="sm:col-span-3">
                <button type="submit" disabled={creatingBox}
                  className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }}>
                  {creatingBox ? 'Creating…' : 'Create Box'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Existing boxes ──────────────────────────── */}
        {boxes.length > 0 && (
          <div className="rounded-2xl p-4" style={cardStyle}>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Your Question Boxes</h3>
            <div className="space-y-2">
              {boxes.map(b => (
                <div key={b.boxId} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">{b.title}</p>
                    <a href={`${origin}/q/${b.boxId}`} target="_blank" rel="noopener noreferrer"
                      className="text-purple-400 text-xs font-mono hover:text-purple-300 transition-colors truncate block">
                      {origin}/q/{b.boxId}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { navigator.clipboard?.writeText(`${origin}/q/${b.boxId}`); }}
                      className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      title="Copy link"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => setBoxFilter(v => v === b.boxId ? '' : b.boxId)}
                      className="px-3 py-1 rounded-lg text-xs transition-colors"
                      style={{
                        background: boxFilter === b.boxId ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                        color: boxFilter === b.boxId ? '#c084fc' : '#9ca3af',
                        border: `1px solid ${boxFilter === b.boxId ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      {boxFilter === b.boxId ? '✓ Filtering' : 'Filter'}
                    </button>
                    <button onClick={() => handleDeleteBox(b.boxId)}
                      className="px-3 py-1 rounded-lg text-xs text-gray-600 hover:text-red-400 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Questions table ─────────────────────────── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold text-white flex-1">
              Questions
              {pagination.total > 0 && <span className="text-gray-500 text-sm font-normal ml-2">({pagination.total})</span>}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={boxFilter} onChange={e => setBoxFilter(e.target.value)} style={inputStyle}
                className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer">
                <option value="">All Boxes</option>
                {boxes.map(b => <option key={b.boxId} value={b.boxId}>{b.title}</option>)}
              </select>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={inputStyle}
                className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer">
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
              <input type="text" placeholder="Search questions..." value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={inputStyle} className="px-4 py-2 rounded-xl text-sm placeholder-gray-500 outline-none w-full sm:w-48" />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Message', 'Box', 'Sent At', '1st Visit', 'Location', 'Source', 'Browser', 'Device', 'IP', 'Visitor ID', ''].map(label => (
                      <th key={label} className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {Array(11).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : questions.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-16 text-gray-600">
                      <div className="text-4xl mb-3">📭</div>
                      <p>No questions yet</p>
                      {boxes.length === 0 && <p className="text-xs mt-1">Create a question box and share the link to start receiving messages.</p>}
                    </td></tr>
                  ) : questions.map(q => (
                    <tr key={q._id}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: q.isRead ? 'transparent' : 'rgba(168,85,247,0.04)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = q.isRead ? 'transparent' : 'rgba(168,85,247,0.04)'}
                    >
                      {/* Message */}
                      <td className="px-4 py-4 cursor-pointer" style={{ minWidth: 200, maxWidth: 300 }}
                        onClick={() => setExpandedMessage(q.message)}>
                        <div className="flex items-start gap-2">
                          {!q.isRead && (
                            <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: '#a855f7' }} />
                          )}
                          <div>
                            <p
                              className="text-gray-100 text-sm leading-relaxed"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                              }}
                            >{q.message}</p>
                            {q.message.length > 120 && (
                              <span className="text-purple-500 text-xs mt-0.5 block">tap to read more</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Box */}
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-md text-xs whitespace-nowrap" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.15)' }}>
                          {q.boxId}
                        </span>
                      </td>

                      {/* Sent At */}
                      <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">{formatDateTime(q.createdAt)}</td>

                      {/* 1st Visit */}
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(q.firstVisitTimestamp)}</td>

                      {/* Location */}
                      <td className="px-4 py-4 text-xs">
                        {(() => {
                          const loc = q.location;
                          const place = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(', ');
                          const hasCoords = loc?.latitude != null && loc?.longitude != null;
                          const coords = hasCoords ? `${Number(loc.latitude).toFixed(5)}, ${Number(loc.longitude).toFixed(5)}` : null;
                          const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : null;
                          if (!place && !coords) return <span className="text-gray-600">—</span>;
                          return (
                            <div className="space-y-0.5">
                              {place && <div className="text-gray-200 whitespace-nowrap">{place}</div>}
                              {coords && (mapsUrl
                                ? <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 font-mono whitespace-nowrap transition-colors text-[11px]">{coords} 🗺</a>
                                : <div className="text-gray-400 font-mono whitespace-nowrap text-[11px]">{coords}</div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Source badge */}
                      <td className="px-4 py-4">
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                          background: q.location?.source === 'browser_gps' ? 'rgba(16,185,129,0.12)' : q.location?.source === 'ip_lookup' ? 'rgba(59,130,246,0.12)' : 'rgba(156,163,175,0.12)',
                          color: q.location?.source === 'browser_gps' ? '#34d399' : q.location?.source === 'ip_lookup' ? '#60a5fa' : '#9ca3af',
                        }}>
                          {q.location?.source === 'browser_gps' ? '📍 GPS' : q.location?.source === 'ip_lookup' ? '🌐 IP' : '❓ N/A'}
                        </span>
                      </td>

                      {/* Browser */}
                      <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">
                        {q.device?.browser || '—'}{q.device?.browserVersion ? ` ${q.device.browserVersion}` : ''}
                      </td>

                      {/* Device */}
                      <td className="px-4 py-4 text-xs">
                        {(() => {
                          const model = q.device?.deviceModel || parseDeviceModel(q.device?.userAgent);
                          const type = q.device?.deviceType || '';
                          if (!model && !type) return <span className="text-gray-600">—</span>;
                          return (
                            <div className="space-y-0.5">
                              {model ? <div className="text-gray-200 whitespace-nowrap">{model}</div> : <div className="text-gray-400 whitespace-nowrap">{type}</div>}
                              {model && type && <div className="text-gray-600 text-[11px] whitespace-nowrap">{type}</div>}
                            </div>
                          );
                        })()}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-4 text-gray-400 text-xs font-mono whitespace-nowrap">{q.ip || '—'}</td>

                      {/* Visitor ID */}
                      <td className="px-4 py-4 text-gray-600 text-xs font-mono whitespace-nowrap">{q.visitorId || '—'}</td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {!q.isRead && (
                            <button onClick={() => markRead(q._id)} title="Mark as read"
                              className="p-1.5 rounded-lg text-xs text-gray-500 hover:text-purple-400 transition-colors"
                              style={{ background: 'rgba(255,255,255,0.03)' }}>✓</button>
                          )}
                          <button onClick={() => deleteQuestion(q._id)} title="Delete"
                            className="p-1.5 rounded-lg text-xs text-gray-600 hover:text-red-400 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-gray-500">
                  {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-1">
                  {pagination.page > 1 && <button onClick={() => fetchQuestions(pagination.page - 1)} className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white cursor-pointer">← Prev</button>}
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => Math.max(1, pagination.page - 3) + i)
                    .filter(p => p <= pagination.pages).map(p => (
                    <button key={p} onClick={() => fetchQuestions(p)} className="px-3 py-1 rounded-lg text-xs cursor-pointer"
                      style={{ background: p === pagination.page ? 'rgba(168,85,247,0.2)' : 'transparent', color: p === pagination.page ? '#c084fc' : '#9ca3af' }}>
                      {p}
                    </button>
                  ))}
                  {pagination.page < pagination.pages && <button onClick={() => fetchQuestions(pagination.page + 1)} className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white cursor-pointer">Next →</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminQuestions;
