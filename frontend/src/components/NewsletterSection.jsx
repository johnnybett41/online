import { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import './NewsletterSection.css';

const NewsletterSection = ({ fullPage = false }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error', null
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter a valid email');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const response = await axios.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage(response.data.message);
      setEmail('');
      
      // Auto-dismiss success after 3 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Failed to subscribe. Please try again.'
      );
    }
  };

  if (fullPage) {
    return (
      <section className="newsletter-full">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2>Stay Updated with the Latest Deals</h2>
            <p>Get exclusive offers, product launches, and tech tips delivered to your inbox.</p>
            
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="form-group">
                <Mail size={20} className="form-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={status === 'loading'}
                  className="form-input"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`form-button ${status === 'loading' ? 'loading' : ''}`}
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>

              {message && (
                <div className={`form-message form-message-${status}`}>
                  {status === 'success' && <CheckCircle size={18} />}
                  {status === 'error' && <AlertCircle size={18} />}
                  <span>{message}</span>
                </div>
              )}
            </form>

            <p className="newsletter-small">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>

          <div className="newsletter-features">
            <div className="feature">
              <span className="feature-icon">🎁</span>
              <h4>Exclusive Deals</h4>
              <p>Early access to sales and special discounts</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <h4>New Releases</h4>
              <p>Stay informed about latest tech products</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💡</span>
              <h4>Expert Tips</h4>
              <p>Product guides and how-to articles</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="newsletter-widget">
      <Mail size={20} />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Subscribe to newsletter"
        disabled={status === 'loading'}
        className="newsletter-input"
      />
      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="newsletter-submit"
      >
        {status === 'loading' ? '...' : '→'}
      </button>
      {message && (
        <p className={`newsletter-message newsletter-${status}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSection;
