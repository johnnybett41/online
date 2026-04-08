import { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';
import './NewsletterSection.css';

const NewsletterSection = ({ fullPage = false }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      const errorMessage = 'Please enter a valid email';
      setMessage(errorMessage);
      setStatus('error');
      showToast(errorMessage, 'error');
      return;
    }

    setStatus('loading');

    try {
      const response = await axios.post('/newsletter/subscribe', { email });
      const successMessage = response.data.message || 'Subscribed successfully.';

      setStatus('success');
      setMessage(successMessage);
      setEmail('');
      showToast(successMessage, 'success');

      window.setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setStatus('error');
      setMessage(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const featureItems = [
    { icon: '*', title: 'Exclusive Deals', copy: 'Early access to sales and special discounts' },
    { icon: '+', title: 'New Releases', copy: 'Stay informed about latest tech products' },
    { icon: '#', title: 'Expert Tips', copy: 'Product guides and how-to articles' },
  ];

  const form = (
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
  );

  if (fullPage) {
    return (
      <section className="newsletter-full">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2>Stay Updated with the Latest Deals</h2>
            <p>Get exclusive offers, product launches, and tech tips delivered to your inbox.</p>
            {form}
            <p className="newsletter-small">We respect your privacy. Unsubscribe anytime.</p>
          </div>

          <div className="newsletter-features">
            {featureItems.map((item) => (
              <div key={item.title} className="feature">
                <span className="feature-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.copy}</p>
              </div>
            ))}
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
        {status === 'loading' ? '...' : '->'}
      </button>
      {message && <p className={`newsletter-message newsletter-${status}`}>{message}</p>}
    </div>
  );
};

export default NewsletterSection;
