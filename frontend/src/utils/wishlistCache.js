const WISHLIST_CACHE_PREFIX = 'wishlist_';

const getWishlistKey = (userId) => `${WISHLIST_CACHE_PREFIX}${userId}`;

export const loadWishlistCache = (userId) => {
  try {
    const raw = localStorage.getItem(getWishlistKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveWishlistCache = (userId, wishlist) => {
  try {
    localStorage.setItem(getWishlistKey(userId), JSON.stringify(wishlist));
  } catch (error) {
    console.warn('Unable to save wishlist cache:', error);
  }
};
