import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShoppingCart,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import './PurchaseFlow.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { user } = useAuth();

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
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const updateQuantity = async (id, quantity) => {
    const nextQuantity = Math.max(1, quantity);
    setUpdatingId(id);

    try {
      await axios.put(`/cart/${id}`, { quantity: nextQuantity });
      setCartItems((current) =>
        current.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item))
      );
    } catch (error) {
      alert('Failed to update cart');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id) => {
    setUpdatingId(id);

    try {
      await axios.delete(`/cart/${id}`);
      setCartItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) {
    return (
      <div className="purchase-shell">
        <div className="purchase-empty-state">
          <ShoppingCart size={44} />
          <h2>Please sign in to view your cart</h2>
          <p>Once you log in, your selected items will appear here with a cleaner checkout flow.</p>
          <div className="empty-actions">
            <Link to="/login" className="purchase-button primary">
              Go to Login <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="purchase-button secondary">
              Continue Shopping
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
          <p className="purchase-kicker">Shopping cart</p>
          <h1>Review your items before checkout.</h1>
          <p>
            Adjust quantities, remove items, and continue to payment with a more polished flow.
          </p>
        </div>
        <div className="purchase-hero__badges">
          <span><ShieldCheck size={16} /> Secure checkout</span>
          <span><Truck size={16} /> Fast delivery</span>
          <span><ShoppingBag size={16} /> {cartItems.length} items</span>
        </div>
      </section>

      {loading ? (
        <div className="purchase-loading">Loading your cart...</div>
      ) : cartItems.length === 0 ? (
        <div className="purchase-empty-state purchase-card">
          <ShoppingCart size={44} />
          <h2>Your cart is empty</h2>
          <p>Browse the catalog and add products to get started.</p>
          <div className="empty-actions">
            <Link to="/products" className="purchase-button primary">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="purchase-layout">
          <div className="purchase-card cart-list-card">
            <div className="card-heading">
              <h2>Cart items</h2>
              <p>Prices are shown in KES and update live as you adjust quantities.</p>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item__details">
                    <p className="item-category">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p className="item-price">KES {item.price}</p>
                  </div>

                  <div className="cart-item__controls">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeItem(item.id)}
                      disabled={updatingId === item.id}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="purchase-card summary-card">
            <div className="card-heading">
              <h2>Order summary</h2>
              <p>Everything is ready when you are.</p>
            </div>

            <div className="summary-metrics">
              <div>
                <span>Items</span>
                <strong>{cartItems.length}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>KES {total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="summary-line">
              <span>Delivery estimate</span>
              <strong>Calculated at checkout</strong>
            </div>

            <div className="summary-line">
              <span>Protection</span>
              <strong>Secure payment flow</strong>
            </div>

            <Link to="/checkout" className="purchase-button primary full-width">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
