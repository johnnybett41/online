import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useToast } from '../components/Toast';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logoLight from '../assets/electrohub-mark.svg';
import logoDark from '../assets/electrohub-mark-dark.svg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const { user, login, googleLogin } = useAuth();
  const { isDarkMode } = useTheme();
  const { enableDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }

    const cachedEmail = localStorage.getItem('lastEmail');
    if (cachedEmail) {
      setEmail(cachedEmail);
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, { rememberMe: rememberEmail });
      if (rememberEmail) {
        localStorage.setItem('lastEmail', email);
      } else {
        localStorage.removeItem('lastEmail');
      }
      showToast('Welcome back. Login successful.', 'success');
      navigate('/');
    } catch (authError) {
      const message = authError.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    showToast('Demo mode enabled for quick browsing.', 'info');
    navigate('/');
  };

  const handleUseSavedEmail = () => {
    const cachedEmail = localStorage.getItem('lastEmail');
    if (cachedEmail) {
      setEmail(cachedEmail);
      showToast('Last email filled in for a faster sign in.', 'info');
    } else {
      showToast('No saved email yet. Sign in once to enable this shortcut.', 'info');
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
                showToast('Signed in with Google.', 'success');
                navigate('/');
              } catch (authError) {
                const message =
                  authError.response?.data?.message || 'Google sign-in failed. Please try again.';
                setError(message);
                showToast(message, 'error');
              } finally {
                setLoading(false);
              }
            }}
            onError={(googleError) => {
              console.error('Google sign-in error:', googleError);
              const message = 'Google sign-in is unavailable right now.';
              setError(message);
              showToast(message, 'error');
            }}
          />

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          <button
            type="button"
            onClick={handleDemoMode}
            className="demo-mode-btn"
            title="Experience the full platform with demo data"
          >
            <Zap size={18} />
            Quick Browse (Demo Mode)
          </button>

          <button
            type="button"
            onClick={handleUseSavedEmail}
            className="demo-mode-btn"
            title="Fill your last saved email"
          >
            <Sparkles size={18} />
            Use saved email
          </button>

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
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                />
                <span>Remember my email</span>
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
