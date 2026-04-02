import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Skeleton, { SkeletonLine } from '../components/Skeleton';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LayoutList,
  Lock,
  PhoneCall,
  ShoppingBag,
} from 'lucide-react';
import './PurchaseFlow.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
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

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post('/orders', { total });
      setOrderId(res.data.orderId);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || !orderId) {
      showToast('Please enter a phone number and create the order first.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/mpesa/pay', {
        phoneNumber,
        amount: total,
        orderId,
      });

      if (res.data.success) {
        setPaymentStatus('Payment initiated. Please check your phone and complete the payment.');

        const checkStatus = async () => {
          try {
            const statusRes = await axios.get(`/mpesa/status/${res.data.checkoutRequestId}`);
            if (statusRes.data.ResponseCode === '0' && statusRes.data.ResultCode === '0') {
              setPaymentStatus('Payment successful! Order confirmed.');
              setTimeout(() => navigate('/orders'), 1800);
            } else if (statusRes.data.ResponseCode === '0' && statusRes.data.ResultCode !== '0') {
              setPaymentStatus('Payment failed. Please try again.');
            }
          } catch (error) {
            // Continue polling
          }
        };

        const interval = setInterval(checkStatus, 5000);
        setTimeout(() => clearInterval(interval), 120000);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment initiation failed.', 'error');
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
              <h2>Payment details</h2>
              <p>Set up your order and pay safely with M-Pesa.</p>
            </div>

            <div className="summary-metrics">
              <div>
                <span>Order total</span>
                <strong>KES {total.toFixed(2)}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{orderId ? 'Ready to pay' : 'Create order'}</strong>
              </div>
            </div>

            {!orderId ? (
              <button type="button" className="purchase-button primary full-width" onClick={handleCreateOrder} disabled={submitting}>
                {submitting ? 'Creating Order...' : 'Create Order'}
              </button>
            ) : (
              <>
                <div className="purchase-field">
                  <PhoneCall size={18} className="purchase-field__icon" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>M-Pesa phone number</label>
                </div>

                <button type="button" className="purchase-button primary full-width" onClick={handlePayment} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Pay with M-Pesa'}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </>
            )}

            {paymentStatus && (
              <div className="status-banner">
                <CheckCircle2 size={18} />
                <span>{paymentStatus}</span>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default Checkout;
