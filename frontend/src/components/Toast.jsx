import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message, type } }));
    }

    setToast({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const Icon = toast ? TOAST_ICONS[toast.type] || Info : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && typeof document !== 'undefined'
        ? createPortal(
            <div className={`app-toast ${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live="polite">
              <div className="app-toast__icon" aria-hidden="true">
                {Icon ? <Icon size={18} /> : null}
              </div>
              <p className="app-toast__message">{toast.message}</p>
              <button
                type="button"
                className="app-toast__close"
                onClick={() => setToast(null)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
};
