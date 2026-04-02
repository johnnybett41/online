import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, ShoppingCart, User, Menu, X, Heart, Sun, Moon } from 'lucide-react';
import logoLight from '../assets/electrohub-mark.svg';
import logoDark from '../assets/electrohub-mark-dark.svg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <img
              src={isDarkMode ? logoDark : logoLight}
              alt="ElectroHub logo"
              className="brand-logo"
            />
            <span className="brand-text">ElectroHub</span>
          </Link>
        </div>

        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>
        </div>

        <div className="navbar-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <Link to="/wishlist" className={`nav-icon-link ${isActive('/wishlist') ? 'active' : ''}`}>
            <Heart size={24} />
            <span className="icon-label">Wishlist</span>
          </Link>

          <Link to="/cart" className={`nav-icon-link ${isActive('/cart') ? 'active' : ''}`}>
            <ShoppingCart size={24} />
            <span className="icon-label">Cart</span>
          </Link>

          {user ? (
            <div className="user-menu">
              <User size={24} className="user-icon" />
              <div className="user-dropdown">
                <Link to="/admin-stock">Stock Editor</Link>
                <Link to="/orders">My Orders</Link>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link register">Register</Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>
        </div>

        <div className="mobile-nav-links">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn mobile-theme-btn"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <Link to="/products" className={isActive('/products') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link to="/blog" className={isActive('/blog') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Blog</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/wishlist" className={isActive('/wishlist') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
          <Link to="/cart" className={isActive('/cart') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Cart</Link>

          {user ? (
            <>
              <Link to="/admin-stock" onClick={() => setIsMenuOpen(false)}>Stock Editor</Link>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
