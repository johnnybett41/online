import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, MailCheck } from 'lucide-react';
import './PolicyPage.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="policy-page">
      <header className="policy-page-header">
        <span className="page-kicker">Account Help</span>
        <h1>Reset your password.</h1>
        <p>Enter your email address and we'll help you continue back to your account.</p>
        <div className="policy-hero-badges">
          <span><KeyRound size={16} /> Secure reset</span>
          <span><MailCheck size={16} /> Email instructions</span>
        </div>
      </header>

      <section className="policy-page-content">
        <article className="policy-card policy-card--form">
          <form className="policy-form" onSubmit={handleSubmit}>
            <div className="policy-field">
              <label htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <button type="submit" className="policy-button">
              Send reset link <ArrowRight size={16} />
            </button>
          </form>

          {sent && (
            <p className="policy-note policy-note--success">
              If an account exists for {email}, a reset link would be sent there.
            </p>
          )}

          <p className="policy-note">
            Remember your password? <Link className="policy-link" to="/login">Back to login</Link>
          </p>
        </article>
      </section>
    </div>
  );
};

export default ForgotPassword;
