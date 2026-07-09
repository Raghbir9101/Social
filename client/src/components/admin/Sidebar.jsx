import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/visitors', label: 'Visitors', icon: '👥' },
  { path: '/admin/submissions', label: 'Submissions', icon: '📝' },
  { path: '/admin/campaigns', label: 'Campaigns', icon: '🚀' },
  { path: '/admin/questions', label: 'Anon Q&A', icon: '🔒' },
];

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — always fixed, slides in/out on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderRight: '1px solid rgba(72,72,96,0.2)' }}
      >
        <div className="p-5" style={{ borderBottom: '1px solid rgba(72,72,96,0.2)' }}>
          <h1 className="font-display font-bold text-lg gradient-text">AI Predictions</h1>
          <p className="text-gray-500 text-xs mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`
              }
              style={({ isActive }) => ({ background: isActive ? 'rgba(51,51,72,0.5)' : 'transparent' })}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('text-white')) e.currentTarget.style.background = 'rgba(51,51,72,0.3)'; }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('text-white')) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid rgba(72,72,96,0.2)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <div
          className="lg:hidden sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(72,72,96,0.2)' }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,51,72,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-bold text-sm gradient-text">AI Predictions</span>
        </div>

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
