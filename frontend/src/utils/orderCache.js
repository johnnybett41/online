const ORDER_CACHE_PREFIX = 'electrohub_order_cache_v1';

const getOrderCacheKey = (userId) => `${ORDER_CACHE_PREFIX}_${userId}`;

export const loadOrderCache = (userId) => {
  try {
    const raw = localStorage.getItem(getOrderCacheKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveOrderCache = (userId, orders) => {
  try {
    localStorage.setItem(getOrderCacheKey(userId), JSON.stringify(orders));
  } catch (error) {
    console.warn('Unable to save order cache:', error);
  }
};
