import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto"
            style={{ animation: 'toast-in 0.3s ease-out forwards' }}
          >
            <div className={`
              glass rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3
              border-l-4
              ${t.type === 'success' ? 'border-l-emerald-500' : ''}
              ${t.type === 'error' ? 'border-l-red-500' : ''}
              ${t.type === 'warning' ? 'border-l-amber-500' : ''}
              ${t.type === 'info' ? 'border-l-blue-500' : ''}
            `}>
              <span className="text-lg mt-0.5">
                {t.type === 'success' && '✅'}
                {t.type === 'error' && '❌'}
                {t.type === 'warning' && '⚠️'}
                {t.type === 'info' && 'ℹ️'}
              </span>
              <p className="text-sm text-gray-200 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            {/* Auto-dismiss progress bar */}
            <div className="h-0.5 bg-surface-400 rounded-b-xl overflow-hidden mx-1">
              <div
                className={`h-full rounded-full ${
                  t.type === 'success' ? 'bg-emerald-500' :
                  t.type === 'error' ? 'bg-red-500' :
                  t.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{
                  animation: `progress-fill ${t.duration}ms linear reverse forwards`,
                  '--progress': '100%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
