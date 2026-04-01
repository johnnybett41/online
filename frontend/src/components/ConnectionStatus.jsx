import { useEffect, useState } from 'react';
import { Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemoMode();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showOffline = !isOnline;
  const actionLabel = isDemoMode ? 'Exit demo mode' : 'Enable demo mode';
  const handleAction = isDemoMode ? disableDemoMode : enableDemoMode;

  return (
    <div
      className={`connection-banner ${showOffline ? 'connection-banner--offline' : 'connection-banner--live'} ${
        isDemoMode ? 'connection-banner--demo' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      {showOffline ? <WifiOff size={16} /> : isDemoMode ? <Sparkles size={16} /> : <Wifi size={16} />}
      <span className="connection-banner__message">
        {showOffline
          ? isDemoMode
            ? 'You are offline and demo mode is on. Cached browsing stays available.'
            : 'You are offline. Turn on demo mode to keep browsing cached pages.'
          : isDemoMode
          ? 'Demo mode is on. Browsing uses saved content only, and cart actions will sync when you leave demo mode.'
          : 'Live mode is on. Turn on demo mode to browse saved content without network calls.'}
      </span>
      <button type="button" className="connection-banner__action" onClick={handleAction}>
        {actionLabel}
      </button>
    </div>
  );
};

export default ConnectionStatus;
