import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-bottom-nav__item ${isActive(item.to) ? 'active' : ''}`}
            aria-current={isActive(item.to) ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
