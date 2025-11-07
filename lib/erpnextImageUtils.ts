/**
 * Utility functions for ERPNext image handling
 * Uses direct ERPNext domain URLs for instant image preview
 */

/**
 * Generate direct ERPNext image URL for instant preview
 * @param imagePath - The image path from ERPNext API
 * @returns Direct ERPNext URL or placeholder
 */
export const getErpnextImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/placeholder.svg';
  
  const erpnextDomain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
  if (!erpnextDomain) return '/placeholder.svg';
  
  return `https://${erpnextDomain}${imagePath}`;
};

/**
 * Generate multiple ERPNext image URLs for different use cases
 * @param imagePath - The image path from ERPNext API
 * @returns Object with different image URLs
 */
export const getErpnextImageUrls = (imagePath: string | undefined) => {
  const baseUrl = getErpnextImageUrl(imagePath);
  
  return {
    original: baseUrl,
    preview: baseUrl,
    thumbnail: baseUrl,
    // All URLs are the same since we're using direct ERPNext URLs
    optimized: baseUrl
  };
};

/**
 * Check if image path is valid
 * @param imagePath - The image path to validate
 * @returns Boolean indicating if path is valid
 */
export const isValidImagePath = (imagePath: string | undefined): boolean => {
  return !!(imagePath && imagePath.trim() !== '');
};

/**
 * Generate image preview URL with fallback
 * @param imagePath - The image path from ERPNext API
 * @param fallbackUrl - Fallback URL if image path is invalid
 * @returns Image URL or fallback
 */
export const getImagePreviewUrl = (
  imagePath: string | undefined, 
  fallbackUrl: string = '/placeholder.svg'
): string => {
  if (!isValidImagePath(imagePath)) {
    return fallbackUrl;
  }
  
  return getErpnextImageUrl(imagePath);
};

export default {
  getErpnextImageUrl,
  getErpnextImageUrls,
  isValidImagePath,
  getImagePreviewUrl
};
