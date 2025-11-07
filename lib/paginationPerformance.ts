/**
 * Pagination Performance Monitoring
 * Tracks pagination performance metrics and optimizations
 */

interface PaginationMetrics {
  pageLoadTime: number;
  cacheHitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  lastPageLoad: number;
}

class PaginationPerformanceMonitor {
  private metrics: PaginationMetrics = {
    pageLoadTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    lastPageLoad: 0
  };

  private requestTimes: number[] = [];
  private cacheHits = 0;
  private totalRequests = 0;

  /**
   * Track page load performance
   */
  trackPageLoad(loadTime: number, cached: boolean = false): void {
    this.metrics.pageLoadTime = loadTime;
    this.metrics.lastPageLoad = Date.now();
    this.requestTimes.push(loadTime);
    this.totalRequests++;
    
    if (cached) {
      this.cacheHits++;
    }

    // Update metrics
    this.updateMetrics();
    
    console.log(`📊 Pagination Performance:`, {
      loadTime: `${loadTime}ms`,
      cached,
      cacheHitRate: `${this.metrics.cacheHitRate.toFixed(1)}%`,
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`
    });
  }

  /**
   * Track cache performance
   */
  trackCacheHit(): void {
    this.cacheHits++;
    this.totalRequests++;
    this.updateMetrics();
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(): void {
    this.totalRequests++;
    this.updateMetrics();
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    this.metrics.totalRequests = this.totalRequests;
    this.metrics.cacheHitRate = this.totalRequests > 0 ? (this.cacheHits / this.totalRequests) * 100 : 0;
    this.metrics.averageResponseTime = this.requestTimes.length > 0 
      ? this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length 
      : 0;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PaginationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    const { cacheHitRate, averageResponseTime, totalRequests } = this.metrics;
    
    let performanceGrade = 'A';
    if (averageResponseTime > 500) performanceGrade = 'B';
    if (averageResponseTime > 1000) performanceGrade = 'C';
    if (averageResponseTime > 2000) performanceGrade = 'D';

    return `Performance Grade: ${performanceGrade} | Cache Hit Rate: ${cacheHitRate.toFixed(1)}% | Avg Response: ${averageResponseTime.toFixed(0)}ms | Requests: ${totalRequests}`;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      cacheHitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      lastPageLoad: 0
    };
    this.requestTimes = [];
    this.cacheHits = 0;
    this.totalRequests = 0;
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const { cacheHitRate, averageResponseTime } = this.metrics;

    if (cacheHitRate < 70) {
      suggestions.push('Consider increasing cache TTL for better hit rates');
    }

    if (averageResponseTime > 500) {
      suggestions.push('Consider implementing database indexing');
    }

    if (averageResponseTime > 1000) {
      suggestions.push('Consider implementing Redis caching');
    }

    if (this.totalRequests > 100 && cacheHitRate < 50) {
      suggestions.push('Consider preloading popular pages');
    }

    return suggestions;
  }
}

// Export singleton instance
export const paginationPerformance = new PaginationPerformanceMonitor();

// Utility functions
export const trackPaginationPerformance = (loadTime: number, cached: boolean = false) => {
  paginationPerformance.trackPageLoad(loadTime, cached);
};

export const trackPaginationCacheHit = () => {
  paginationPerformance.trackCacheHit();
};

export const trackPaginationCacheMiss = () => {
  paginationPerformance.trackCacheMiss();
};

export const getPaginationMetrics = () => {
  return paginationPerformance.getMetrics();
};

export const getPaginationSummary = () => {
  return paginationPerformance.getPerformanceSummary();
};

export default paginationPerformance;
