import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import api from '../api';
import { useToast } from './Toast';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const { showToast } = useToast();
  const whatsappUrl = 'https://wa.me/254111487078';
  const tiktokUrl = 'https://www.tiktok.com/@technocrat41';

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const subscriberEmail = email.trim().toLowerCase();
    setNewsletterStatus('loading');

    try {
      const response = await api.post('/newsletter/subscribe', { email: subscriberEmail });
      showToast(response.data?.message || 'Subscription successful.', 'success');
      setEmail('');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'We could not complete the subscription right now. Please try again.';

      showToast(message, 'error');
    } finally {
      setNewsletterStatus('idle');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ElectroHub</h3>
          <p>Your trusted partner for electrical solutions. Quality products, expert service, and innovative technology for all your electrical needs.</p>
          <div className="social-links">
            <a
              href={whatsappUrl}
              className="social-link whatsapp"
              aria-label="Chat with us on WhatsApp"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="https://cdn.simpleicons.org/whatsapp/25D366"
                alt=""
                aria-hidden="true"
              />
            </a>
            <a
              href={tiktokUrl}
              className="social-link tiktok"
              aria-label="Visit our TikTok profile"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="https://cdn.simpleicons.org/tiktok/FFFFFF"
                alt=""
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to={`/products?category=${encodeURIComponent('Lighting')}`}>Lighting</Link></li>
            <li><Link to={`/products?category=${encodeURIComponent('Switches & Sockets')}`}>Switches & Sockets</Link></li>
            <li><Link to={`/products?category=${encodeURIComponent('Adaptors & Extensions')}`}>Adaptors & Extensions</Link></li>
            <li><Link to={`/products?category=${encodeURIComponent('Protection Devices')}`}>Protection Devices</Link></li>
            <li><Link to={`/products?category=${encodeURIComponent('Accessories')}`}>Accessories</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping Info</Link></li>
            <li><Link to="/returns">Returns & Exchanges</Link></li>
            <li><Link to="/warranty">Warranty</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/support">Technical Support</Link></li>
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
                disabled={newsletterStatus === 'loading'}
              />
              <button type="submit" disabled={newsletterStatus === 'loading'}>
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="payment-methods">
            <span>Accepted Payments:</span>
            <div className="payment-icons">
              <span className="payment-icon">Card</span>
              <span className="payment-icon">Cash</span>
              <span className="payment-icon">M-Pesa</span>
            </div>
          </div>
          <div className="copyright">
            <p>&copy; 2024 ElectroHub. All rights reserved. | <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link></p>
          </div>
          <div className="certifications">
            <span>Certified:</span>
            <span className="cert-icon">Secure</span>
            <span className="cert-icon">Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
