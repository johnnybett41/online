import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { loadOrderCache, saveOrderCache } from '../utils/orderCache';
import { loadCatalogCache } from '../utils/catalogCache';
import { buildRecommendations, getRecentlyViewedWithinCatalog } from '../utils/recentActivity';
import { Archive, ArrowRight, FileText, Package, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import Skeleton, { SkeletonLine } from '../components/Skeleton';
import DeliveryTracking from '../components/DeliveryTracking';
import { useToast } from '../components/Toast';
import './PurchaseFlow.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCachedOrders, setUsingCachedOrders] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const selectedOrderId = searchParams.get('order');
  const showArchivedOrders = searchParams.get('archived') === '1';
  const catalog = useMemo(() => loadCatalogCache(), []);
  const recommendedProducts = useMemo(
    () =>
      buildRecommendations({
        catalog,
        recentlyViewed: getRecentlyViewedWithinCatalog(catalog, 4),
        limit: 4,
      }),
    [catalog]
  );

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (isDemoMode) {
        const cachedOrders = loadOrderCache(user.id);
        setOrders(cachedOrders);
        setUsingCachedOrders(true);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/orders');
        setOrders(res.data);
        saveOrderCache(user.id, res.data);
        setUsingCachedOrders(false);
      } catch (error) {
        console.error('Failed to load orders:', error);
        const cachedOrders = loadOrderCache(user.id);
        setOrders(cachedOrders);
        setUsingCachedOrders(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isDemoMode]);

  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    const timerId = window.setTimeout(() => {
      document.getElementById(`order-${selectedOrderId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [selectedOrderId, orders.length]);

  const visibleOrders = useMemo(
    () => orders.filter((order) => (showArchivedOrders ? Boolean(order.archived_at) : !order.archived_at)),
    [orders, showArchivedOrders]
  );

  const archivedOrdersCount = useMemo(
    () => orders.filter((order) => Boolean(order.archived_at)).length,
    [orders]
  );

  const activeOrdersCount = orders.length - archivedOrdersCount;

  const updateOrderStatusInState = (orderId, updater) => {
    setOrders((currentOrders) => {
      const nextOrders = currentOrders.map((item) =>
        String(item.id) === String(orderId) ? updater(item) : item
      );

      if (user?.id) {
        saveOrderCache(user.id, nextOrders);
      }

      return nextOrders;
    });
  };

  const clearSelectedOrder = (orderId) => {
    if (String(selectedOrderId) !== String(orderId)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('order');
    setSearchParams(nextParams, { replace: true });
  };

  const handleArchiveToggle = async (order) => {
    if (!order?.id) {
      return;
    }

    const confirmed = window.confirm(
      order.archived_at
        ? 'Restore this purchase back into your active order history?'
        : 'Archive this purchase so it is hidden from your main order history?'
    );

    if (!confirmed) {
      return;
    }

    const orderId = order.id;
    setDeletingOrderId(orderId);
    const isArchived = Boolean(order.archived_at);

    try {
      if (isDemoMode || !navigator.onLine) {
        updateOrderStatusInState(orderId, (item) => ({
          ...item,
          archived_at: isArchived ? null : new Date().toISOString(),
        }));
        showToast(
          isArchived ? 'Purchase restored.' : 'Purchase archived.',
          'info'
        );
      } else {
        const endpoint = isArchived ? 'restore' : 'archive';
        const response = await axios.patch(`/orders/${orderId}/${endpoint}`);
        updateOrderStatusInState(orderId, (item) => ({
          ...item,
          archived_at: response.data?.archivedAt || (isArchived ? null : new Date().toISOString()),
        }));
        showToast(
          isArchived ? 'Purchase restored.' : 'Purchase archived.',
          'success'
        );
      }

      clearSelectedOrder(orderId);
    } catch (error) {
      console.error('Failed to update order archive state:', error);
      showToast(error.response?.data?.message || 'Failed to update purchase.', 'error');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const toggleArchivedView = () => {
    const nextParams = new URLSearchParams(searchParams);

    if (showArchivedOrders) {
      nextParams.delete('archived');
    } else {
      nextParams.set('archived', '1');
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (!user) {
    return (
      <div className="purchase-shell">
        <div className="purchase-empty-state purchase-card purchase-empty-state--hero">
          <div className="empty-state-icon">
            <FileText size={44} />
          </div>
          <h2>Please sign in to view your orders</h2>
          <p>Your order history and payment status will appear here after login.</p>
          <div className="empty-state-badges">
            <span><ShieldCheck size={14} /> Secure records</span>
            <span><Package size={14} /> Purchase history</span>
            <span><ShoppingBag size={14} /> Smart re-ordering</span>
          </div>
          <div className="empty-actions">
            <Link to="/login" className="purchase-button primary">
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-shell">
      <section className="purchase-hero">
        <div>
          <p className="purchase-kicker">Order history</p>
          <h1>Track your purchases in one clean view.</h1>
          <p>
            Keep an eye on payment status, total spend, and recent orders without the clutter.
          </p>
          {usingCachedOrders && (
            <p className="offline-note">
              {isDemoMode
                ? 'Demo mode is on. Your order history is being shown from saved data only.'
                : 'You are seeing saved order history because the network is unavailable.'}
            </p>
          )}
        </div>
        <div className="purchase-hero__badges">
          <span><ShieldCheck size={16} /> Secure records</span>
          <span><Package size={16} /> {activeOrdersCount} active</span>
          <span><ShoppingBag size={16} /> {archivedOrdersCount} archived</span>
        </div>
        <div className="orders-hero-actions">
          <button
            type="button"
            className="purchase-button secondary"
            onClick={toggleArchivedView}
          >
            {showArchivedOrders ? 'View active orders' : 'View archived orders'}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="purchase-loading purchase-card purchase-loading--skeleton">
          <div className="checkout-loading-grid">
            <div className="checkout-loading-panel">
              <SkeletonLine className="loading-kicker" />
              <Skeleton className="loading-title" />
              <SkeletonLine className="loading-text" />
              <div className="checkout-loading-list">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLine key={index} className="checkout-loading-line" />
                ))}
              </div>
            </div>
            <div className="checkout-loading-panel">
              <SkeletonLine className="loading-kicker" />
              <Skeleton className="loading-title loading-title--small" />
              <div className="checkout-loading-metrics">
                <Skeleton className="checkout-loading-metric" />
                <Skeleton className="checkout-loading-metric" />
              </div>
              <Skeleton className="checkout-loading-button" />
            </div>
          </div>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="purchase-empty-state purchase-card purchase-empty-state--hero">
          <div className="empty-state-icon">
            <Package size={44} />
          </div>
          <h2>{showArchivedOrders ? 'No archived orders yet' : 'No active orders yet'}</h2>
          <p>
            {showArchivedOrders
              ? 'Archived purchases will appear here when you hide them from your active order history.'
              : 'When you complete a checkout, your active orders will show up here with live tracking and delivery milestones.'}
          </p>
          <div className="empty-state-badges">
            <span><ShieldCheck size={14} /> Secure records</span>
            <span><ShoppingBag size={14} /> Start shopping</span>
            <span><FileText size={14} /> Track status easily</span>
          </div>
          <div className="empty-actions">
            <Link to="/products" className="purchase-button primary">
              Browse Products <ArrowRight size={16} />
            </Link>
            <button type="button" className="purchase-button secondary" onClick={toggleArchivedView}>
              {showArchivedOrders ? 'Back to active orders' : 'View archived orders'}
            </button>
          </div>
          {!showArchivedOrders && recommendedProducts.length > 0 && (
            <div className="orders-empty-shelf">
              <div className="orders-empty-shelf__header">
                <h3>Recommended products</h3>
                <p>Start with something that fits your browsing history.</p>
              </div>
              <div className="orders-empty-shelf__grid">
                {recommendedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="orders-empty-shelf__card">
                    <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                    <div>
                      <strong>{product.name}</strong>
                      <span>KES {product.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {visibleOrders.map((order) => {
            const isArchived = Boolean(order.archived_at);
            const statusLabel =
              isArchived
                ? 'Archived'
                : order.status === 'pending_payment'
                ? 'Payment pending'
                : order.status === 'paid'
                ? 'Paid'
                : order.status;

            const isSelected = selectedOrderId && String(order.id) === String(selectedOrderId);

            return (
              <article
                key={order.id}
                id={`order-${order.id}`}
                className={`purchase-card order-card ${isSelected ? 'order-card--highlight' : ''}`}
              >
                <div className="order-card__top">
                  <div>
                    <p className="item-category">Order #{order.id}</p>
                    <h2>KES {Number(order.total).toFixed(2)}</h2>
                  </div>
                  <span className={`status-pill ${isArchived ? 'status-archived' : `status-${order.status}`}`}>{statusLabel}</span>
                </div>

                <div className="order-card__meta">
                  <div>
                    <span>Placed on</span>
                    <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>Reference</span>
                    <strong>{order.id}</strong>
                  </div>
                </div>

                <div className="order-card__meta order-card__meta--details">
                  <div>
                    <span>Delivery</span>
                    <strong>{order.delivery_method || 'standard'}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>{order.payment_method || 'mpesa'}</strong>
                  </div>
                  {order.estimated_delivery_date && (
                    <div>
                      <span>ETA</span>
                      <strong>{new Date(order.estimated_delivery_date).toLocaleDateString()}</strong>
                    </div>
                  )}
                </div>

                {order.delivery_address && (
                  <div className="order-card__tracking">
                    <DeliveryTracking order={order} />
                  </div>
                )}

                <div className="order-card__footer">
                  <span>Ready for review in your purchase timeline</span>
                  <div className="order-card__actions">
                    <button
                      type="button"
                      className="inline-link inline-link--danger"
                      onClick={() => handleArchiveToggle(order)}
                      disabled={deletingOrderId === order.id}
                    >
                      {isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
                      {deletingOrderId === order.id
                        ? 'Saving...'
                        : isArchived
                        ? 'Restore purchase'
                        : 'Archive purchase'}
                    </button>
                    <Link to={`/orders?order=${order.id}#order-${order.id}`} className="inline-link">
                      Track delivery <ArrowRight size={16} />
                    </Link>
                    <Link to="/products" className="inline-link">
                      Shop again <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
