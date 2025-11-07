/**
 * Image caching utility for optimized image loading
 * Provides in-memory caching and localStorage persistence
 */

interface CachedImage {
  url: string;
  timestamp: number;
  expiresAt: number;
  size: number;
}

interface ImageCacheOptions {
  maxSize?: number; // Maximum cache size in MB
  ttl?: number; // Time to live in milliseconds
  persist?: boolean; // Whether to persist to localStorage
}

class ImageCache {
  private cache = new Map<string, CachedImage>();
  private maxSize: number;
  private ttl: number;
  private persist: boolean;
  private readonly STORAGE_KEY = 'image-cache';

  constructor(options: ImageCacheOptions = {}) {
    this.maxSize = (options.maxSize || 50) * 1024 * 1024; // Convert MB to bytes
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    this.persist = options.persist ?? true;

    if (this.persist) {
      this.loadFromStorage();
    }
  }

  /**
   * Get cached image URL
   */
  get(imageId: string): string | null {
    const cached = this.cache.get(imageId);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.delete(imageId);
      return null;
    }
    
    return cached.url;
  }

  /**
   * Set cached image URL
   */
  set(imageId: string, url: string, size: number = 0): void {
    const now = Date.now();
    const cached: CachedImage = {
      url,
      timestamp: now,
      expiresAt: now + this.ttl,
      size
    };

    this.cache.set(imageId, cached);
    
    // Check cache size and clean up if necessary
    this.cleanup();
    
    if (this.persist) {
      this.saveToStorage();
    }
  }

  /**
   * Delete cached image
   */
  delete(imageId: string): void {
    this.cache.delete(imageId);
    if (this.persist) {
      this.saveToStorage();
    }
  }

  /**
   * Clear all cached images
   */
  clear(): void {
    this.cache.clear();
    if (this.persist) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, cached) => sum + cached.size, 0);
    
    return {
      count: this.cache.size,
      totalSize,
      maxSize: this.maxSize,
      usage: (totalSize / this.maxSize) * 100
    };
  }

  /**
   * Clean up expired and oversized cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, cached]) => {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    });

    // Check size limit
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, cached) => sum + cached.size, 0);
    
    if (totalSize > this.maxSize) {
      // Remove oldest entries first
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      let currentSize = totalSize;
      for (const [key, cached] of sortedEntries) {
        this.cache.delete(key);
        currentSize -= cached.size;
        
        if (currentSize <= this.maxSize * 0.8) { // Keep 80% of max size
          break;
        }
      }
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired entries
        Object.entries(data).forEach(([key, cached]: [string, any]) => {
          if (now < cached.expiresAt) {
            this.cache.set(key, cached);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load image cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save image cache to storage:', error);
    }
  }
}

// Global cache instance
export const imageCache = new ImageCache({
  maxSize: 50, // 50MB
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  persist: true
});

/**
 * Enhanced image URL generation with caching
 */
export const getCachedOptimizedUrl = (
  imageId: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string => {
  if (!imageId || imageId === '/placeholder.svg') {
    return '/placeholder.svg';
  }

  // Create cache key based on image ID and options
  const cacheKey = `${imageId}-${options.width || 400}-${options.height || 400}-${options.quality || 80}`;
  
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate optimized URL
  const params = new URLSearchParams();
  params.append('image_id', imageId);
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());

  const optimizedUrl = `/api/optimized-image?${params.toString()}`;
  
  // Cache the URL
  imageCache.set(cacheKey, optimizedUrl);
  
  return optimizedUrl;
};

/**
 * Preload images with caching
 */
export const preloadImages = async (imageIds: string[], options = {}) => {
  const preloadPromises = imageIds.map(async (imageId) => {
    if (!imageId || imageId === '/placeholder.svg') return;
    
    const url = getCachedOptimizedUrl(imageId, options);
    
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't fail the whole batch
      img.src = url;
    });
  });

  await Promise.all(preloadPromises);
};

export default imageCache;
