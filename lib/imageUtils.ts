/**
 * Utility functions for Nhost image optimization
 * Based on Nhost Storage Image Transformation API
 * @see https://docs.nhost.io/products/storage/overview#image-transformation
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Generate optimized image URL with Nhost image transformation
 * @param imageId - The file ID from Nhost storage
 * @param options - Transformation options (width, height)
 * @returns Optimized image URL with query parameters
 */
/**
 * Generate full image URL using ERPNext domain
 * @param imagePath - The image path from ERPNext
 * @returns Full image URL or placeholder
 */
export const getFullImageUrl = (imagePath: string | undefined): string | null => {
  if (!imagePath) return null;
  return `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}${imagePath}`;
};

export const getOptimizedImageUrl = (
  imageId: string | undefined,
  options: ImageTransformOptions = {}
): string => {
  if (!imageId) {
    return "/placeholder.svg";
  }

  // Use our optimized image API for better performance
  const params = new URLSearchParams();
  params.append('image_id', imageId);
  
  if (options.width) {
    params.append('w', options.width.toString());
  }
  
  if (options.height) {
    params.append('h', options.height.toString());
  }

  if (options.quality) {
    params.append('q', options.quality.toString());
  }

  return `/api/optimized-image?${params.toString()}`;
};

/**
 * Predefined image sizes for common use cases
 */
export const IMAGE_SIZES = {
  // Thumbnails
  THUMB_SMALL: { width: 64, height: 64 },
  THUMB_MEDIUM: { width: 128, height: 128 },
  THUMB_LARGE: { width: 160, height: 160 },
  
  // Product images
  PRODUCT_CARD: { width: 400, height: 400 },
  PRODUCT_DETAIL: { width: 800, height: 800 },
  
  // Category images
  CATEGORY: { width: 300, height: 300 },
  
  // Hero images - usually wider
  HERO_SMALL: { width: 800, height: 400 },
  HERO_LARGE: { width: 1200, height: 600 },
} as const;

/**
 * Generate multiple image sizes for responsive design
 * @param imageId - The file ID from Nhost storage
 * @returns Object with different sized image URLs
 */
export const getResponsiveImageUrls = (imageId: string | undefined) => {
  return {
    thumb: getOptimizedImageUrl(imageId, IMAGE_SIZES.THUMB_MEDIUM),
    card: getOptimizedImageUrl(imageId, IMAGE_SIZES.PRODUCT_CARD),
    detail: getOptimizedImageUrl(imageId, IMAGE_SIZES.PRODUCT_DETAIL),
    original: getOptimizedImageUrl(imageId),
  };
};
