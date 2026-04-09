import { useEffect, useRef, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const timersRef = useRef(new Map());

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    if (duration > 0) {
      const timerId = window.setTimeout(() => removeNotification(id), duration);
      timersRef.current.set(id, timerId);
    }
  };

  const removeNotification = (id) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }

    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }

      return prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n));
    });
  };

  const clearAll = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Store notifications in context for global access + listen to custom events
  useEffect(() => {
    window.addNotification = addNotification;

    const listener = (event) => {
      if (!event?.detail?.message) return;
      addNotification(event.detail.message, event.detail.type || 'info');
    };

    window.addEventListener('app:notify', listener);
    return () => {
      window.removeEventListener('app:notify', listener);
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <>
      <button
        type="button"
        className={`nav-icon-link notification-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        <Bell size={24} />
        <span className="icon-label">Alerts</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div id="notification-panel" className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notification">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item notification-${notif.type} ${
                    !notif.read ? 'unread' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notification-icon">{getIcon(notif.type)}</div>
                  <div className="notification-content">
                    <p>{notif.message}</p>
                    <small>{new Date(notif.timestamp).toLocaleTimeString()}</small>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    className="remove-notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button className="clear-all-btn" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
