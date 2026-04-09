import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import {
  Shield,
  Truck,
  ArrowRight,
  ShoppingBag,
  Heart,
  Sparkles,
  BadgeCheck,
  Clock3,
  AlertTriangle,
} from 'lucide-react';
import { loadCatalogCache, saveCatalogCache } from '../utils/catalogCache';
import { addCartItem } from '../utils/cartActions';
import { loadWishlistCache, saveWishlistCache } from '../utils/wishlistCache';
import { useToast } from '../components/Toast';
import OptimizedImage from '../components/OptimizedImage';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import './Home.css';

const NewsletterSection = lazy(() => import('../components/NewsletterSection'));

const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%2312213d"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Arial, sans-serif" font-size="28">ElectroHub</text></svg>';

const HOME_CATEGORIES = [
  {
    name: 'Lighting',
    icon: 'LGT',
    description: 'Energy-saving bulbs and sensor lighting for modern rooms.',
    link: `/products?category=${encodeURIComponent('Lighting')}`,
    tone: 'sunrise',
  },
  {
    name: 'Switches & Sockets',
    icon: 'SOK',
    description: 'Clean wall finishes, sockets, switches, and waterproof options.',
    link: `/products?category=${encodeURIComponent('Switches & Sockets')}`,
    tone: 'ocean',
  },
  {
    name: 'Adaptors & Extensions',
    icon: 'EXT',
    description: 'Flexible extension sockets and adaptor bundles for busy spaces.',
    link: `/products?category=${encodeURIComponent('Adaptors & Extensions')}`,
    tone: 'violet',
  },
  {
    name: 'Protection Devices',
    icon: 'PRT',
    description: 'MCBs, guards, timers, and safety hardware for peace of mind.',
    link: `/products?category=${encodeURIComponent('Protection Devices')}`,
    tone: 'emerald',
  },
  {
    name: 'Accessories',
    icon: 'ACC',
    description: 'Practical finishing pieces for neat electrical installations.',
    link: `/products?category=${encodeURIComponent('Accessories')}`,
    tone: 'amber',
  },
];

const Home = () => {
  const [catalog, setCatalog] = useState([]);
  const [usingCachedCatalog, setUsingCachedCatalog] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCatalog();
  }, [isDemoMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchCatalog = async () => {
    if (isDemoMode) {
      const cachedCatalog = loadCatalogCache();
      setCatalog(cachedCatalog);
      setUsingCachedCatalog(true);
      return;
    }

    try {
      const res = await axios.get('/products');
      setCatalog(res.data);
      saveCatalogCache(res.data);
      setUsingCachedCatalog(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      const cachedCatalog = loadCatalogCache();
      if (cachedCatalog.length > 0) {
        setCatalog(cachedCatalog);
      }
      setUsingCachedCatalog(true);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      showToast('Please login to add to cart.', 'info');
      return;
    }

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
        return;
      }

      showToast('Added to cart!', 'success');
    } catch (error) {
      showToast('Failed to add to cart.', 'error');
    }
  };

  const addToWishlist = (product) => {
    if (!user) {
      showToast('Please login to add to wishlist.', 'info');
      return;
    }

    const currentWishlist = loadWishlistCache(user.id);
    const isInWishlist = currentWishlist.some((item) => item.id === product.id);

    if (isInWishlist) {
      showToast('Already in wishlist!', 'info');
      return;
    }

    const updatedWishlist = [...currentWishlist, product];
    saveWishlistCache(user.id, updatedWishlist);
    showToast('Added to wishlist!', 'success');
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const { showHeroVideo, featuredProducts, spotlightProduct, categoryCount, lowStockProducts, categoryShowcases, features, stats } =
    useMemo(() => {
      const featuredProductsList = catalog.slice(0, 6);
      const spotlight = catalog[0];
      const categoryTotal = new Set(catalog.map((product) => product.category)).size;
      const lowStock = catalog.filter(
        (product) => Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= 5
      );

      const showcases = HOME_CATEGORIES.map((category, index) => {
        const matches = catalog.filter((product) => product.category === category.name);
        const highlight = matches[index % matches.length] || matches[0] || spotlight;

        return {
          ...category,
          highlight,
          itemCount: matches.length,
        };
      });

      return {
        showHeroVideo: isOnline && !isDemoMode,
        featuredProducts: featuredProductsList,
        spotlightProduct: spotlight,
        categoryCount: categoryTotal,
        lowStockProducts: lowStock,
        categoryShowcases: showcases,
        features: [
          {
            icon: <Sparkles size={36} />,
            title: 'Curated Tronic Catalog',
            description: 'A tighter selection of practical, install-ready electrical essentials.',
          },
          {
            icon: <Shield size={36} />,
            title: 'Safer Shopping',
            description: 'Cleaner categories and product groupings to help customers find the right part faster.',
          },
          {
            icon: <Truck size={36} />,
            title: 'Fast Delivery',
            description: 'Built for easy ordering and quick dispatch across Kenya.',
          },
          {
            icon: <BadgeCheck size={36} />,
            title: 'Trusted Quality',
            description: 'Product images and pricing now map to a more consistent catalog style.',
          },
        ],
        stats: [
          {
            value: `${catalog.length || 0}+`,
            label: 'Active products',
            icon: <ShoppingBag size={18} />,
          },
          {
            value: `${categoryTotal || 0}`,
            label: 'Clean categories',
            icon: <Sparkles size={18} />,
          },
          {
            value: '24/7',
            label: 'Online access',
            icon: <Clock3 size={18} />,
          },
        ],
      };
    }, [catalog, isDemoMode, isOnline]);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            Modern electrical essentials, curated for real projects
          </div>
          <h1>Power your space with a cleaner, more visual shopping experience.</h1>
          <p>
            Explore Tronic-powered lighting, sockets, extensions, and protection devices with
            better product imagery, better category flow, and a more polished storefront.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="cta-button primary">
              Shop Products
              <ArrowRight size={20} />
            </Link>
            <Link to="/products?category=Protection%20Devices" className="cta-button secondary">
              View Safety Picks
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-chip">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-anime-card" aria-label="Anime-inspired delivery scene">
            <div className="hero-anime-card__badge">
              <Sparkles size={14} />
              Anime-style loop
            </div>
            {showHeroVideo ? (
              <div className="hero-video-frame">
                <iframe
                  src="https://www.youtube.com/embed/2iwm5SnAe8E?autoplay=1&mute=1&loop=1&playlist=2iwm5SnAe8E&controls=0&playsinline=1&rel=0&modestbranding=1"
                  title="Anime cozy rain video"
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <div className="hero-video-overlay" />
              </div>
            ) : (
              <div className="hero-video-fallback">
                <div className="hero-video-fallback__label">Offline preview</div>
                <div className="hero-video-fallback__scene">
                  <span className="fallback-moon" />
                  <span className="fallback-window" />
                  <span className="fallback-package" />
                  <span className="fallback-bike" />
                </div>
                <p>
                  You are viewing the offline-friendly hero. The animated storefront experience returns once
                  the network is back.
                </p>
              </div>
            )}
            <div className="hero-anime-caption">
              <strong>Fast orders, glowing city nights, and calm checkout flow.</strong>
              <span>Designed to match the app&apos;s delivery and payment journey.</span>
            </div>
          </div>

          <div className="hero-visual-card hero-visual-main">
            <div className="hero-visual-copy">
              <div className="hero-visual-copy-top">
                <span>Featured pick</span>
                <strong>Bright, safe and ready to install</strong>
              </div>
              <div>
                <h3>{spotlightProduct?.name || 'Curated electrical essentials'}</h3>
                <p>
                  {spotlightProduct?.category || 'Lighting'} | KES {spotlightProduct?.price || '---'}
                </p>
              </div>
              <div className="hero-spec-strip">
                <div>
                  <strong>{catalog.length || 0}+</strong>
                  <span>products</span>
                </div>
                <div>
                  <strong>{categoryCount || 0}</strong>
                  <span>categories</span>
                </div>
                <div>
                  <strong>3D</strong>
                  <span>showcase</span>
                </div>
              </div>
            </div>
            <div className="hero-visual-image">
              <div className="hero-image-frame">
                <OptimizedImage
                  src={spotlightProduct?.image || FALLBACK_PRODUCT_IMAGE}
                  alt={spotlightProduct?.name || 'Electrical product'}
                  priority
                  fallbackSrc={FALLBACK_PRODUCT_IMAGE}
                />
                <div className="hero-image-overlay">
                  <span className="hero-image-chip">Live stock</span>
                  <span className="hero-image-chip bright">Premium finish</span>
                </div>
              </div>
            </div>
            <div className="hero-floating-card hero-floating-card-top">
              <Shield size={18} />
              <div>
                <strong>Safer choices</strong>
                <span>Protection devices and neat fittings</span>
              </div>
            </div>
            <div className="hero-floating-card hero-floating-card-bottom">
              <Truck size={18} />
              <div>
                <strong>Quick dispatch</strong>
                <span>Products ready for fast delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-mini-grid">
            {featuredProducts.slice(1, 4).map((product) => (
              <div key={product.id} className="hero-mini-card">
                <OptimizedImage src={product.image} alt={product.name} fallbackSrc={FALLBACK_PRODUCT_IMAGE} />
                <div>
                  <h4>{product.name}</h4>
                  <p>KES {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lowStockProducts.length > 0 && (
        <section className="inventory-alert">
          <div className="section-container inventory-alert-inner">
            <div className="inventory-alert-copy">
              <div className="inventory-alert-badge">
                <AlertTriangle size={16} />
                Low stock alert
              </div>
              <h2>{lowStockProducts.length} products are almost sold out</h2>
              <p>
                A few store items are running low. Check the live catalog for stock counts before they disappear.
              </p>
            </div>
            <div className="inventory-alert-actions">
              <Link to="/products" className="cta-button primary">
                View low stock items
                <ArrowRight size={18} />
              </Link>
              <Link to="/products" className="cta-button secondary">
                Browse catalog
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="trust-strip">
        <div className="section-container trust-grid">
          <div>
            <h2>Built for a smoother browsing experience</h2>
            <p>
              The homepage now leads with category-first discovery, cleaner imagery, and stronger visual hierarchy.
            </p>
            {usingCachedCatalog && (
              <p className="offline-note">
                {isDemoMode
                  ? 'Demo mode is on. You are browsing your saved catalog only.'
                  : 'Showing your last saved catalog because the network is unavailable.'}
              </p>
            )}
          </div>
          <div className="trust-pills">
            <span>Responsive layout</span>
            <span>Tronic catalog</span>
            <span>Curated categories</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <h2>Why Choose ElectroHub?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-container">
          <div className="section-header split">
            <div>
              <h2>Shop by Category</h2>
              <p>Tap into the main catalog lanes to get customers to the right products faster.</p>
            </div>
            <Link to="/products" className="view-all">
              Browse all products <ArrowRight size={16} />
            </Link>
          </div>
          <div className="categories-grid">
            {categoryShowcases.map((category) => (
              <Link key={category.name} to={category.link} className={`category-card tone-${category.tone}`}>
                <div className="category-banner">
                  <OptimizedImage
                    src={category.highlight?.image || FALLBACK_PRODUCT_IMAGE}
                    alt={category.highlight?.name || category.name}
                    fallbackSrc={FALLBACK_PRODUCT_IMAGE}
                  />
                  <div className="category-banner-overlay">
                    <span>{category.itemCount || 0} items</span>
                    <strong>{category.highlight?.name || category.name}</strong>
                  </div>
                </div>
                <div className="category-topline">
                  <span>{category.icon}</span>
                  <ArrowRight size={18} />
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-highlight-line">
                  <strong>{category.highlight?.name || 'Featured device'}</strong>
                  <span>KES {category.highlight?.price || '---'}</span>
                </div>
                <button
                  type="button"
                  className="category-quick-view-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (category.highlight) {
                      openQuickView(category.highlight);
                    }
                  }}
                >
                  Quick View
                </button>
                <div className="category-link">
                  Explore category <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-container">
          <div className="section-header split">
            <div>
              <h2>Featured Products</h2>
              <p>Top products from the live Tronic-backed catalog.</p>
            </div>
            <Link to="/products" className="view-all">
              View all products <ArrowRight size={16} />
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <OptimizedImage src={product.image} alt={product.name} fallbackSrc={FALLBACK_PRODUCT_IMAGE} />
                  <button
                    className="wishlist-btn"
                    aria-label={`Save ${product.name}`}
                    onClick={() => addToWishlist(product)}
                  >
                    <Heart size={20} />
                  </button>
                </div>
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <p className="product-price">KES {product.price}</p>
                    <div className="product-actions">
                      <button type="button" className="quick-view-btn" onClick={() => openQuickView(product)}>
                        Quick View
                      </button>
                      <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                        <ShoppingBag size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
      />

      <Suspense
        fallback={
          <section className="newsletter-section newsletter-section--loading" aria-busy="true">
            <div className="section-container">
              <div className="newsletter-loading-card" />
            </div>
          </section>
        }
      >
        <NewsletterSection mode="fullPage" />
      </Suspense>

      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to build a cleaner storefront around your catalog?</h2>
            <p>
              We can keep polishing the product pages next, but this homepage now feels much closer to a modern shop.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="cta-button primary">
                Get Started Today
              </Link>
              <Link to="/contact" className="cta-button secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
