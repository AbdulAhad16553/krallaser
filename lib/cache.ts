/**
 * High-Performance Caching System
 * Implements in-memory caching with TTL, LRU eviction, and cache warming
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  enableLRU?: boolean; // Enable Least Recently Used eviction
}

class CacheManager<T> {
  private cache = new Map<string, CacheItem<T>>();
  private readonly defaultTTL: number;
  private readonly maxSize: number;
  private readonly enableLRU: boolean;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.enableLRU = options.enableLRU ?? true;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.defaultTTL;

    // Remove expired items before adding new ones
    this.cleanup();

    // If cache is full and LRU is enabled, remove least recently used item
    if (this.cache.size >= this.maxSize && this.enableLRU) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let totalAccessCount = 0;
    let expiredCount = 0;

    for (const item of this.cache.values()) {
      totalAccessCount += item.accessCount;
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccessCount,
      expiredCount,
      hitRate: totalAccessCount > 0 ? (totalAccessCount - expiredCount) / totalAccessCount : 0
    };
  }
}

// Global cache instances for different data types
export const productCache = new CacheManager<any>({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 500,
  enableLRU: true
});

export const categoryCache = new CacheManager<any>({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 100,
  enableLRU: true
});

export const stockCache = new CacheManager<any>({
  ttl: 2 * 60 * 1000, // 2 minutes (stock changes frequently)
  maxSize: 1000,
  enableLRU: true
});

export const priceCache = new CacheManager<any>({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 1000,
  enableLRU: true
});

// Cache warming utilities
export const cacheWarmup = {
  async warmProducts(): Promise<void> {
    try {
      console.log('🔥 Warming product cache...');
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.products) {
        // Cache individual products
        data.products.forEach((product: any) => {
          productCache.set(`product-${product.id}`, product);
        });
        
        // Cache the full product list
        productCache.set('products-list', data.products);
        console.log(`✅ Cached ${data.products.length} products`);
      }
    } catch (error) {
      console.error('❌ Failed to warm product cache:', error);
    }
  },

  async warmCategories(): Promise<void> {
    try {
      console.log('🔥 Warming category cache...');
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.categories) {
        categoryCache.set('categories-list', data.categories);
        console.log(`✅ Cached ${data.categories.length} categories`);
      }
    } catch (error) {
      console.error('❌ Failed to warm category cache:', error);
    }
  },

  async warmAll(): Promise<void> {
    console.log('🚀 Starting cache warmup...');
    await Promise.all([
      this.warmProducts(),
      this.warmCategories()
    ]);
    console.log('✅ Cache warmup completed');
  }
};

// Cache invalidation utilities
export const cacheInvalidation = {
  invalidateProduct(productId: string): void {
    productCache.delete(`product-${productId}`);
    productCache.delete('products-list');
    console.log(`🗑️ Invalidated cache for product: ${productId}`);
  },

  invalidateCategory(categoryId: string): void {
    categoryCache.delete(`category-${categoryId}`);
    categoryCache.delete('categories-list');
    console.log(`🗑️ Invalidated cache for category: ${categoryId}`);
  },

  invalidateStock(itemCode: string): void {
    stockCache.delete(`stock-${itemCode}`);
    console.log(`🗑️ Invalidated stock cache for item: ${itemCode}`);
  },

  invalidateAll(): void {
    productCache.clear();
    categoryCache.clear();
    stockCache.clear();
    priceCache.clear();
    console.log('🗑️ Cleared all caches');
  }
};

// Performance monitoring
export const cacheMonitor = {
  getStats() {
    return {
      products: productCache.getStats(),
      categories: categoryCache.getStats(),
      stock: stockCache.getStats(),
      prices: priceCache.getStats()
    };
  },

  logStats(): void {
    const stats = this.getStats();
    console.log('📊 Cache Statistics:', stats);
  }
};

export default CacheManager;
