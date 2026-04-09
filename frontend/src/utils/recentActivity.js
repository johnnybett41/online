const RECENTLY_VIEWED_KEY = 'electrohub_recently_viewed_v1';
const MAX_RECENTLY_VIEWED = 8;

const normalizeItem = (product) => {
  if (!product?.id) {
    return null;
  }

  return {
    ...product,
    viewedAt: Date.now(),
  };
};

export const loadRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load recently viewed products:', error);
    return [];
  }
};

export const saveRecentlyViewed = (product) => {
  try {
    const item = normalizeItem(product);
    if (!item) {
      return [];
    }

    const current = loadRecentlyViewed().filter((entry) => String(entry.id) !== String(item.id));
    const next = [item, ...current].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Unable to save recently viewed products:', error);
    return loadRecentlyViewed();
  }
};

const getPriceBucket = (price) => {
  const value = Number(price || 0);

  if (value <= 1000) return 'budget';
  if (value <= 5000) return 'mid';
  return 'premium';
};

export const buildRecommendations = ({
  catalog = [],
  currentProduct = null,
  recentlyViewed = [],
  limit = 6,
} = {}) => {
  const viewedCategories = new Set(recentlyViewed.map((item) => item.category).filter(Boolean));
  const currentPriceBucket = currentProduct ? getPriceBucket(currentProduct.price) : null;

  const scored = catalog
    .filter((product) => String(product.id) !== String(currentProduct?.id))
    .map((product) => {
      let score = 0;

      if (currentProduct && product.category === currentProduct.category) {
        score += 6;
      }

      if (viewedCategories.has(product.category)) {
        score += 3;
      }

      if (currentPriceBucket && getPriceBucket(product.price) === currentPriceBucket) {
        score += 2;
      }

      if (Number(product.stock_quantity || 0) > 0) {
        score += 1;
      }

      return { product, score };
    })
    .sort((a, b) => b.score - a.score || String(a.product.name).localeCompare(String(b.product.name)))
    .map((entry) => entry.product);

  return scored.slice(0, limit);
};

export const getRecentlyViewedWithinCatalog = (catalog = [], limit = 6) => {
  const recentlyViewed = loadRecentlyViewed();
  const byId = new Map(catalog.map((product) => [String(product.id), product]));

  return recentlyViewed
    .map((item) => byId.get(String(item.id)) || item)
    .filter(Boolean)
    .slice(0, limit);
};

