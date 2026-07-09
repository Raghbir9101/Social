import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center">
      <div className="text-7xl mb-6" style={{ animation: 'float 3s ease-in-out infinite' }}>🔍</div>
      <h1 className="text-4xl font-display font-bold gradient-text mb-3">404</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-sm hover:scale-105 active:scale-95 transition-transform inline-block">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
