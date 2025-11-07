/**
 * Client-Side Cache Manager
 * Provides persistent caching across page navigations using localStorage
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class ClientCacheManager<T> {
  private readonly defaultTTL: number;
  private readonly storageKey: string;

  constructor(storageKey: string, defaultTTL: number = 30 * 60 * 1000) {
    this.storageKey = storageKey;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    try {
      const cache = this.getCache();
      cache[key] = item;
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const cache = this.getCache();
      const item = cache[key];

      if (!item) return null;

      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const cache = this.getCache();
      delete cache[key];
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
      return true;
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
      return false;
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  private getCache(): Record<string, CacheItem<T>> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse cache from localStorage:', error);
      return {};
    }
  }

  // Clean up expired items
  cleanup(): void {
    if (typeof window === 'undefined') return;

    try {
      const cache = this.getCache();
      const now = Date.now();
      let hasExpired = false;

      for (const [key, item] of Object.entries(cache)) {
        if (now - item.timestamp > item.ttl) {
          delete cache[key];
          hasExpired = true;
        }
      }

      if (hasExpired) {
        localStorage.setItem(this.storageKey, JSON.stringify(cache));
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  // Get cache statistics
  getStats() {
    if (typeof window === 'undefined') return { size: 0, maxSize: 0 };

    try {
      const cache = this.getCache();
      const now = Date.now();
      let expiredCount = 0;

      for (const item of Object.values(cache)) {
        if (now - item.timestamp > item.ttl) {
          expiredCount++;
        }
      }

      return {
        size: Object.keys(cache).length,
        expiredCount,
        validCount: Object.keys(cache).length - expiredCount
      };
    } catch (error) {
      return { size: 0, maxSize: 0, error: error.message };
    }
  }
}

// Global cache instances
export const productsCache = new ClientCacheManager<any>('products-cache', 30 * 60 * 1000); // 30 minutes
export const imagesCache = new ClientCacheManager<any>('images-cache', 60 * 60 * 1000); // 1 hour
export const categoriesCache = new ClientCacheManager<any>('categories-cache', 60 * 60 * 1000); // 1 hour

// Cache utilities
export const cacheUtils = {
  // Clear all caches
  clearAll(): void {
    productsCache.clear();
    imagesCache.clear();
    categoriesCache.clear();
  },

  // Get all cache statistics
  getStats() {
    return {
      products: productsCache.getStats(),
      images: imagesCache.getStats(),
      categories: categoriesCache.getStats()
    };
  },

  // Cleanup all caches
  cleanupAll(): void {
    productsCache.cleanup();
    imagesCache.cleanup();
    categoriesCache.cleanup();
  },

  // Check if cache is available
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }
};

export default ClientCacheManager;
