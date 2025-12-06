// /**
//  * Utility functions for ERPNext image handling
//  * Uses direct ERPNext domain URLs for instant image preview
//  */

// /**
//  * Generate direct ERPNext image URL for instant preview
//  * @param imagePath - The image path from ERPNext API
//  * @returns Direct ERPNext URL or placeholder
//  */
// export const getErpnextImageUrl = (imagePath: string | undefined): string => {
//   if (!imagePath) return '/placeholder.svg';
  
//   const erpnextDomain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
//   if (!erpnextDomain) return '/placeholder.svg';
  
//   return `https://${erpnextDomain}${imagePath}`;
// };

// /**
//  * Generate multiple ERPNext image URLs for different use cases
//  * @param imagePath - The image path from ERPNext API
//  * @returns Object with different image URLs
//  */
// export const getErpnextImageUrls = (imagePath: string | undefined) => {
//   const baseUrl = getErpnextImageUrl(imagePath);
  
//   return {
//     original: baseUrl,
//     preview: baseUrl,
//     thumbnail: baseUrl,
//     // All URLs are the same since we're using direct ERPNext URLs
//     optimized: baseUrl
//   };
// };

// /**
//  * Check if image path is valid
//  * @param imagePath - The image path to validate
//  * @returns Boolean indicating if path is valid
//  */
// export const isValidImagePath = (imagePath: string | undefined): boolean => {
//   return !!(imagePath && imagePath.trim() !== '');
// };

// /**
//  * Generate image preview URL with fallback
//  * @param imagePath - The image path from ERPNext API
//  * @param fallbackUrl - Fallback URL if image path is invalid
//  * @returns Image URL or fallback
//  */
// export const getImagePreviewUrl = (
//   imagePath: string | undefined, 
//   fallbackUrl: string = '/placeholder.svg'
// ): string => {
//   if (!isValidImagePath(imagePath)) {
//     return fallbackUrl;
//   }
  
//   return getErpnextImageUrl(imagePath);
// };

// export default {
//   getErpnextImageUrl,
//   getErpnextImageUrls,
//   isValidImagePath,
//   getImagePreviewUrl
// };
/**
 * Utility functions for ERPNext image & attachment handling
 * Supports:
 * - item.image
 * - file_url from attachments
 * - public & private file paths
 */

/**
 * Generate fully qualified ERPNext URL for image or attachment
 * @param filePath - The path from ERPNext e.g. /files/a.png or /private/files/a.png
 * @returns Full URL e.g. https://yourdomain.com/files/a.png
 */
export const getErpnextFileUrl = (filePath?: string): string => {
  if (!filePath) return '/placeholder.svg';

  const domain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
  if (!domain) return '/placeholder.svg';

  // If ERPNext returns a full URL already (rare), don't double-prepend
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  return `https://${domain}${filePath}`;
};

/**
 * Generate complete image URL handlers for items and attachments
 */
export const getErpnextImageUrl = (imagePath?: string): string => {
  return getErpnextFileUrl(imagePath);
};

/**
 * Generate all variations of file/image URLs
 */
export const getErpnextFileUrls = (path?: string) => {
  const full = getErpnextFileUrl(path);

  return {
    original: full,
    preview: full,
    thumbnail: full,
    optimized: full
  };
};

/**
 * Check if path is valid
 */
export const isValidPath = (path?: string): boolean => {
  return !!(path && path.trim() !== '');
};

/**
 * Image preview with fallback
 */
export const getImagePreviewUrl = (
  imagePath?: string,
  fallbackUrl: string = '/placeholder.svg'
): string => {
  if (!isValidPath(imagePath)) return fallbackUrl;
  return getErpnextFileUrl(imagePath);
};

/**
 * Extract attachment URLs from ERPNext Item response
 * Example response:
 *  item.attachments = [{ file_url: "/files/a.png" }, { file_url: "/files/b.pdf" }]
 */
export const getAttachmentUrls = (
  attachments: Array<{ file_url: string }> | undefined
): string[] => {
  if (!attachments || attachments.length === 0) return [];

  return attachments.map(att => getErpnextFileUrl(att.file_url));
};

export default {
  getErpnextFileUrl,
  getErpnextImageUrl,
  getErpnextFileUrls,
  isValidPath,
  getImagePreviewUrl,
  getAttachmentUrls
};
