import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { addCartItem } from '../utils/cartActions';
import { loadWishlistCache, saveWishlistCache } from '../utils/wishlistCache';
import { useToast } from '../components/Toast';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCachedWishlist, setUsingCachedWishlist] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const fetchWishlist = async () => {
    try {
      const storedWishlist = loadWishlistCache(user.id);
      setWishlist(storedWishlist);
      setUsingCachedWishlist(isDemoMode || !navigator.onLine);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId, silent = false) => {
    if (!user) return;

    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    saveWishlistCache(user.id, updatedWishlist);
    if (!silent) {
      showToast('Removed from wishlist.', 'info');
    }
  };

  const addToCart = async (product) => {
    if (!user) return;

    try {
      const result = await addCartItem({
        userId: user.id,
        product,
        quantity: 1,
        allowNetwork: !isDemoMode,
      });

      if (result.pending || result.queued) {
        showToast(
          isDemoMode
            ? 'Added to cart in demo mode. It will sync when you leave demo mode.'
            : 'Added to cart. It will sync when you are back online.',
          'info'
        );
      } else {
        showToast('Added to cart!', 'success');
      }

      removeFromWishlist(product.id, true);
      showToast('Moved to cart and removed from wishlist.', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="wishlist-container">
        <div className="login-prompt">
          <h2>Please log in to view your wishlist</h2>
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist</p>
        {usingCachedWishlist && (
          <p className="offline-note">
            {isDemoMode
              ? 'Demo mode is on. Your wishlist is being served from saved data.'
              : 'You are viewing a saved wishlist because the network is unavailable.'}
          </p>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-content">
            <h2>Your wishlist is empty</h2>
            <p>Start adding items you love to your wishlist!</p>
            <Link to="/products" className="shop-btn">Browse Products</Link>
          </div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product.id} className="wishlist-item">
              <div className="product-image">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">KES {product.price}</p>
                <div className="product-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
