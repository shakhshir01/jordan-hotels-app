/**
 * Caching Strategy Service
 * Implements intelligent caching for API responses and computed values
 */

/**
 * Cache Entry
 */
class CacheEntry {
  constructor(data, ttl = 300000) {
    // 5 minutes default TTL
    this.data = data;
    this.createdAt = Date.now();
    this.ttl = ttl;
    this.hits = 0;
  }

  /**
   * Check if cache entry is still valid
   */
  isValid() {
    return Date.now() - this.createdAt < this.ttl;
  }

  /**
   * Get data and track hits
   */
  getData() {
    this.hits++;
    return this.data;
  }
}

/**
 * Cache Manager
 */
export class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.strategy = options.strategy || 'LRU'; // LRU or LFU
  }

  /**
   * Get from cache
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (!entry.isValid()) {
      this.cache.delete(key);
      return null;
    }

    return entry.getData();
  }

  /**
   * Set cache
   */
  set(key, data, ttl = this.defaultTTL) {
    // Check if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, new CacheEntry(data, ttl));
  }

  /**
   * Evict least used entry based on strategy
   */
  evict() {
    let keyToRemove = null;

    if (this.strategy === 'LRU') {
      // Remove least recently used
      let oldestTime = Infinity;
      for (const [key, entry] of this.cache) {
        if (entry.createdAt < oldestTime) {
          oldestTime = entry.createdAt;
          keyToRemove = key;
        }
      }
    } else if (this.strategy === 'LFU') {
      // Remove least frequently used
      let minHits = Infinity;
      for (const [key, entry] of this.cache) {
        if (entry.hits < minHits) {
          minHits = entry.hits;
          keyToRemove = key;
        }
      }
    }

    if (keyToRemove) {
      this.cache.delete(keyToRemove);
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    return entry && entry.isValid();
  }

  /**
   * Delete specific key
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache by pattern
   */
  clearByPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    let validEntries = 0;

    for (const [key, entry] of this.cache) {
      if (entry.isValid()) {
        validEntries++;
        totalHits += entry.hits;
      }
    }

    return {
      size: this.cache.size,
      validEntries,
      totalHits,
      averageHitsPerEntry: validEntries > 0 ? totalHits / validEntries : 0,
    };
  }
}

/**
 * API Cache
 * Caches HTTP responses
 */
export const apiCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 300000, // 5 minutes
  strategy: 'LRU',
});

/**
 * Compute Cache
 * Caches computed values and transformations
 */
export const computeCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 600000, // 10 minutes
  strategy: 'LFU',
});

/**
 * Get cache key for API request
 */
export const getCacheKey = (method, url, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${method}:${url}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Fetch with caching
 */
export const fetchWithCache = async (method, url, options = {}) => {
  const cacheKey = getCacheKey(method, url, options.params);

  // Check cache
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit: ${cacheKey}`);
    return cachedData;
  }

  // Fetch from API
  try {
    // Implementation depends on your HTTP client
    const response = await fetch(url, {
      method,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache successful response
    const ttl = options.cacheTTL || 300000;
    apiCache.set(cacheKey, data, ttl);

    return data;
  } catch (error) {
    console.error(`Fetch failed: ${cacheKey}`, error);
    throw error;
  }
};

/**
 * Cache decorator for functions
 */
export const cached = (fn, ttl = 300000) => {
  return (...args) => {
    const cacheKey = `${fn.name}:${JSON.stringify(args)}`;

    const cached = computeCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    computeCache.set(cacheKey, result, ttl);
    return result;
  };
};

/**
 * React Hook for Cached Data Fetching
 */
export const useCachedFetch = (url, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchWithCache('GET', url, options);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};

/**
 * Clear API cache for specific resource
 */
export const invalidateCache = (pattern) => {
  apiCache.clearByPattern(pattern);
};

/**
 * Invalidate cache after mutation (POST, PUT, DELETE)
 */
export const invalidateCacheAfterMutation = (method, url) => {
  // Clear related cache patterns
  apiCache.clearByPattern(`GET:${url}`);
};

export default {
  CacheManager,
  apiCache,
  computeCache,
  getCacheKey,
  fetchWithCache,
  cached,
  useCachedFetch,
  invalidateCache,
  invalidateCacheAfterMutation,
};
