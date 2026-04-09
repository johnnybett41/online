import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { Heart, ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';
import { loadCatalogCache, loadCachedProductById, saveCatalogCache } from '../utils/catalogCache';
import { addCartItem } from '../utils/cartActions';
import { loadWishlistCache, saveWishlistCache } from '../utils/wishlistCache';
import { useToast } from '../components/Toast';
import OptimizedImage from '../components/OptimizedImage';
import {
  buildRecommendations,
  getRecentlyViewedWithinCatalog,
  saveRecentlyViewed,
} from '../utils/recentActivity';
import Skeleton, { SkeletonLine } from '../components/Skeleton';
import './ProductDetail.css';

const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23777" font-family="Arial, sans-serif" font-size="28">Image unavailable</text></svg>';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const stockCount = Number(product?.stock_quantity || 0);
  const isSoldOut = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const trustBadges = [
    { icon: <ShieldCheck size={16} />, label: 'Warranty included' },
    { icon: <Truck size={16} />, label: 'Fast delivery' },
    { icon: <BadgeCheck size={16} />, label: 'Safe electrical products' },
  ];

  useEffect(() => {
    fetchProduct();
  }, [id, isDemoMode]);

  useEffect(() => {
    if (!product) {
      return;
    }

    if (stockCount <= 0) {
      setQuantity(0);
      return;
    }

    setQuantity((currentQuantity) => Math.min(Math.max(currentQuantity, 1), stockCount));
  }, [product, stockCount]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setActiveImage(product.image || '');
    saveRecentlyViewed(product);
  }, [product]);

  const fetchProduct = async () => {
    if (isDemoMode) {
      const cachedProduct = loadCachedProductById(id);
      const cachedProducts = loadCatalogCache();

      if (cachedProduct) {
        setProduct(cachedProduct);
        setRelatedProducts(
          cachedProducts
            .filter((p) => p.category === cachedProduct.category && p.id !== cachedProduct.id)
            .slice(0, 4)
        );
      }

      setUsingCachedData(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/products/${id}`);
      setProduct(res.data);

      const allProductsRes = await axios.get('/products');
      const related = allProductsRes.data
        .filter(p => p.category === res.data.category && p.id !== res.data.id)
        .slice(0, 4);
      setRelatedProducts(related);
      saveCatalogCache(allProductsRes.data);
      setUsingCachedData(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      const cachedProduct = loadCachedProductById(id);
      const cachedProducts = loadCatalogCache();

      if (cachedProduct) {
        setProduct(cachedProduct);
        setRelatedProducts(
          cachedProducts
            .filter((p) => p.category === cachedProduct.category && p.id !== cachedProduct.id)
            .slice(0, 4)
        );
      }
      setUsingCachedData(true);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      showToast('Please login to add to cart.', 'info');
      return;
    }

    if (!product || isSoldOut) {
      showToast('This product is sold out.', 'error');
      return;
    }

    if (quantity > stockCount) {
      showToast(`Only ${stockCount} left in stock.`, 'info');
      return;
    }

    try {
      const result = await addCartItem({
        userId: user.id,
        product,
        quantity,
        allowNetwork: !isDemoMode,
      });

      if (result.pending || result.queued) {
        showToast(
          isDemoMode
            ? 'Added to cart in demo mode. It will sync when you leave demo mode.'
            : 'Added to cart. It will sync when you are back online.',
          'info'
        );
        return;
      }

      showToast('Added to cart!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add to cart.', 'error');
    }
  };

  const addToWishlist = () => {
    if (!user) {
      showToast('Please login to add to wishlist.', 'info');
      return;
    }

    const currentWishlist = loadWishlistCache(user.id);
    const isInWishlist = currentWishlist.some(item => item.id === product.id);

    if (isInWishlist) {
      showToast('Already in wishlist!', 'info');
      return;
    }

    const updatedWishlist = [...currentWishlist, product];
    saveWishlistCache(user.id, updatedWishlist);
    showToast('Added to wishlist!', 'success');
  };

  const updateQuantity = (change) => {
    if (isSoldOut) {
      return;
    }

    setQuantity((prev) => {
      const nextQuantity = prev + change;
      return Math.min(Math.max(1, nextQuantity), stockCount);
    });
  };

  const catalog = useMemo(() => loadCatalogCache(), [product?.id, relatedProducts.length, usingCachedData]);
  const recentlyViewedProducts = useMemo(
    () => getRecentlyViewedWithinCatalog(catalog, 4),
    [catalog, product?.id]
  );
  const recommendedProducts = useMemo(
    () =>
      buildRecommendations({
        catalog,
        currentProduct: product,
        recentlyViewed: recentlyViewedProducts,
        limit: 6,
      }),
    [catalog, product, recentlyViewedProducts]
  );
  const galleryImages = useMemo(() => {
    const images = [
      { src: product?.image, label: product?.name || 'Main product' },
      ...relatedProducts.slice(0, 3).map((item, index) => ({
        src: item.image,
        label: item.name || `Related item ${index + 1}`,
      })),
    ].filter((entry) => Boolean(entry.src));

    return images;
  }, [product, relatedProducts]);

  if (loading) {
    return (
      <div className="product-detail-container product-detail-loading">
        {usingCachedData && (
          <div className="offline-note">
            {isDemoMode
              ? 'Demo mode is on. Showing cached product data only.'
              : 'Offline mode: showing cached product data.'}
          </div>
        )}
        <div className="breadcrumb-skeleton-row">
          <SkeletonLine className="breadcrumb-skeleton" />
        </div>
        <div className="product-detail">
          <div className="product-gallery">
            <Skeleton className="main-image skeleton-product-image" />
          </div>
          <div className="product-info">
            <SkeletonLine className="detail-loading-kicker" />
            <Skeleton className="detail-loading-title" />
            <SkeletonLine className="detail-loading-chip" />
            <div className="product-rating">
              <SkeletonLine className="detail-loading-rating" />
            </div>
            <Skeleton className="detail-loading-price" />
            <div className="product-trust-badges">
              {trustBadges.map((badge) => (
                <Skeleton key={badge.label} className="detail-loading-badge" />
              ))}
            </div>
            <Skeleton className="detail-loading-copy" />
            <Skeleton className="detail-loading-copy" />
            <Skeleton className="detail-loading-copy short" />
            <div className="product-actions">
              <Skeleton className="detail-loading-quantity" />
              <Skeleton className="detail-loading-action" />
              <Skeleton className="detail-loading-action" />
            </div>
            <Skeleton className="detail-loading-features" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        {usingCachedData && (
          <div className="offline-note">
            {isDemoMode
              ? 'Demo mode is on. This product was not found in saved data.'
              : 'Offline mode: this product was not found in saved data.'}
          </div>
        )}
        <div className="error">Product not found</div>
        <Link to="/products" className="back-btn">
          <ArrowLeft size={20} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {usingCachedData && (
        <div className="offline-note">
          {isDemoMode
            ? 'Demo mode is on. Showing cached product data only.'
            : 'Offline mode: showing cached product data.'}
        </div>
      )}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.name}
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-image">
            <OptimizedImage src={activeImage || product.image} alt={product.name} fallbackSrc={FALLBACK_PRODUCT_IMAGE} priority />
          </div>
          {galleryImages.length > 1 && (
            <div className="product-gallery__thumbs" aria-label="Product image gallery">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  className={`product-gallery__thumb ${activeImage === image.src ? 'active' : ''}`}
                  onClick={() => setActiveImage(image.src)}
                >
                  <OptimizedImage src={image.src} alt={image.label} fallbackSrc={FALLBACK_PRODUCT_IMAGE} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <div className={`stock-banner ${isSoldOut ? 'sold-out' : isLowStock ? 'low-stock' : ''}`}>
            {isSoldOut ? 'Sold out' : `${stockCount} left in store`}
          </div>

          <div className="product-trust-badges">
            {trustBadges.map((badge) => (
              <span key={badge.label} className="product-trust-badge">
                {badge.icon}
                {badge.label}
              </span>
            ))}
          </div>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#ffd700" color="#ffd700" />
              ))}
            </div>
            <span>4.5 out of 5 | 120 reviews</span>
          </div>

          <div className="product-price">
            <span className="current-price">KES {product.price}</span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={() => updateQuantity(-1)} disabled={isSoldOut || quantity <= 1}>-</button>
              <span>{isSoldOut ? 0 : quantity}</span>
              <button onClick={() => updateQuantity(1)} disabled={isSoldOut || quantity >= stockCount}>+</button>
            </div>

            <button className="add-to-cart-btn" onClick={addToCart} disabled={isSoldOut}>
              <ShoppingCart size={20} />
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>

            <button className="wishlist-btn" onClick={addToWishlist}>
              <Heart size={20} />
              Add to Wishlist
            </button>
          </div>

          <div className="product-features">
            <h3>Key Features</h3>
            <ul>
              <li>High-quality materials</li>
              <li>Energy efficient</li>
              <li>Easy installation</li>
              <li>2-year warranty included</li>
            </ul>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-grid">
            {relatedProducts.map(relatedProduct => (
              <Link
                key={relatedProduct.id}
                to={`/product/${relatedProduct.id}`}
                className="related-card"
              >
                <OptimizedImage
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  fallbackSrc={FALLBACK_PRODUCT_IMAGE}
                />
                <h4>{relatedProduct.name}</h4>
                <p>KES {relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendedProducts.length > 0 && (
        <div className="related-products related-products--recommendations">
          <h2>Recommended for you</h2>
          <p className="related-subtitle">
            Picks based on this product, your recent browsing, and what is in stock now.
          </p>
          <div className="related-grid">
            {recommendedProducts.map((recommendedProduct) => (
              <Link
                key={recommendedProduct.id}
                to={`/product/${recommendedProduct.id}`}
                className="related-card"
              >
                <OptimizedImage
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  fallbackSrc={FALLBACK_PRODUCT_IMAGE}
                />
                <h4>{recommendedProduct.name}</h4>
                <p>KES {recommendedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentlyViewedProducts.length > 0 && (
        <div className="recently-viewed">
          <h2>Recently viewed</h2>
          <div className="recently-viewed__chips">
            {recentlyViewedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="recently-viewed__chip">
                <span>{item.name}</span>
                <strong>KES {item.price}</strong>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
