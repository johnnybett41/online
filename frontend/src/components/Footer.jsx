import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('johnbett414@gmail.com');

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ElectroHub</h3>
          <p>Your trusted partner for electrical solutions. Quality products, expert service, and innovative technology for all your electrical needs.</p>
          <div className="social-links">
            <a href="#" className="social-link"><Facebook size={20} /></a>
            <a href="#" className="social-link"><Twitter size={20} /></a>
            <a href="#" className="social-link"><Instagram size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/products">All Products</a></li>
            <li><a href="/categories/power-protection">Power & Protection</a></li>
            <li><a href="/categories/lighting">Lighting Solutions</a></li>
            <li><a href="/categories/wiring">Wiring Accessories</a></li>
            <li><a href="/categories/backup-power">Backup & Power</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/returns">Returns & Exchanges</a></li>
            <li><a href="/warranty">Warranty</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Technical Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Information</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={16} />
              <span>+254 0111487078</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>info@electrohub.co.ke</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>Kericho, Kenya</span>
            </div>
          </div>
          <div className="newsletter">
            <h5>Subscribe to Newsletter</h5>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="payment-methods">
            <span>Accepted Payments:</span>
            <div className="payment-icons">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">💰</span>
              <span className="payment-icon">📱</span>
            </div>
          </div>
          <div className="copyright">
            <p>&copy; 2024 ElectroHub. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
          </div>
          <div className="certifications">
            <span>Certified:</span>
            <span className="cert-icon">🔒</span>
            <span className="cert-icon">✓</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;