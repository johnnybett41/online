import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logoLight from '../assets/electrohub-mark.svg';
import logoDark from '../assets/electrohub-mark-dark.svg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (authError) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__glow auth-shell__glow--one" />
      <div className="auth-shell__glow auth-shell__glow--two" />

      <section className="auth-card auth-card--split">
        <aside className="auth-hero">
          <div className="auth-brand">
            <img
              src={isDarkMode ? logoDark : logoLight}
              alt="ElectroHub logo"
              className="auth-brand__logo"
            />
            <div>
              <p>ElectroHub</p>
              <h1>Welcome back.</h1>
            </div>
          </div>

          <p className="auth-hero__copy">
            Sign in to manage your cart, track orders, and continue with a smoother shopping experience.
          </p>

          <div className="auth-hero__stats">
            <div className="auth-stat">
              <ShieldCheck size={18} />
              Secure account access
            </div>
            <div className="auth-stat">
              <Sparkles size={18} />
              Modern product browsing
            </div>
            <div className="auth-stat">
              <LockKeyhole size={18} />
              Fast and private checkout
            </div>
          </div>

          <div className="auth-hero__panel">
            <div className="auth-hero__panel-top">
              <span>New here?</span>
              <Link to="/register" className="ghost-link">
                Create account <ArrowRight size={16} />
              </Link>
            </div>
            <p>Register once and keep your shipping, cart, and orders in one place.</p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-heading">
            <p className="auth-kicker">Sign in</p>
            <h2>Access your account</h2>
            <p>Use your email and password to continue shopping.</p>
          </div>

          <GoogleSignInButton
            mode="signin"
            onSuccess={async (credential) => {
              setError('');
              setLoading(true);

              try {
                await googleLogin(credential);
                navigate('/');
              } catch (authError) {
                setError(authError.response?.data?.message || 'Google sign-in failed. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            onError={(error) => {
              console.error('Google sign-in error:', error);
              setError('Google sign-in is unavailable right now.');
            }}
          />

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <Mail size={18} className="auth-field__icon" />
              <input
                type="email"
                id="login-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <label htmlFor="login-email">Email address</label>
            </div>

            <div className="auth-field">
              <LockKeyhole size={18} className="auth-field__icon" />
              <input
                type="password"
                id="login-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <label htmlFor="login-password">Password</label>
            </div>

            <div className="auth-meta">
              <label className="auth-check">
                <input type="checkbox" />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="text-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
