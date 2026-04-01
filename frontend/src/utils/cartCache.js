const CART_CACHE_PREFIX = 'electrohub_cart_cache_v2';

const getCartCacheKey = (userId) => `${CART_CACHE_PREFIX}_${userId}`;

export const loadCartCache = (userId) => {
  try {
    const raw = localStorage.getItem(getCartCacheKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveCartCache = (userId, items) => {
  try {
    localStorage.setItem(getCartCacheKey(userId), JSON.stringify(items));
  } catch (error) {
    console.warn('Unable to save cart cache:', error);
  }
};

export const createPendingCartItem = (product, quantity, clientId) => ({
  id: clientId,
  clientId,
  pendingSync: true,
  product_id: product.id,
  quantity,
  name: product.name,
  description: product.description,
  price: product.price,
  image: product.image,
  category: product.category,
});

const matchesCartKey = (item, key) => String(item.id) === String(key) || String(item.clientId || '') === String(key);

export const upsertCartItemInCache = (userId, item) => {
  const current = loadCartCache(userId);
  const next = current.some((existing) => matchesCartKey(existing, item.id || item.clientId))
    ? current.map((existing) => (matchesCartKey(existing, item.id || item.clientId) ? item : existing))
    : [...current, item];

  saveCartCache(userId, next);
  return next;
};

export const updateCartItemInCache = (userId, key, updates) => {
  const current = loadCartCache(userId);
  const next = current.map((item) => (matchesCartKey(item, key) ? { ...item, ...updates } : item));
  saveCartCache(userId, next);
  return next;
};

export const removeCartItemFromCache = (userId, key) => {
  const current = loadCartCache(userId);
  const next = current.filter((item) => !matchesCartKey(item, key));
  saveCartCache(userId, next);
  return next;
};

export const getCartCacheKeyForUser = getCartCacheKey;
