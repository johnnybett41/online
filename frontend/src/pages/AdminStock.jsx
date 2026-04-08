import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Search, X, Package } from 'lucide-react';
import './AdminStock.css';

const AdminStock = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [draftStock, setDraftStock] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);

  useEffect(() => {
    fetchStock();
    fetchOrders();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get('/admin/stock');
      setProducts(res.data);
      setDraftStock(
        res.data.reduce((acc, product) => {
          acc[product.id] = product.stock_quantity;
          return acc;
        }, {})
      );
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to load stock data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/admin/orders');
      setOrders(res.data);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to load orders';
      setError(message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateDraft = (productId, value) => {
    setDraftStock((current) => ({
      ...current,
      [productId]: value,
    }));
  };

  const patchStock = async (productId, quantity) => {
    setSavingId(productId);
    setError('');

    try {
      const res = await axios.patch(`/admin/products/${productId}/stock`, {
        stock_quantity: Number.parseInt(quantity, 10),
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, stock_quantity: res.data.stock_quantity, stock_status: res.data.stock_quantity <= 0 ? 'sold_out' : res.data.stock_quantity <= 5 ? 'low_stock' : 'in_stock' }
            : product
        )
      );
      updateDraft(productId, res.data.stock_quantity);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const restockProduct = async (productId, amount) => {
    setSavingId(productId);
    setError('');

    try {
      const res = await axios.post(`/admin/products/${productId}/restock`, {
        quantity: amount,
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, stock_quantity: res.data.stock_quantity, stock_status: res.data.stock_quantity <= 0 ? 'sold_out' : res.data.stock_quantity <= 5 ? 'low_stock' : 'in_stock' }
            : product
        )
      );
      updateDraft(productId, res.data.stock_quantity);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to restock product');
    } finally {
      setSavingId(null);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setSavingOrderId(orderId);
    setError('');

    try {
      const res = await axios.patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: res.data.order.status } : order
        )
      );
      showToast(`Order #${orderId} marked as ${status}.`, 'success');
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to update order status';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSavingOrderId(null);
    }
  };

  const openOrderDrawer = async (orderId) => {
    setSelectedOrderLoading(true);
    setSelectedOrder(null);

    try {
      const res = await axios.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to load order details';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const needle = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle)
    );
  });

  const summary = {
    total: products.reduce((sum, product) => sum + Math.max(0, Number(product.stock_quantity || 0)), 0),
    low: products.filter((product) => Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= 5).length,
    soldOut: products.filter((product) => Number(product.stock_quantity || 0) <= 0).length,
  };

  const orderSummary = {
    total: orders.length,
    pending: orders.filter((order) => ['pending_payment', 'payment_initiated', 'pending_confirmation'].includes(order.status)).length,
    active: orders.filter((order) => ['paid', 'processing', 'shipped'].includes(order.status)).length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
  };

  const filteredOrders = orders.filter((order) => {
    const needle = orderSearch.toLowerCase().trim();
    if (!needle) {
      return true;
    }

    return (
      String(order.id).includes(needle) ||
      (order.username || '').toLowerCase().includes(needle) ||
      (order.email || '').toLowerCase().includes(needle) ||
      (order.status || '').toLowerCase().includes(needle) ||
      (order.delivery_method || '').toLowerCase().includes(needle)
    );
  });

  if (loading) {
    return (
      <div className="admin-stock-page">
        <div className="admin-stock-shell">Loading stock manager...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-stock-page">
        <div className="admin-stock-shell">
          <h1>Stock Manager</h1>
          <p>Please log in first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stock-page">
      <div className="admin-stock-shell">
        <div className="admin-stock-hero">
          <div>
            <span className="admin-kicker">Admin stock editor</span>
            <h1>Restock products from inside the app</h1>
            <p>Update quantities, add a quick restock, and keep the storefront counts accurate.</p>
          </div>
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <strong>{summary.total}</strong>
              <span>items remaining</span>
            </div>
            <div className="admin-summary-card">
              <strong>{summary.low}</strong>
              <span>low stock</span>
            </div>
            <div className="admin-summary-card">
              <strong>{summary.soldOut}</strong>
              <span>sold out</span>
            </div>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <section className="admin-orders-section">
          <div className="admin-section-header">
            <div>
              <span className="admin-kicker">Order control</span>
              <h2>Quick delivery status updates</h2>
              <p>Use these buttons to move orders through processing, shipping, and delivery.</p>
            </div>
            <div className="admin-summary-grid admin-summary-grid--orders">
              <div className="admin-summary-card">
                <strong>{orderSummary.total}</strong>
                <span>recent orders</span>
              </div>
              <div className="admin-summary-card">
                <strong>{orderSummary.pending}</strong>
                <span>pending</span>
              </div>
              <div className="admin-summary-card">
                <strong>{orderSummary.active}</strong>
                <span>active</span>
              </div>
              <div className="admin-summary-card">
                <strong>{orderSummary.delivered}</strong>
                <span>delivered</span>
              </div>
            </div>
          </div>

          {ordersLoading ? (
            <div className="admin-orders-loading">Loading orders...</div>
          ) : (
            <>
              <div className="admin-orders-toolbar">
                <label className="admin-orders-search">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search orders by customer, status, or ID"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </label>
              </div>

              <div className="admin-orders-list">
              {filteredOrders.length === 0 ? (
                <div className="admin-empty-state">No orders found.</div>
              ) : (
                filteredOrders.map((order) => (
                  <article key={order.id} className="admin-order-card">
                    <div className="admin-order-topline">
                      <div>
                        <span className={`admin-order-status status-${order.status}`}>{order.status}</span>
                        <h3>Order #{order.id}</h3>
                        <p>
                          {order.username} {order.email ? `(${order.email})` : ''}
                        </p>
                      </div>
                      <strong>KES {Number(order.total).toFixed(2)}</strong>
                    </div>

                    <div className="admin-order-meta">
                      <span>Placed: {new Date(order.created_at).toLocaleString()}</span>
                      <span>Delivery: {order.delivery_method || 'standard'}</span>
                      <span>
                        ETA:{' '}
                        {order.estimated_delivery_date
                          ? new Date(order.estimated_delivery_date).toLocaleDateString()
                          : 'n/a'}
                      </span>
                    </div>

                    <div className="admin-order-actions">
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'pending_confirmation')}
                        disabled={savingOrderId === order.id}
                      >
                        Pending confirmation
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        disabled={savingOrderId === order.id}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={savingOrderId === order.id}
                      >
                        Processing
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        disabled={savingOrderId === order.id}
                      >
                        Shipped
                      </button>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={savingOrderId === order.id}
                      >
                        {savingOrderId === order.id ? 'Saving...' : 'Delivered'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openOrderDrawer(order.id)}
                        disabled={selectedOrderLoading}
                      >
                        View details
                      </button>
                    </div>
                  </article>
                ))
              )}
              </div>
            </>
          )}
        </section>

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Search by product or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-stock-list">
          {filteredProducts.map((product) => {
            const stockValue = Number(draftStock[product.id] ?? product.stock_quantity ?? 0);
            const statusClass = stockValue <= 0 ? 'sold-out' : stockValue <= 5 ? 'low-stock' : 'in-stock';

            return (
              <article key={product.id} className="admin-stock-card">
                <img src={product.image} alt={product.name} />
                <div className="admin-stock-copy">
                  <div className="admin-stock-topline">
                    <div>
                      <span className={`admin-status ${statusClass}`}>{product.stock_status}</span>
                      <h3>{product.name}</h3>
                      <p>{product.category}</p>
                    </div>
                    <strong>KES {product.price}</strong>
                  </div>

                  <div className="admin-stock-actions">
                    <label>
                      Set stock
                      <input
                        type="number"
                        min="0"
                        value={stockValue}
                        onChange={(e) => updateDraft(product.id, e.target.value)}
                      />
                    </label>
                    <div className="admin-action-row">
                      <button type="button" onClick={() => restockProduct(product.id, 5)} disabled={savingId === product.id}>
                        +5
                      </button>
                      <button type="button" onClick={() => restockProduct(product.id, 10)} disabled={savingId === product.id}>
                        +10
                      </button>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => patchStock(product.id, stockValue)}
                        disabled={savingId === product.id}
                      >
                        {savingId === product.id ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {selectedOrder && (
          <div className="admin-drawer-backdrop" onClick={() => setSelectedOrder(null)}>
            <aside className="admin-order-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="admin-order-drawer__header">
                <div>
                  <span className="admin-kicker">Order details</span>
                  <h2>Order #{selectedOrder.id}</h2>
                  <p>
                    {selectedOrder.username} {selectedOrder.email ? `(${selectedOrder.email})` : ''}
                  </p>
                </div>
                <button type="button" className="admin-drawer-close" onClick={() => setSelectedOrder(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="admin-order-drawer__grid">
                <div>
                  <span>Status</span>
                  <strong className={`admin-order-status status-${selectedOrder.status}`}>{selectedOrder.status}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>KES {Number(selectedOrder.total).toFixed(2)}</strong>
                </div>
                <div>
                  <span>Payment</span>
                  <strong>{selectedOrder.payment_method || 'mpesa'}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{selectedOrder.delivery_method || 'standard'}</strong>
                </div>
              </div>

              <div className="admin-order-drawer__section">
                <h3>
                  <Package size={16} /> Items
                </h3>
                <div className="admin-order-items">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={`${item.product_id}-${item.name}`} className="admin-order-item">
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.category}</p>
                      </div>
                      <span>
                        {item.quantity} x KES {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-order-drawer__section">
                <h3>Delivery</h3>
                <p>{selectedOrder.delivery_address || 'No delivery address saved'}</p>
                <p>Phone: {selectedOrder.phone_number || 'n/a'}</p>
                <p>
                  ETA:{' '}
                  {selectedOrder.estimated_delivery_date
                    ? new Date(selectedOrder.estimated_delivery_date).toLocaleDateString()
                    : 'n/a'}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStock;
