/**
 * Advanced Image Optimization System
 * Implements WebP conversion, responsive images, lazy loading, and CDN integration
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
}

interface OptimizedImageConfig {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
  priority: boolean;
  placeholder?: string;
}

class ImageOptimizer {
  private baseUrl: string;
  private cdnUrl: string;
  private defaultQuality: number;
  private supportedFormats: string[];

  constructor() {
    this.baseUrl = process.env.ERP_NEXT_URL || 'https://erp.krallaser.com';
    this.cdnUrl = process.env.CDN_URL || this.baseUrl;
    this.defaultQuality = 85;
    this.supportedFormats = ['webp', 'avif', 'jpeg', 'png'];
  }

  /**
   * Generate optimized image URL with multiple formats and sizes
   */
  generateOptimizedUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): OptimizedImageConfig {
    const {
      width = 400,
      height = 400,
      quality = this.defaultQuality,
      format = 'webp',
      blur = false,
      lazy = true,
      priority = false,
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    } = options;

    // Handle different image sources
    const imageUrl = this.normalizeImageUrl(originalUrl);
    
    // Generate responsive srcSet for different screen sizes
    const breakpoints = [320, 640, 768, 1024, 1200, 1920];
    const srcSet = this.generateSrcSet(imageUrl, breakpoints, quality, format);
    
    // Generate blur placeholder
    const placeholder = blur ? this.generateBlurPlaceholder(width, height) : undefined;
    
    // Generate optimized main URL
    const optimizedUrl = this.buildImageUrl(imageUrl, {
      width,
      height,
      quality,
      format,
      blur: blur ? 10 : 0
    });

    return {
      src: optimizedUrl,
      srcSet,
      sizes,
      alt: this.extractAltText(originalUrl),
      width,
      height,
      loading: lazy ? 'lazy' : 'eager',
      priority,
      placeholder
    };
  }

  /**
   * Generate multiple format support (WebP, AVIF, JPEG fallback)
   */
  generateMultiFormatSrcSet(
    originalUrl: string,
    breakpoints: number[],
    quality: number = this.defaultQuality
  ): string {
    const formats = ['avif', 'webp', 'jpeg'];
    const srcSetParts: string[] = [];

    formats.forEach(format => {
      const formatSrcSet = breakpoints
        .map(width => {
          const url = this.buildImageUrl(originalUrl, {
            width,
            height: Math.round(width * 0.75), // 4:3 aspect ratio
            quality,
            format
          });
          return `${url} ${width}w`;
        })
        .join(', ');
      
      srcSetParts.push(`${formatSrcSet} type="${this.getMimeType(format)}"`);
    });

    return srcSetParts.join(', ');
  }

  /**
   * Generate blur placeholder for better UX
   */
  generateBlurPlaceholder(width: number, height: number): string {
    // Generate a simple base64 blur placeholder
    const canvas = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
        Loading...
      </text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
  }

  /**
   * Build optimized image URL with parameters
   */
  private buildImageUrl(
    originalUrl: string, 
    params: {
      width: number;
      height: number;
      quality: number;
      format: string;
      blur?: number;
    }
  ): string {
    const url = new URL(originalUrl, this.cdnUrl);
    
    // Add optimization parameters
    url.searchParams.set('w', params.width.toString());
    url.searchParams.set('h', params.height.toString());
    url.searchParams.set('q', params.quality.toString());
    url.searchParams.set('f', params.format);
    
    if (params.blur) {
      url.searchParams.set('blur', params.blur.toString());
    }
    
    // Add cache busting for development
    if (process.env.NODE_ENV === 'development') {
      url.searchParams.set('t', Date.now().toString());
    }
    
    return url.toString();
  }

  /**
   * Generate responsive srcSet
   */
  private generateSrcSet(
    originalUrl: string,
    breakpoints: number[],
    quality: number,
    format: string
  ): string {
    return breakpoints
      .map(width => {
        const url = this.buildImageUrl(originalUrl, {
          width,
          height: Math.round(width * 0.75),
          quality,
          format
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Normalize image URL to handle different sources
   */
  private normalizeImageUrl(url: string): string {
    if (!url) return '';
    
    // Handle relative URLs
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }
    
    // Handle ERPNext file URLs
    if (url.includes('/files/')) {
      return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }
    
    // Return as-is if already absolute URL
    return url;
  }

  /**
   * Extract alt text from URL or filename
   */
  private extractAltText(url: string): string {
    if (!url) return 'Product image';
    
    const filename = url.split('/').pop()?.split('.')[0] || '';
    return filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'webp': 'image/webp',
      'avif': 'image/avif',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };
    
    return mimeTypes[format] || 'image/jpeg';
  }

  /**
   * Preload critical images
   */
  preloadImages(imageUrls: string[], options: ImageOptimizationOptions = {}): void {
    imageUrls.forEach(url => {
      const optimized = this.generateOptimizedUrl(url, {
        ...options,
        priority: true,
        lazy: false
      });
      
      // Create preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimized.src;
      if (optimized.srcSet) {
        (link as any).imageSrcset = optimized.srcSet;
      }
      if (optimized.sizes) {
        (link as any).imageSizes = optimized.sizes;
      }
      document.head.appendChild(link);
    });
  }

  /**
   * Generate image dimensions for responsive layout
   */
  generateResponsiveDimensions(
    aspectRatio: number = 0.75,
    maxWidth: number = 1200
  ): { width: number; height: number }[] {
    const breakpoints = [320, 640, 768, 1024, 1200];
    
    return breakpoints
      .filter(width => width <= maxWidth)
      .map(width => ({
        width,
        height: Math.round(width * aspectRatio)
      }));
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();

// Utility functions for common use cases
export const optimizeProductImage = (
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageConfig => {
  return imageOptimizer.generateOptimizedUrl(imageUrl, {
    width: 400,
    height: 400,
    quality: 85,
    format: 'webp',
    lazy: true,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
    ...options
  });
};

export const optimizeHeroImage = (
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageConfig => {
  return imageOptimizer.generateOptimizedUrl(imageUrl, {
    width: 1200,
    height: 600,
    quality: 90,
    format: 'webp',
    lazy: false,
    priority: true,
    sizes: '100vw',
    ...options
  });
};

export const optimizeThumbnailImage = (
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageConfig => {
  return imageOptimizer.generateOptimizedUrl(imageUrl, {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp',
    lazy: true,
    sizes: '(max-width: 768px) 50vw, 150px',
    ...options
  });
};

// Performance monitoring
export const imagePerformance = {
  trackImageLoad: (imageUrl: string, loadTime: number): void => {
    console.log(`📸 Image loaded: ${imageUrl} in ${loadTime}ms`);
    
    // Send to analytics if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_load', {
        image_url: imageUrl,
        load_time: loadTime
      });
    }
  },

  trackImageError: (imageUrl: string, error: string): void => {
    console.error(`❌ Image failed to load: ${imageUrl}`, error);
    
    // Send to error tracking if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_error', {
        image_url: imageUrl,
        error_message: error
      });
    }
  }
};

export default imageOptimizer;
