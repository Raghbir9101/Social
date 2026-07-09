import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CampaignPage from './pages/CampaignPage';
import QuestionPage from './pages/QuestionPage';

// Lazy-loaded admin pages for code splitting
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminVisitors = lazy(() => import('./pages/AdminVisitors'));
const AdminSubmissions = lazy(() => import('./pages/AdminSubmissions'));
const AdminCampaigns = lazy(() => import('./pages/AdminCampaigns'));
const AdminQuestions = lazy(() => import('./pages/AdminQuestions'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-t-pink-500 border-r-purple-500 border-b-cyan-500 border-l-transparent animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Anonymous Q&A public form */}
              <Route path="/q/:boxId" element={<QuestionPage />} />

              {/* Campaign routes */}
              <Route path="/:campaignId" element={<CampaignPage />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/visitors" element={<ProtectedRoute><AdminVisitors /></ProtectedRoute>} />
              <Route path="/admin/submissions" element={<ProtectedRoute><AdminSubmissions /></ProtectedRoute>} />
              <Route path="/admin/campaigns" element={<ProtectedRoute><AdminCampaigns /></ProtectedRoute>} />
              <Route path="/admin/questions" element={<ProtectedRoute><AdminQuestions /></ProtectedRoute>} />

              {/* Default redirect to love-compatibility campaign */}
              <Route path="/" element={<Navigate to="/love-compatibility" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
