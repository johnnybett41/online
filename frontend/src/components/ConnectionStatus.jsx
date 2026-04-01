import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  if (isOnline) {
    return null;
  }

  return (
    <div className="connection-banner" role="status" aria-live="polite">
      <WifiOff size={16} />
      <span>You&apos;re offline. You can still browse saved pages and cached catalog data.</span>
    </div>
  );
};

export default ConnectionStatus;
