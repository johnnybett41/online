import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      </header>

      <section className="policy-page-content">
        <article className="policy-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="reset-email" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#10213d' }}>
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid #d6deeb',
                marginBottom: '14px',
                fontSize: '1rem',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #10213d 0%, #27406b 100%)',
                color: '#fff',
                border: 'none',
                padding: '13px 22px',
                borderRadius: '14px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              Send reset link
            </button>
          </form>

          {sent && (
            <p className="policy-note">
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
