import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Zap, Shield, Truck, Star, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      // Get first 6 products as featured
      setFeaturedProducts(res.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const categories = [
    {
      name: 'Lighting',
      icon: '💡',
      description: 'LED bulbs, tubes, and lighting solutions',
      link: '/products?category=Lighting'
    },
    {
      name: 'Power & Protection',
      icon: '🔌',
      description: 'MCBs, RCDs, and power distribution',
      link: '/products?category=Power & Protection'
    },
    {
      name: 'Wiring Accessories',
      icon: '🔧',
      description: 'Sockets, switches, and wiring components',
      link: '/products?category=Wiring Accessories'
    },
    {
      name: 'Backup & Power',
      icon: '🔋',
      description: 'Inverters, batteries, and solar solutions',
      link: '/products?category=Backup & Power'
    }
  ];

  const features = [
    {
      icon: <Zap size={40} />,
      title: 'Quality Products',
      description: 'Premium electrical products from trusted manufacturers'
    },
    {
      icon: <Shield size={40} />,
      title: 'Safety First',
      description: 'All products meet safety standards and certifications'
    },
    {
      icon: <Truck size={40} />,
      title: 'Fast Delivery',
      description: 'Quick delivery across Kenya with reliable shipping'
    },
    {
      icon: <Star size={40} />,
      title: 'Expert Support',
      description: 'Technical guidance and customer support available'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Power Your World with Quality Electrical Solutions</h1>
          <p>Discover premium electrical products for homes and businesses. From lighting to power protection, we have everything you need.</p>
          <div className="hero-actions">
            <Link to="/products" className="cta-button primary">
              Shop Now
              <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="cta-button secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" alt="Electrical products" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2>Why Choose ElectroHub?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={category.link} className="category-card">
                <div className="category-icon">
                  {category.icon}
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-link">
                  Shop Now <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <button className="wishlist-btn">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">KES {product.price}</p>
                  <div className="product-actions">
                    <Link to={`/product/${product.id}`} className="view-btn">
                      View Details
                    </Link>
                    <button className="add-to-cart-btn">
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Power Your Projects?</h2>
            <p>Join thousands of satisfied customers who trust ElectroHub for their electrical needs.</p>
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