import { useState, useEffect, useCallback, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { CHART_COLORS } from '../lib/constants';
import Sidebar from '../components/admin/Sidebar';

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
    className="rounded-2xl p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform min-w-0">
    <div className="absolute -top-4 -right-4 text-5xl opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>
    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">{label}</p>
    <p className="text-xl sm:text-2xl font-display font-bold truncate" style={{ color }}>{value}</p>
  </div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div style={{ background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
    className={`rounded-2xl p-5 ${className}`}>
    <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(20,20,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} className="rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);
  const [campaignFilter, setCampaignFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [days, setDays] = useState(30);

  // Fetch campaign list for the filter dropdown
  useEffect(() => {
    api.get('/campaigns').then(res => {
      if (res.data?.success) setCampaigns(res.data.data || []);
    }).catch(() => {});
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (campaignFilter) params.campaignId = campaignFilter;
        if (days) params.days = days;

        const [statsRes, visitorsDay, subsDay, countries, browsers, devices] = await Promise.all([
          api.get('/analytics/dashboard', { params }),
          api.get('/analytics/charts/visitors-by-day', { params }),
          api.get('/analytics/charts/submissions-by-day', { params }),
          api.get('/analytics/charts/top-countries', { params }),
          api.get('/analytics/charts/browsers', { params }),
          api.get('/analytics/charts/devices', { params }),
        ]);
        setStats(statsRes.data?.data);
        setCharts({
          visitorsByDay: visitorsDay.data?.data || [],
          submissionsByDay: subsDay.data?.data || [],
          countries: countries.data?.data || [],
          browsers: browsers.data?.data || [],
          devices: devices.data?.data || [],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaignFilter, days]);

  const skeletonCard = (
    <div style={{ background: 'linear-gradient(145deg, #1e1e32, #161628)', border: '1px solid rgba(255,255,255,0.07)' }} className="rounded-2xl p-5 animate-pulse">
      <div className="h-4 rounded mb-3 w-20" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-8 rounded w-16" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Campaign Filter */}
            <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
              style={{ background: 'rgba(12,12,26,0.95)', border: '1.5px solid rgba(255,255,255,0.08)' }}
              className="px-3 py-2 rounded-xl text-white text-sm outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/30">
              <option value="">All Campaigns</option>
              {campaigns.map(c => <option key={c.campaignId} value={c.campaignId}>{c.title}</option>)}
            </select>
            {/* Days Filter */}
            <select value={days} onChange={e => setDays(Number(e.target.value))}
              style={{ background: 'rgba(12,12,26,0.95)', border: '1.5px solid rgba(255,255,255,0.08)' }}
              className="px-3 py-2 rounded-xl text-white text-sm outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/30">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array(6).fill(0).map((_, i) => <div key={i}>{skeletonCard}</div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Visitors" value={stats?.totalVisitors || 0} icon="👁️" color="#ec4899" />
              <StatCard label="Unique Visitors" value={stats?.uniqueVisitors || 0} icon="👤" color="#8b5cf6" />
              <StatCard label="Active Sessions" value={stats?.activeSessions || 0} icon="⚡" color="#06b6d4" />
              <StatCard label="Submissions" value={stats?.totalSubmissions || 0} icon="📝" color="#10b981" />
              <StatCard label="Conversion Rate" value={`${stats?.conversionRate || 0}%`} icon="📈" color="#f59e0b" />
              <StatCard label="Active Campaigns" value={stats?.activeCampaigns || 0} icon="🚀" color="#3b82f6" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Visitors by Day">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.visitorsByDay}>
                      <defs><linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" name="Visitors" stroke="#ec4899" fill="url(#vGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Submissions by Day">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.submissionsByDay} barCategoryGap="40%">
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Submissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartCard title="Top Countries">
                <div className="space-y-2">
                  {(charts.countries || []).slice(0, 6).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate flex-1">{c.name || 'Unknown'}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{ width: `${(c.count / (charts.countries[0]?.count || 1)) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <span className="text-gray-500 text-xs w-8 text-right">{c.count}</span>
                      </div>
                    </div>
                  ))}
                  {!charts.countries?.length && <p className="text-gray-500 text-sm text-center py-4">No data yet</p>}
                </div>
              </ChartCard>

              <ChartCard title="Browser Distribution">
                <div className="h-48 flex items-center justify-center">
                  {charts.browsers?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={charts.browsers} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {charts.browsers.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl mb-2 opacity-30">🌐</p>
                      <p className="text-gray-500 text-sm">No data yet</p>
                    </div>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Device Distribution">
                <div className="h-48 flex items-center justify-center">
                  {charts.devices?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={charts.devices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {charts.devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl mb-2 opacity-30">💻</p>
                      <p className="text-gray-500 text-sm">No data yet</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default AdminDashboard;
