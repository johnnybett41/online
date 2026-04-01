import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { saveCartCache } from '../utils/cartCache';
import { flushQueuedCartActions } from '../utils/cartQueue';

const CartQueueSync = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const syncingRef = useRef(false);

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

  useEffect(() => {
    if (!user?.id || !isOnline || isDemoMode || syncingRef.current) {
      return;
    }

    let cancelled = false;

    const syncQueuedCart = async () => {
      syncingRef.current = true;

      try {
        const result = await flushQueuedCartActions(user.id);

        if (!cancelled && result.flushed > 0) {
          const res = await axios.get('/cart');
          saveCartCache(user.id, res.data);
        }
      } catch (error) {
        console.error('Unable to sync queued cart actions:', error);
      } finally {
        syncingRef.current = false;
      }
    };

    syncQueuedCart();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, isOnline, user?.id]);

  return null;
};

export default CartQueueSync;
