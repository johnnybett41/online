import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { addCartItem } from '../utils/cartActions';
import { loadWishlistCache, saveWishlistCache } from '../utils/wishlistCache';
import { loadCatalogCache } from '../utils/catalogCache';
import { buildRecommendations, getRecentlyViewedWithinCatalog } from '../utils/recentActivity';
import { useToast } from '../components/Toast';
import { Heart, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCachedWishlist, setUsingCachedWishlist] = useState(false);
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

      removeFromWishlist(product.id, true);
      showToast(
        result.pending || result.queued
          ? isDemoMode
            ? 'Moved to cart in demo mode and removed from wishlist.'
            : 'Moved to cart. It will sync when you are back online.'
          : 'Moved to cart and removed from wishlist.',
        result.pending || result.queued ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(error.response?.data?.message || 'Error adding to cart.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="wishlist-container">
        <div className="login-prompt">
          <div className="login-prompt__icon">
            <Heart size={36} />
          </div>
          <h2>Please log in to view your wishlist</h2>
          <p>Sign in to save products, compare them later, and move favourites to cart when you are ready.</p>
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
        <div className="empty-wishlist empty-wishlist--hero">
          <div className="empty-content">
            <div className="empty-wishlist__icon">
              <ShoppingBag size={40} />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love, compare them later, and move favourites to cart in one tap.</p>
            <div className="wishlist-badges">
              <span><ShieldCheck size={14} /> Warranty included</span>
              <span><Truck size={14} /> Fast delivery</span>
              <span><Heart size={14} /> Save your favourites</span>
            </div>
            <Link to="/products" className="shop-btn">Browse Products</Link>
          </div>
          {recommendedProducts.length > 0 && (
            <div className="wishlist-empty-shelf">
              <div className="wishlist-empty-shelf__header">
                <h3>Recommended for you</h3>
                <p>Popular picks to start your wishlist.</p>
              </div>
              <div className="wishlist-empty-shelf__grid">
                {recommendedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="wishlist-empty-shelf__card">
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
