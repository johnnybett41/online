import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Skeleton, { SkeletonLine } from '../components/Skeleton';
import DeliveryCheckout from '../components/DeliveryCheckout';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LayoutList,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import './PurchaseFlow.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/cart');
        setCartItems(res.data);
      } catch (error) {
        console.error('Failed to load checkout cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleDeliveryCheckout = async (deliveryData) => {
    setSubmitting(true);
    try {
      const res = await axios.post('/orders/delivery/checkout', deliveryData);
      setLastOrderId(res.data.orderId);
      setPaymentStatus({
        status: res.data.status,
        message: res.data.payment_method === 'mpesa' 
          ? 'Order created! Preparing M-Pesa payment...'
          : 'Order confirmed! We will contact you to confirm delivery.',
        delivery: deliveryData,
        paymentMethod: res.data.payment_method,
        deliveryCost: res.data.delivery_cost,
        estimatedDeliveryDate: res.data.estimated_delivery_date,
        deliveryCounty: res.data.delivery_county,
        deliveryTown: res.data.delivery_town,
        deliveryPostalCode: res.data.delivery_postal_code,
      });
      showToast('Your order was placed successfully.', 'success');

      // If cash on delivery, redirect to orders after 2 seconds
      if (res.data.payment_method === 'cash_on_delivery') {
        setTimeout(() => navigate(`/orders?order=${res.data.orderId}`), 2500);
      } else {
        // If M-Pesa, stay on this page for payment confirmation
        setTimeout(() => navigate(`/orders?order=${res.data.orderId}`), 3500);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="purchase-shell">
        <div className="purchase-empty-state purchase-card purchase-empty-state--hero">
          <div className="empty-state-icon">
            <Lock size={44} />
          </div>
          <h2>Please sign in to checkout</h2>
          <p>Secure checkout and M-Pesa payment are available once you're logged in.</p>
          <div className="empty-state-badges">
            <span><CreditCard size={14} /> M-Pesa ready</span>
            <span><Lock size={14} /> Secure payment</span>
            <span><CheckCircle2 size={14} /> Fast order review</span>
          </div>
          <div className="empty-actions">
            <Link to="/login" className="purchase-button primary">
              Go to Login <ArrowRight size={16} />
            </Link>
            <Link to="/cart" className="purchase-button secondary">
              Return to Cart
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
          <p className="purchase-kicker">Checkout</p>
          <h1>Confirm your order and finish with M-Pesa.</h1>
          <p>
            A cleaner, step-by-step checkout designed to feel fast and trustworthy.
          </p>
        </div>
        <div className="purchase-hero__badges">
          <span><CreditCard size={16} /> M-Pesa ready</span>
          <span><Lock size={16} /> Secure payment</span>
          <span><ShoppingBag size={16} /> {cartItems.length} items</span>
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
                <SkeletonLine className="checkout-loading-line" />
                <SkeletonLine className="checkout-loading-line" />
                <SkeletonLine className="checkout-loading-line short" />
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
      ) : cartItems.length === 0 ? (
        <div className="purchase-empty-state purchase-card purchase-empty-state--hero">
          <div className="empty-state-icon">
            <LayoutList size={44} />
          </div>
          <h2>No items in checkout</h2>
          <p>Add products to your cart before checking out.</p>
          <div className="empty-state-badges">
            <span><ShoppingBag size={14} /> Browse products</span>
            <span><CreditCard size={14} /> Pay securely</span>
            <span><CheckCircle2 size={14} /> Review before payment</span>
          </div>
          <div className="empty-actions">
            <Link to="/products" className="purchase-button primary">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="purchase-layout checkout-layout">
          <div className="purchase-card checkout-main-card">
            <div className="card-heading">
              <h2>Order summary</h2>
              <p>Review the items that will be included in your order.</p>
            </div>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div>
                    <p className="item-category">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p className="checkout-meta">Qty {item.quantity}</p>
                  </div>
                  <strong>KES {(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="purchase-card summary-card">
            <div className="card-heading">
              <h2>Delivery & Payment</h2>
              <p>Complete your order with delivery and payment options.</p>
            </div>

            <DeliveryCheckout 
              cartTotal={total}
              loading={submitting}
              userId={user?.id}
              onSubmit={handleDeliveryCheckout}
            />

            {paymentStatus && (
              <div className="status-banner status-banner--success" style={{ marginTop: '20px' }}>
                <div className="status-banner__header">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>{paymentStatus.message}</strong>
                    <p>Delivery and payment details are saved on your order now.</p>
                  </div>
                </div>

                <div className="status-banner__grid">
                  <div>
                    <span>Delivery</span>
                    <strong>{paymentStatus.delivery?.delivery_method || 'standard'}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>{paymentStatus.paymentMethod || 'mpesa'}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{paymentStatus.delivery?.phone_number || 'n/a'}</strong>
                  </div>
                  <div>
                    <span>ETA</span>
                    <strong>
                      {paymentStatus.estimatedDeliveryDate
                        ? new Date(paymentStatus.estimatedDeliveryDate).toLocaleDateString()
                        : 'n/a'}
                    </strong>
                  </div>
                </div>

                <div className="status-banner__details">
                  <p>
                    <span>Address:</span> {paymentStatus.delivery?.delivery_address || 'n/a'}
                  </p>
                  {paymentStatus.deliveryCounty && (
                    <p>
                      <span>County:</span> {paymentStatus.deliveryCounty}
                    </p>
                  )}
                  {paymentStatus.deliveryTown && (
                    <p>
                      <span>Town:</span> {paymentStatus.deliveryTown}
                    </p>
                  )}
                  <p>
                    <span>Delivery cost:</span> KES {Number(paymentStatus.deliveryCost || 0).toFixed(2)}
                  </p>
                </div>

                <div className="status-banner__actions">
                  {lastOrderId && (
                    <Link to={`/orders?order=${lastOrderId}`} className="purchase-button primary">
                      Track delivery
                    </Link>
                  )}
                  <Link to="/products" className="purchase-button secondary">
                    Continue shopping
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default Checkout;
