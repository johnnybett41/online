import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Heart, ShoppingBag, ShieldCheck, Truck, X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import './ProductQuickViewModal.css';

const getStockCount = (product) => Number(product?.stock_quantity || 0);

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

const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23f4f7fb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23708aa9" font-family="Arial, sans-serif" font-size="28">Product preview unavailable</text></svg>';

const ProductQuickViewModal = ({ product, onClose, onAddToCart, onAddToWishlist }) => {
  useEffect(() => {
    if (!product || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, product]);

  if (!product || typeof document === 'undefined') {
    return null;
  }

  const stockCount = getStockCount(product);
  const stockLabel = getStockLabel(product);
  const isSoldOut = stockCount <= 0;

  return createPortal(
    <div className="quick-view-backdrop" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="quick-view-modal" role="dialog" aria-modal="true" aria-labelledby={`quick-view-title-${product.id}`}>
        <button type="button" className="quick-view-close" onClick={onClose} aria-label="Close quick view">
          <X size={18} />
        </button>

        <div className="quick-view-media">
          <OptimizedImage
            src={product.image || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            fallbackSrc={FALLBACK_PRODUCT_IMAGE}
            priority
          />
          <div className="quick-view-stock">{stockLabel}</div>
        </div>

        <div className="quick-view-content">
          <div className="quick-view-topline">
            <span className="quick-view-kicker">Quick view</span>
            <span className="quick-view-category">{product.category || 'Catalog item'}</span>
          </div>

          <h2 id={`quick-view-title-${product.id}`}>{product.name}</h2>
          <p className="quick-view-description">{product.description || 'A clean preview of this product with the most important details.'}</p>

          <div className="quick-view-metrics">
            <div>
              <span>Price</span>
              <strong>KES {Number(product.price || 0).toFixed(2)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{stockLabel}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>Fast dispatch</strong>
            </div>
          </div>

          <div className="quick-view-benefits">
            <span><ShieldCheck size={16} /> Safe electrical products</span>
            <span><Truck size={16} /> Fast delivery</span>
            <span><BadgeCheck size={16} /> Trusted quality</span>
          </div>

          <div className="quick-view-actions">
            <button
              type="button"
              className="quick-view-action quick-view-action--ghost"
              onClick={() => onAddToWishlist?.(product)}
            >
              <Heart size={16} />
              Wishlist
            </button>
            <button
              type="button"
              className="quick-view-action quick-view-action--primary"
              onClick={() => onAddToCart?.(product)}
              disabled={isSoldOut}
            >
              <ShoppingBag size={16} />
              {isSoldOut ? 'Sold out' : 'Add to cart'}
            </button>
          </div>

          <Link className="quick-view-link" to={`/product/${product.id}`}>
            Open full product page <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductQuickViewModal;
