import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { loadCatalogCache, loadCachedProductById, saveCatalogCache } from '../utils/catalogCache';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const { user } = useAuth();
  const stockCount = Number(product?.stock_quantity || 0);
  const isSoldOut = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  useEffect(() => {
    fetchProduct();
  }, [id]);

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

  const fetchProduct = async () => {
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
        setUsingCachedData(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert('Please login to add to cart');
      return;
    }

    if (!product || isSoldOut) {
      alert('This product is sold out');
      return;
    }

    if (quantity > stockCount) {
      alert(`Only ${stockCount} left in stock`);
      return;
    }

    try {
      await axios.post('/cart', {
        user_id: user.id,
        product_id: product.id,
        quantity: quantity
      });
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const addToWishlist = () => {
    if (!user) {
      alert('Please login to add to wishlist');
      return;
    }

    const wishlistKey = `wishlist_${user.id}`;
    const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    const isInWishlist = currentWishlist.some(item => item.id === product.id);

    if (isInWishlist) {
      alert('Already in wishlist!');
      return;
    }

    const updatedWishlist = [...currentWishlist, product];
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    alert('Added to wishlist!');
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

  const handleImageError = (event) => {
    event.currentTarget.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23777" font-family="Arial, sans-serif" font-size="28">Image unavailable</text></svg>';
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        {usingCachedData && <div className="offline-note">Offline mode: showing cached product data.</div>}
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
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
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.name}
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.image} alt={product.name} onError={handleImageError} decoding="async" />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <div className={`stock-banner ${isSoldOut ? 'sold-out' : isLowStock ? 'low-stock' : ''}`}>
            {isSoldOut ? 'Sold out' : `${stockCount} left in store`}
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
                <img src={relatedProduct.image} alt={relatedProduct.name} onError={handleImageError} loading="lazy" decoding="async" />
                <h4>{relatedProduct.name}</h4>
                <p>KES {relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
