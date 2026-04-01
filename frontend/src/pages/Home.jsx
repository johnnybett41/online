import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
import './Home.css';

const Home = () => {
  const [catalog, setCatalog] = useState([]);
  const [usingCachedCatalog, setUsingCachedCatalog] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
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
        setUsingCachedCatalog(true);
      }
    }
  };

  const featuredProducts = catalog.slice(0, 6);
  const spotlightProduct = catalog[0];
  const categoryCount = new Set(catalog.map((product) => product.category)).size;
  const lowStockProducts = catalog.filter((product) => Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= 5);

  const categories = [
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

  const features = [
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
  ];

  const stats = [
    {
      value: `${catalog.length || 0}+`,
      label: 'Active products',
      icon: <ShoppingBag size={18} />,
    },
    {
      value: `${categoryCount || 0}`,
      label: 'Clean categories',
      icon: <Sparkles size={18} />,
    },
    {
      value: '24/7',
      label: 'Online access',
      icon: <Clock3 size={18} />,
    },
  ];

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
          <div className="hero-visual-card hero-visual-main">
            <div className="hero-visual-copy">
              <span>Featured pick</span>
              <h3>{spotlightProduct?.name || 'Curated electrical essentials'}</h3>
              <p>
                {spotlightProduct?.category || 'Lighting'} | KES {spotlightProduct?.price || '---'}
              </p>
            </div>
            <div className="hero-visual-image">
              <img
                src={
                  spotlightProduct?.image ||
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%2312213d"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Arial, sans-serif" font-size="28">ElectroHub</text></svg>'
                }
                alt={spotlightProduct?.name || 'Electrical product'}
                decoding="async"
              />
            </div>
          </div>

          <div className="hero-mini-grid">
            {featuredProducts.slice(1, 4).map((product) => (
              <div key={product.id} className="hero-mini-card">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
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
            {usingCachedCatalog && <p className="offline-note">Showing your last saved catalog because the network is unavailable.</p>}
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
            {categories.map((category) => (
              <Link key={category.name} to={category.link} className={`category-card tone-${category.tone}`}>
                <div className="category-topline">
                  <span>{category.icon}</span>
                  <ArrowRight size={18} />
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
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
                  <img src={product.image} alt={product.name} />
                  <button className="wishlist-btn" aria-label={`Save ${product.name}`}>
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
                      <Link to={`/product/${product.id}`} className="view-btn">
                        View
                      </Link>
                      <button className="add-to-cart-btn">
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
