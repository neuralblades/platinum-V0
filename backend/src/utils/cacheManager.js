/**
 * Simple in-memory cache manager
 * Provides caching functionality for frequently accessed data
 */

// Simple in-memory cache
const cache = new Map();

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found/expired
 */
const get = (key) => {
  if (!cache.has(key)) return null;

  const cachedItem = cache.get(key);
  const now = Date.now();

  // Check if item has expired
  if (cachedItem.expiry && now > cachedItem.expiry) {
    cache.delete(key);
    return null;
  }

  return cachedItem.data;
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 */
const set = (key, data, ttl = 300) => {
  const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : null;
  cache.set(key, { data, expiry });
};

/**
 * Remove item from cache
 * @param {string} key - Cache key
 */
const remove = (key) => {
  cache.delete(key);
};

/**
 * Clear all items from cache
 */
const clear = () => {
  cache.clear();
};

/**
 * Get cache stats and keys
 * @returns {Object} - Cache statistics and keys
 */
const getStats = () => {
  const now = Date.now();
  let activeItems = 0;
  let expiredItems = 0;
  const keys = {};

  cache.forEach((item, key) => {
    if (!item.expiry || now < item.expiry) {
      activeItems++;
      keys[key] = true;
    } else {
      expiredItems++;
      // Auto-clean expired items
      cache.delete(key);
    }
  });

  return {
    totalItems: cache.size,
    activeItems,
    expiredItems,
    ...keys
  };
};

module.exports = {
  get,
  set,
  remove,
  clear,
  getStats
};
