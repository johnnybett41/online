import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { Heart, Filter, Grid, List, ShieldCheck, Truck, BadgeCheck, Search } from 'lucide-react';
import { loadCatalogCache, saveCatalogCache } from '../utils/catalogCache';
import { addCartItem } from '../utils/cartActions';
import { loadWishlistCache, saveWishlistCache } from '../utils/wishlistCache';
import { useToast } from '../components/Toast';
import OptimizedImage from '../components/OptimizedImage';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Skeleton, { SkeletonLine } from '../components/Skeleton';
import './Products.css';

const CATEGORY_ORDER = [
  'Lighting',
  'Switches & Sockets',
  'Adaptors & Extensions',
  'Protection Devices',
  'Accessories',
];

const sortCategories = (items) =>
  [...items].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

const getStockCount = (product) => Number(product.stock_quantity || 0);

const getStockLabel = (product) => {
  const stockCount = getStockCount(product);

  if (stockCount <= 0) {
    return 'Sold out';
  }

  if (stockCount <= 5) {
    return `Only ${stockCount} left`;
  }

  return `${stockCount} in stock`;
};

const VIRTUALIZED_GRID_THRESHOLD = 24;

const GRID_LAYOUTS = [
  { minWidth: 1180, columns: 4, rowHeight: 540 },
  { minWidth: 880, columns: 3, rowHeight: 540 },
  { minWidth: 540, columns: 2, rowHeight: 600 },
  { minWidth: 0, columns: 1, rowHeight: 700 },
];

const getGridLayout = (width) =>
  GRID_LAYOUTS.find((layout) => width >= layout.minWidth) || GRID_LAYOUTS[GRID_LAYOUTS.length - 1];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [quickFilter, setQuickFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [gridWindow, setGridWindow] = useState({
    startRow: 0,
    endRow: 0,
    columns: 1,
    rowHeight: GRID_LAYOUTS[0].rowHeight,
    totalRows: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usingCachedCatalog, setUsingCachedCatalog] = useState(false);
  const gridViewportRef = useRef(null);
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'all';
  const categoryChips = useMemo(() => ['all', ...categories], [categories]);

  useEffect(() => {
    fetchProducts();
  }, [isDemoMode]);

  useEffect(() => {
    setSelectedCategory(categoryQuery);
  }, [categoryQuery]);

  const fetchProducts = async () => {
    if (isDemoMode) {
      const cachedProducts = loadCatalogCache();
      setProducts(cachedProducts);
      const uniqueCategories = [...new Set(cachedProducts.map((p) => p.category))];
      setCategories(sortCategories(uniqueCategories));
      setUsingCachedCatalog(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/products');
      setProducts(res.data);
      saveCatalogCache(res.data);
      setUsingCachedCatalog(false);
      const uniqueCategories = [...new Set(res.data.map(p => p.category))];
      setCategories(sortCategories(uniqueCategories));
    } catch (error) {
      console.error('Error fetching products:', error);
      const cachedProducts = loadCatalogCache();
      if (cachedProducts.length > 0) {
        setProducts(cachedProducts);
        const uniqueCategories = [...new Set(cachedProducts.map((p) => p.category))];
        setCategories(sortCategories(uniqueCategories));
      }
      setUsingCachedCatalog(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (quickFilter !== 'all') {
      filtered = filtered.filter((product) => {
        const stockCount = getStockCount(product);
        const price = Number(product.price || 0);

        switch (quickFilter) {
          case 'in-stock':
            return stockCount > 0;
          case 'low-stock':
            return stockCount > 0 && stockCount <= 5;
          case 'sold-out':
            return stockCount <= 0;
          case 'fast-delivery':
            return stockCount > 0;
          case 'budget':
            return price < 1000;
          case 'mid':
            return price >= 1000 && price <= 5000;
          case 'premium':
            return price > 5000;
          default:
            return true;
        }
      });
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, selectedCategory, priceRange.min, priceRange.max, sortBy, searchQuery, quickFilter]);

  const shouldVirtualizeGrid = viewMode === 'grid' && filteredProducts.length > VIRTUALIZED_GRID_THRESHOLD;

  useEffect(() => {
    if (!shouldVirtualizeGrid) {
      setGridWindow({
        startRow: 0,
        endRow: 0,
        columns: 1,
        rowHeight: GRID_LAYOUTS[0].rowHeight,
        totalRows: 0,
      });
      return undefined;
    }

    let rafId = 0;

    const updateGridWindow = () => {
      const viewport = gridViewportRef.current;

      if (!viewport) {
        return;
      }

      const layout = getGridLayout(viewport.clientWidth || window.innerWidth);
      const totalRows = Math.ceil(filteredProducts.length / layout.columns);
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const viewportHeight = window.innerHeight || 0;
      const gridTop = viewport.getBoundingClientRect().top + scrollTop;
      const overscanRows = 2;
      const currentRow = Math.max(0, Math.floor((scrollTop - gridTop) / layout.rowHeight));
      const visibleRows = Math.max(1, Math.ceil(viewportHeight / layout.rowHeight));
      const startRow = Math.max(0, currentRow - overscanRows);
      const endRow = Math.min(totalRows, currentRow + visibleRows + overscanRows);

      setGridWindow((currentWindow) => {
        if (
          currentWindow.startRow === startRow &&
          currentWindow.endRow === endRow &&
          currentWindow.columns === layout.columns &&
          currentWindow.rowHeight === layout.rowHeight &&
          currentWindow.totalRows === totalRows
        ) {
          return currentWindow;
        }

        return {
          startRow,
          endRow,
          columns: layout.columns,
          rowHeight: layout.rowHeight,
          totalRows,
        };
      });
    };

    const scheduleGridUpdate = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateGridWindow);
    };

    scheduleGridUpdate();
    window.addEventListener('scroll', scheduleGridUpdate, { passive: true });
    window.addEventListener('resize', scheduleGridUpdate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleGridUpdate);
      window.removeEventListener('resize', scheduleGridUpdate);
    };
  }, [filteredProducts.length, shouldVirtualizeGrid]);

  const addToCart = async (product) => {
    if (!user) {
      showToast('Please login to add to cart.', 'info');
      return;
    }

    try {
      const result = await addCartItem({
        userId: user.id,
        product,
        quantity: 1,
        allowNetwork: !isDemoMode,
      });

      if (result.pending || result.queued) {
        showToast(
          isDemoMode
            ? 'Added to cart in demo mode. It will sync when you leave demo mode.'
            : 'Added to cart. It will sync when you are back online.',
          'info'
        );
        return;
      }

      showToast('Added to cart!', 'success');
    } catch (error) {
      showToast('Failed to add to cart.', 'error');
    }
  };

  const addToWishlist = (product) => {
    if (!user) {
      showToast('Please login to add to wishlist.', 'info');
      return;
    }

    const currentWishlist = loadWishlistCache(user.id);
    const isInWishlist = currentWishlist.some(item => item.id === product.id);

    if (isInWishlist) {
      showToast('Already in wishlist!', 'info');
      return;
    }

    const updatedWishlist = [...currentWishlist, product];
    saveWishlistCache(user.id, updatedWishlist);
    showToast('Added to wishlist!', 'success');
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const handleImageError = (event) => {
    event.currentTarget.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23777" font-family="Arial, sans-serif" font-size="28">Image unavailable</text></svg>';
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setQuickFilter('all');
  };

  const renderProductCard = (product) => (
    <div className="product-card">
      <div className="product-image">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          fallbackSrc="data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;800&quot; height=&quot;600&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;%23f2f2f2&quot;/><text x=&quot;50%&quot; y=&quot;50%&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot; fill=&quot;%23777&quot; font-family=&quot;Arial, sans-serif&quot; font-size=&quot;28&quot;>Image unavailable</text></svg>"
          onError={handleImageError}
        />
        <span
          className={`stock-badge ${getStockCount(product) <= 0 ? 'sold-out' : getStockCount(product) <= 5 ? 'low-stock' : ''}`}
        >
          {getStockLabel(product)}
        </span>
        <button className="wishlist-btn" onClick={() => addToWishlist(product)}>
          <Heart size={20} />
        </button>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-category">{product.category}</p>
        <p className="product-price">KES {product.price}</p>
        <p
          className={`product-stock ${
            getStockCount(product) <= 0 ? 'sold-out' : getStockCount(product) <= 5 ? 'low-stock' : ''
          }`}
        >
          {getStockLabel(product)}
        </p>
        <div className="product-actions">
          <button type="button" className="quick-view-btn" onClick={() => openQuickView(product)}>
            Quick View
          </button>
          <button className="add-to-cart-btn" disabled={getStockCount(product) <= 0} onClick={() => addToCart(product)}>
            {getStockCount(product) <= 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
          <Link to={`/product/${product.id}`} className="view-details-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const virtualizedGridRows = useMemo(() => {
    if (!shouldVirtualizeGrid) {
      return null;
    }

    const startIndex = gridWindow.startRow * gridWindow.columns;
    const endIndex = Math.min(filteredProducts.length, gridWindow.endRow * gridWindow.columns);
    const visibleProducts = filteredProducts.slice(startIndex, endIndex);
    const rows = [];

    for (let index = 0; index < visibleProducts.length; index += gridWindow.columns) {
      rows.push(visibleProducts.slice(index, index + gridWindow.columns));
    }

    return {
      topSpacer: gridWindow.startRow * gridWindow.rowHeight,
      bottomSpacer: Math.max(0, (gridWindow.totalRows - gridWindow.endRow) * gridWindow.rowHeight),
      rows,
    };
  }, [filteredProducts, gridWindow, shouldVirtualizeGrid]);

  const quickTrustBadges = useMemo(
    () => [
      { icon: <ShieldCheck size={16} />, label: 'Warranty included' },
      { icon: <Truck size={16} />, label: 'Fast delivery' },
      { icon: <BadgeCheck size={16} />, label: 'Safe electrical products' },
    ],
    []
  );

  const quickFilterChips = [
    { value: 'all', label: 'All products' },
    { value: 'in-stock', label: 'In stock' },
    { value: 'low-stock', label: 'Low stock' },
    { value: 'fast-delivery', label: 'Fast delivery' },
    { value: 'budget', label: 'Under 1,000' },
    { value: 'mid', label: '1,000 - 5,000' },
    { value: 'premium', label: '5,000+' },
  ];

  const stockSummary = useMemo(() => {
    const totalRemainingStock = products.reduce((sum, product) => sum + Math.max(0, getStockCount(product)), 0);
    const lowStockCount = products.filter((product) => {
      const stockCount = getStockCount(product);
      return stockCount > 0 && stockCount <= 5;
    }).length;
    const soldOutCount = products.filter((product) => getStockCount(product) <= 0).length;
    const almostSoldOutProducts = products
      .filter((product) => getStockCount(product) > 0 && getStockCount(product) <= 5)
      .sort((a, b) => getStockCount(a) - getStockCount(b))
      .slice(0, 6);

    return { totalRemainingStock, lowStockCount, soldOutCount, almostSoldOutProducts };
  }, [products]);

  if (loading) {
    return (
      <div className="products-container products-loading-shell">
        <div className="products-header products-header--loading">
          <SkeletonLine className="loading-kicker" />
          <Skeleton className="loading-title" />
          <SkeletonLine className="loading-text" />
          <div className="loading-badge-row">
            {quickTrustBadges.map((badge) => (
              <Skeleton key={badge.label} className="loading-badge" />
            ))}
          </div>
        </div>

        <div className="stock-overview">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="stock-stat skeleton-card" />
          ))}
        </div>

        <div className="loading-chip-row">
          {['All', 'Lighting', 'Safety', 'Accessories'].map((chip) => (
            <SkeletonLine key={chip} className="loading-chip" />
          ))}
        </div>

        <div className="products-grid loading-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="loading-product-card">
              <Skeleton className="loading-image" />
              <div className="loading-product-body">
                <SkeletonLine className="loading-line short" />
                <SkeletonLine className="loading-line" />
                <SkeletonLine className="loading-line long" />
                <div className="loading-actions">
                  <SkeletonLine className="loading-button" />
                  <SkeletonLine className="loading-button" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Discover our wide range of electrical products</p>
        <div className="trust-badges">
          {quickTrustBadges.map((badge) => (
            <span key={badge.label} className="trust-badge">
              {badge.icon}
              {badge.label}
            </span>
          ))}
        </div>
        {usingCachedCatalog && (
          <p className="offline-note">
            {isDemoMode
              ? 'Demo mode is on, so product browsing is using saved catalog data only.'
              : 'You are seeing cached product data because the network is unavailable.'}
          </p>
        )}
      </div>

      <div className="category-chips" aria-label="Quick category filters">
        {categoryChips.map((category) => {
          const label = category === 'all' ? 'All' : category;
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="quick-filter-chips" aria-label="Quick product filters">
        {quickFilterChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={`quick-filter-chip ${quickFilter === chip.value ? 'active' : ''}`}
            onClick={() => setQuickFilter(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="stock-overview">
        <div className="stock-stat">
          <span className="stock-value">{stockSummary.totalRemainingStock}</span>
          <span className="stock-label">Items left in store</span>
        </div>
        <div className="stock-stat">
          <span className="stock-value">{stockSummary.lowStockCount}</span>
          <span className="stock-label">Low-stock products</span>
        </div>
        <div className="stock-stat">
          <span className="stock-value">{stockSummary.soldOutCount}</span>
          <span className="stock-label">Sold out</span>
        </div>
      </div>

      <div className="products-controls">
        <div className="filters-section">
          <button className="filter-toggle">
            <Filter size={20} />
            Filters
          </button>

          <div className="filters-content">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="products-info">
        <p>{filteredProducts.length} products found</p>
        <p>{filteredProducts.reduce((sum, product) => sum + Math.max(0, getStockCount(product)), 0)} items currently visible</p>
        {searchQuery && <p>Search results for: "{searchQuery}"</p>}
      </div>

      {stockSummary.almostSoldOutProducts.length > 0 && (
        <section className="low-stock-section">
          <div className="low-stock-header">
            <div>
              <span className="low-stock-kicker">Filtered view</span>
              <h2>Almost sold out</h2>
              <p>These products are running low, so shoppers can see the remaining stock before checkout.</p>
            </div>
            <div className="low-stock-summary">
              <span>{stockSummary.almostSoldOutProducts.length} items</span>
              <span>stock at 5 or below</span>
            </div>
          </div>
          <div className="low-stock-grid">
            {stockSummary.almostSoldOutProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="low-stock-card">
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="low-stock-card__image"
                  fallbackSrc="data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;800&quot; height=&quot;600&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;%23f2f2f2&quot;/><text x=&quot;50%&quot; y=&quot;50%&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot; fill=&quot;%23777&quot; font-family=&quot;Arial, sans-serif&quot; font-size=&quot;28&quot;>Image unavailable</text></svg>"
                />
                <div className="low-stock-card-body">
                  <span className={`low-stock-pill ${getStockCount(product) <= 0 ? 'sold-out' : ''}`}>
                    {getStockLabel(product)}
                  </span>
                  <h3>{product.name}</h3>
                  <p>KES {product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {shouldVirtualizeGrid ? (
        <div className="products-virtual-grid" ref={gridViewportRef}>
          <div style={{ height: `${virtualizedGridRows?.topSpacer || 0}px` }} aria-hidden="true" />
          {(virtualizedGridRows?.rows || []).map((row, rowIndex) => (
            <div
              key={`virtual-row-${gridWindow.startRow + rowIndex}`}
              className="products-virtual-row"
              style={{ minHeight: `${gridWindow.rowHeight}px` }}
            >
              {row.map((product) => (
                <div key={product.id}>{renderProductCard(product)}</div>
              ))}
            </div>
          ))}
          <div style={{ height: `${virtualizedGridRows?.bottomSpacer || 0}px` }} aria-hidden="true" />
        </div>
      ) : (
        <div className={`products-grid ${viewMode}`}>
          {filteredProducts.map((product) => (
            <div key={product.id}>{renderProductCard(product)}</div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <div className="no-products__icon">
            <Search size={34} />
          </div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
          <div className="no-products__chips">
            <span>Lighting</span>
            <span>Safety</span>
            <span>Accessories</span>
          </div>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
      />
    </div>
  );
};

export default Products;
