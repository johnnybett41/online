const CATALOG_CACHE_KEY = 'electrohub_catalog_cache_v1';

export const saveCatalogCache = (products) => {
  try {
    localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        products,
      })
    );
  } catch (error) {
    console.warn('Unable to save catalog cache:', error);
  }
};

export const loadCatalogCache = () => {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.products) ? parsed.products : [];
  } catch (error) {
    console.warn('Unable to load catalog cache:', error);
    return [];
  }
};

export const loadCachedProductById = (id) => {
  const products = loadCatalogCache();
  return products.find((product) => String(product.id) === String(id)) || null;
};
