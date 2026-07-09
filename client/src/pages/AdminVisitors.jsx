import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { formatDateTime } from '../lib/dateFormat';
import { parseDeviceModel } from '../lib/analytics';
import Sidebar from '../components/admin/Sidebar';

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [variantFilter, setVariantFilter] = useState('');
  const debounceRef = useRef(null);

  // Fetch campaigns for filter dropdown
  useEffect(() => {
    api.get('/campaigns').then(res => {
      if (res.data?.success) setCampaigns(res.data.data || []);
    }).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const fetchVisitors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 25, sortBy, sortOrder };
      if (search) params.search = search;
      if (campaignFilter) params.campaignId = campaignFilter;
      if (variantFilter) params.variant = variantFilter;
      const res = await api.get('/visitors', { params });
      if (res.data?.success) {
        setVisitors(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 25, pages: 0 });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, sortBy, sortOrder, campaignFilter, variantFilter]);

  useEffect(() => { fetchVisitors(1); }, [fetchVisitors]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-[10px]">{sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
  );

  const LocationBadge = ({ source }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
      background: source === 'browser_gps' ? 'rgba(16,185,129,0.12)' : source === 'ip_lookup' ? 'rgba(59,130,246,0.12)' : 'rgba(156,163,175,0.12)',
      color: source === 'browser_gps' ? '#34d399' : source === 'ip_lookup' ? '#60a5fa' : '#9ca3af',
    }}>
      {source === 'browser_gps' ? '📍 GPS' : source === 'ip_lookup' ? '🌐 IP' : '❓ N/A'}
    </span>
  );

  const tableStyle = { background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };
  const inputStyle = { background: '#0c0c1a', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff' };

  return (
    <Sidebar>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-display font-bold text-white">Visitors</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} style={inputStyle}
              className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer">
              <option value="">All Campaigns</option>
              {campaigns.map(c => <option key={c.campaignId} value={c.campaignId}>{c.title}</option>)}
            </select>
            <input type="text" placeholder="Filter by ?v=..." value={variantFilter} onChange={e => setVariantFilter(e.target.value)}
              style={inputStyle} className="px-4 py-2 rounded-xl text-sm placeholder-gray-500 outline-none w-28" />
            <input type="text" placeholder="Search visitors..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              style={inputStyle} className="px-4 py-2 rounded-xl text-sm placeholder-gray-500 outline-none w-full sm:w-56" />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={tableStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    ['visitorId', 'Visitor ID'], ['userName', 'Name'], ['campaignId', 'Campaign'], ['variant', 'Variant'],
                    ['createdAt', 'Visit Time'], ['firstVisitTimestamp', '1st Visit'],
                    ['location', 'Location'], ['locationSource', 'Source'],
                    ['device.browser', 'Browser'], ['device.deviceType', 'Device'], ['ip', 'IP']
                  ].map(([field, label]) => (
                    <th key={field} className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors whitespace-nowrap" onClick={() => handleSort(field)} style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {label}<SortIcon field={field} />
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
                ) : visitors.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-12 text-gray-500">No visitors found</td></tr>
                ) : visitors.map((v) => (
                  <tr key={v._id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-4 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">{v.visitorId}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {v.userName
                        ? <span className="text-white text-sm font-semibold">{v.userName}</span>
                        : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-gray-200 font-medium">{v.campaignId}</td>
                    <td className="px-4 py-4">
                      {v.variant
                        ? <span className="px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>{v.variant}</span>
                        : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">{formatDateTime(v.createdAt)}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(v.firstVisitTimestamp)}</td>
                    <td className="px-4 py-4 text-xs">
                      {(() => {
                        const loc = v.location;
                        const place = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(', ');
                        const hasCoords = loc?.latitude != null && loc?.longitude != null;
                        const coords = hasCoords ? `${Number(loc.latitude).toFixed(5)}, ${Number(loc.longitude).toFixed(5)}` : null;
                        const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : null;
                        if (!place && !coords) return <span className="text-gray-500">—</span>;
                        return (
                          <div className="space-y-0.5">
                            {place && <div className="text-gray-200 whitespace-nowrap">{place}</div>}
                            {coords && (
                              mapsUrl
                                ? <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 font-mono whitespace-nowrap transition-colors">{coords} 🗺</a>
                                : <div className="text-gray-400 font-mono whitespace-nowrap">{coords}</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4"><LocationBadge source={v.location?.source} /></td>
                    <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">{v.device?.browser || '—'}{v.device?.browserVersion ? ` ${v.device.browserVersion}` : ''}</td>
                    <td className="px-4 py-4 text-xs">
                      {(() => {
                        const model = v.device?.deviceModel || parseDeviceModel(v.device?.userAgent);
                        const type = v.device?.deviceType || '';
                        if (!model && !type) return <span className="text-gray-500">—</span>;
                        return (
                          <div className="space-y-0.5">
                            {model
                              ? <div className="text-gray-200 whitespace-nowrap">{model}</div>
                              : <div className="text-gray-400 whitespace-nowrap">{type}</div>
                            }
                            {model && type && (
                              <div className="text-gray-500 text-[11px] whitespace-nowrap">{type}</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs font-mono">{v.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-gray-500">
                {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                {pagination.page > 1 && (
                  <button onClick={() => fetchVisitors(pagination.page - 1)} className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">← Prev</button>
                )}
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const start = Math.max(1, pagination.page - 3);
                  return start + i;
                }).filter(p => p <= pagination.pages).map(p => (
                  <button key={p} onClick={() => fetchVisitors(p)}
                    className="px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                    style={{ background: p === pagination.page ? 'rgba(236,72,153,0.15)' : 'transparent', color: p === pagination.page ? '#f472b6' : '#9ca3af' }}>
                    {p}
                  </button>
                ))}
                {pagination.page < pagination.pages && (
                  <button onClick={() => fetchVisitors(pagination.page + 1)} className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Next →</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminVisitors;
