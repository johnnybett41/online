import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/login');
    } catch (authError) {
      if (authError.response?.data?.message) {
        setError(authError.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__glow auth-shell__glow--one" />
      <div className="auth-shell__glow auth-shell__glow--two" />

      <section className="auth-card auth-card--split">
        <aside className="auth-hero auth-hero--register">
          <div className="auth-brand">
            <span className="auth-brand__mark">EH</span>
            <div>
              <p>ElectroHub</p>
              <h1>Create your account.</h1>
            </div>
          </div>

          <p className="auth-hero__copy">
            Join ElectroHub to save products, track orders, and keep your electrical shopping organized.
          </p>

          <div className="auth-hero__stats">
            <div className="auth-stat">
              <ShieldCheck size={18} />
              Secure checkout
            </div>
            <div className="auth-stat">
              <Sparkles size={18} />
              Cleaner catalog browsing
            </div>
            <div className="auth-stat">
              <UserRound size={18} />
              Personalized account space
            </div>
          </div>

          <div className="auth-hero__panel">
            <div className="auth-hero__panel-top">
              <span>Already have an account?</span>
              <Link to="/login" className="ghost-link">
                Sign in <ArrowRight size={16} />
              </Link>
            </div>
            <p>Once registered, you can move quickly from browsing to checkout.</p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-heading">
            <p className="auth-kicker">Sign up</p>
            <h2>Start shopping in seconds</h2>
            <p>Create your ElectroHub profile and keep everything in one place.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <UserRound size={18} className="auth-field__icon" />
              <input
                type="text"
                id="register-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                required
                autoComplete="username"
              />
              <label htmlFor="register-username">Username</label>
            </div>

            <div className="auth-field">
              <Mail size={18} className="auth-field__icon" />
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                autoComplete="email"
              />
              <label htmlFor="register-email">Email address</label>
            </div>

            <div className="auth-field">
              <LockKeyhole size={18} className="auth-field__icon" />
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                autoComplete="new-password"
              />
              <label htmlFor="register-password">Password</label>
            </div>

            <div className="auth-meta auth-meta--stacked">
              <label className="auth-check">
                <input type="checkbox" required />
                <span>I agree to the terms and privacy policy</span>
              </label>
              <p className="auth-helper">
                Use a strong password with letters, numbers, and symbols.
              </p>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already registered?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
