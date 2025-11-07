/**
 * Performance Monitoring and Analytics System
 * Tracks Core Web Vitals, API performance, and user interactions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  cached: boolean;
}

interface UserInteractionMetric {
  action: string;
  element: string;
  timestamp: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, any> = new Map();
  private apiMetrics: APIPerformanceMetric[] = [];
  private userInteractions: UserInteractionMetric[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeWebVitals();
    this.initializeAPIMonitoring();
    this.initializeUserInteractionTracking();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (metric: PerformanceMetric) => {
      this.recordMetric('lcp', metric.value);
    });

    // Track First Input Delay (FID)
    this.observeMetric('first-input', (metric: PerformanceMetric) => {
      this.recordMetric('fid', metric.processingStart - metric.startTime);
    });

    // Track Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (metric: PerformanceMetric) => {
      if (!metric.hadRecentInput) {
        this.recordMetric('cls', metric.value);
      }
    });

    // Track First Contentful Paint (FCP)
    this.observeMetric('first-contentful-paint', (metric: PerformanceMetric) => {
      this.recordMetric('fcp', metric.value);
    });

    // Track Time to Interactive (TTI)
    this.observeMetric('longtask', (metric: PerformanceMetric) => {
      this.recordMetric('tti', metric.startTime);
    });
  }

  /**
   * Initialize API performance monitoring
   */
  private initializeAPIMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Override fetch to track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      const options = args[1] as RequestInit;

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.recordAPIMetric({
          endpoint: url,
          method: options?.method || 'GET',
          duration,
          status: response.status,
          timestamp: Date.now(),
          cached: response.headers.get('x-cache') === 'HIT'
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.recordAPIMetric({
          endpoint: url,
          method: options?.method || 'GET',
          duration,
          status: 0,
          timestamp: Date.now(),
          cached: false
        });

        throw error;
      }
    };
  }

  /**
   * Initialize user interaction tracking
   */
  private initializeUserInteractionTracking(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordUserInteraction({
        action: 'click',
        element: this.getElementSelector(target),
        timestamp: Date.now()
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      this.recordUserInteraction({
        action: 'submit',
        element: this.getElementSelector(target),
        timestamp: Date.now()
      });
    });

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordUserInteraction({
          action: 'scroll',
          element: 'window',
          timestamp: Date.now()
        });
      }, 100);
    });
  }

  /**
   * Observe performance metrics using Performance Observer
   */
  private observeMetric(entryType: string, callback: (metric: any) => void): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry as any);
        }
      });

      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    });

    console.log(`📊 Performance Metric: ${name} = ${value.toFixed(2)}ms`);
    
    // Send to analytics if available
    this.sendToAnalytics('metric', { name, value });
  }

  /**
   * Record API performance metric
   */
  recordAPIMetric(metric: APIPerformanceMetric): void {
    if (!this.isEnabled) return;

    this.apiMetrics.push(metric);
    
    // Keep only last 100 API metrics
    if (this.apiMetrics.length > 100) {
      this.apiMetrics = this.apiMetrics.slice(-100);
    }

    console.log(`🌐 API Call: ${metric.method} ${metric.endpoint} - ${metric.duration.toFixed(2)}ms (${metric.status})`);
    
    // Send to analytics if available
    this.sendToAnalytics('api', metric);
  }

  /**
   * Record user interaction
   */
  recordUserInteraction(interaction: UserInteractionMetric): void {
    if (!this.isEnabled) return;

    this.userInteractions.push(interaction);
    
    // Keep only last 200 interactions
    if (this.userInteractions.length > 200) {
      this.userInteractions = this.userInteractions.slice(-200);
    }

    console.log(`👆 User Interaction: ${interaction.action} on ${interaction.element}`);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      webVitals: Object.fromEntries(this.metrics),
      apiMetrics: {
        total: this.apiMetrics.length,
        averageDuration: this.getAverageAPIDuration(),
        slowestEndpoint: this.getSlowestEndpoint(),
        errorRate: this.getAPIErrorRate()
      },
      userInteractions: {
        total: this.userInteractions.length,
        mostCommonAction: this.getMostCommonAction(),
        recentInteractions: this.userInteractions.slice(-10)
      }
    };

    return summary;
  }

  /**
   * Get average API duration
   */
  private getAverageAPIDuration(): number {
    if (this.apiMetrics.length === 0) return 0;
    
    const total = this.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.apiMetrics.length;
  }

  /**
   * Get slowest API endpoint
   */
  private getSlowestEndpoint(): { endpoint: string; duration: number } | null {
    if (this.apiMetrics.length === 0) return null;
    
    const slowest = this.apiMetrics.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    
    return {
      endpoint: slowest.endpoint,
      duration: slowest.duration
    };
  }

  /**
   * Get API error rate
   */
  private getAPIErrorRate(): number {
    if (this.apiMetrics.length === 0) return 0;
    
    const errors = this.apiMetrics.filter(metric => metric.status >= 400).length;
    return (errors / this.apiMetrics.length) * 100;
  }

  /**
   * Get most common user action
   */
  private getMostCommonAction(): string | null {
    if (this.userInteractions.length === 0) return null;
    
    const actionCounts = this.userInteractions.reduce((counts, interaction) => {
      counts[interaction.action] = (counts[interaction.action] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(actionCounts).reduce((prev, current) => 
      prev[1] > current[1] ? prev : current
    )[0];
  }

  /**
   * Get element selector for tracking
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Send data to analytics
   */
  private sendToAnalytics(type: string, data: any): void {
    if (typeof window === 'undefined') return;

    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_type: type,
        metric_data: data
      });
    }

    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data })
      }).catch(() => {
        // Silently fail analytics
      });
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.apiMetrics = [];
    this.userInteractions = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      summary: this.getPerformanceSummary(),
      rawMetrics: Object.fromEntries(this.metrics),
      apiMetrics: this.apiMetrics,
      userInteractions: this.userInteractions
    }, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const trackPageLoad = (pageName: string): void => {
  performanceMonitor.recordMetric('page_load', performance.now());
  console.log(`📄 Page loaded: ${pageName}`);
};

export const trackUserAction = (action: string, element: string): void => {
  performanceMonitor.recordUserInteraction({
    action,
    element,
    timestamp: Date.now()
  });
};

export const trackAPICall = (endpoint: string, duration: number, status: number): void => {
  performanceMonitor.recordAPIMetric({
    endpoint,
    method: 'GET',
    duration,
    status,
    timestamp: Date.now(),
    cached: false
  });
};

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState(performanceMonitor.getPerformanceSummary());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getPerformanceSummary());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    clearMetrics: () => performanceMonitor.clearMetrics(),
    exportMetrics: () => performanceMonitor.exportMetrics()
  };
};

export default performanceMonitor;
