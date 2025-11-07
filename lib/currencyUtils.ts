/**
 * Utility functions for currency formatting and display
 */

/**
 * Cleans up currency strings by removing the prefix and keeping only the symbol
 * Examples:
 * - "PKR - Rs" → "Rs"
 * - "USD - $" → "$"
 * - "EUR - €" → "€"
 * - "GBP - £" → "£"
 * @param currencyString - The full currency string from the database
 * @returns Clean currency symbol
 */
export function cleanCurrencySymbol(currencyString: string): string {
  if (!currencyString) return "";
  
  // Split by " - " and take the last part (the symbol)
  const parts = currencyString.split(" - ");
  return parts[parts.length - 1] || currencyString;
}

/**
 * Formats a price with the cleaned currency symbol
 * @param price - The price value
 * @param currencyString - The full currency string from the database
 * @returns Formatted price string
 */
export function formatPrice(price: number | string | null | undefined, currencyString: string): string {
  if (price === null || price === undefined || price === "") return "Price not available";
  
  const cleanSymbol = cleanCurrencySymbol(currencyString);
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return "Invalid price";
  
  return `${cleanSymbol}${numericPrice.toFixed(2)}`;
}

/**
 * Gets the effective price (sale price if available, otherwise base price)
 * For products with variations, returns the lowest price among all variations
 * @param product - Product object with base_price and sale_price
 * @returns The effective price to display
 */
export function getEffectivePrice(product: any): number {
  if (!product) return 0;
  
  // If product has variations, find the lowest price among all variations
  if (product.product_variations && product.product_variations.length > 0) {
    let lowestPrice = Infinity;
    
    product.product_variations.forEach((variation: any) => {
      // Try multiple price fields for variations
      const prices = [
        variation.sale_price,
        variation.base_price,
        variation.price,
        variation.standard_rate
      ].filter(price => price !== null && price !== undefined && price > 0);
      
      if (prices.length > 0) {
        const effectiveVariationPrice = Math.min(...prices);
        lowestPrice = Math.min(lowestPrice, effectiveVariationPrice);
      }
    });
    
    // If we found a valid price from variations, return it
    if (lowestPrice !== Infinity) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`💰 Effective price for ${product.name} (from variations): ${lowestPrice}`);
      }
      return lowestPrice;
    }
  }
  
  // If no variations or no valid variation prices, check product-level prices
  // Check if sale_price is set and is a valid positive number
  if (product.sale_price !== null && product.sale_price !== undefined && product.sale_price > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`💰 Effective price for ${product.name} (sale_price): ${product.sale_price}`);
    }
    return product.sale_price;
  }
  
  // If no valid sale price, use base_price
  if (product.base_price !== null && product.base_price !== undefined && product.base_price > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`💰 Effective price for ${product.name} (base_price): ${product.base_price}`);
    }
    return product.base_price;
  }
  
  // Fallback to 0 if neither price is available
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ No valid price found for ${product.name}`);
  }
  return 0;
}

/**
 * Calculates discount percentage
 * @param basePrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage (0 if no discount)
 */
export function calculateDiscountPercent(basePrice: number, salePrice: number): number {
  if (!basePrice || !salePrice || salePrice >= basePrice) return 0;
  
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
}

/**
 * Gets the base price for display purposes (for showing crossed-out price when there's a discount)
 * For products with variations, returns the highest base price among all variations
 * @param product - Product object
 * @returns The base price to display
 */
export function getBasePriceForDisplay(product: any): number {
  if (!product) return 0;
  
  // If product has variations, find the highest base price among all variations
  if (product.product_variations && product.product_variations.length > 0) {
    let highestBasePrice = 0;
    
    product.product_variations.forEach((variation: any) => {
      if (variation.base_price !== null && 
          variation.base_price !== undefined && 
          variation.base_price > 0) {
        highestBasePrice = Math.max(highestBasePrice, variation.base_price);
      }
    });
    
    // If we found a valid base price from variations, return it
    if (highestBasePrice > 0) {
      return highestBasePrice;
    }
  }
  
  // If no variations or no valid variation base prices, use product-level base price
  if (product.base_price !== null && product.base_price !== undefined && product.base_price > 0) {
    return product.base_price;
  }
  
  return 0;
}

/**
 * Checks if a product has a discount
 * For products with variations, checks if any variation has a discount
 * @param product - Product object
 * @returns True if product has a discount
 */
export function hasDiscount(product: any): boolean {
  if (!product) return false;
  
  // If product has variations, check if any variation has a discount
  if (product.product_variations && product.product_variations.length > 0) {
    return product.product_variations.some((variation: any) => {
      return variation.sale_price !== null && 
             variation.sale_price !== undefined && 
             variation.sale_price > 0 && 
             variation.base_price > 0 &&
             variation.sale_price < variation.base_price;
    });
  }
  
  // Check product-level discount
  if (product.sale_price !== null && 
      product.sale_price !== undefined && 
      product.sale_price > 0 && 
      product.base_price > 0 &&
      product.sale_price < product.base_price) {
    return true;
  }
  
  return false;
}

/**
 * Gets the price range for products with variations
 * @param product - Product object
 * @returns Object with min and max prices, or null if no variations
 */
export function getPriceRange(product: any): { min: number; max: number } | null {
  if (!product) return null;
  
  // First check if we already have a calculated price_range from the API
  if (product.price_range && product.price_range.min && product.price_range.max) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Using API price_range for ${product.name}:`, product.price_range);
    }
    return product.price_range;
  }
  
  // Fallback: calculate from variations
  if (!product.product_variations || product.product_variations.length === 0) {
    return null;
  }
  
  let minPrice = Infinity;
  let maxPrice = 0;
  let validPrices: number[] = [];
  
  product.product_variations.forEach((variation: any) => {
    // Try multiple price fields
    const prices = [
      variation.sale_price,
      variation.base_price,
      variation.price,
      variation.standard_rate
    ].filter(price => price !== null && price !== undefined && price > 0);
    
    if (prices.length > 0) {
      const effectivePrice = Math.min(...prices);
      validPrices.push(effectivePrice);
      minPrice = Math.min(minPrice, effectivePrice);
      maxPrice = Math.max(maxPrice, effectivePrice);
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Calculated price range for ${product.name}:`, {
      validPrices,
      minPrice: minPrice === Infinity ? 'No valid prices' : minPrice,
      maxPrice,
      variations: product.product_variations.length
    });
  }
  
  if (minPrice === Infinity || maxPrice === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ No valid prices found for ${product.name}`);
    }
    return null;
  }
  
  return { min: minPrice, max: maxPrice };
}

/**
 * Formats price range for display
 * @param priceRange - Price range object
 * @param currencyString - Currency string
 * @returns Formatted price range string
 */
export function formatPriceRange(priceRange: { min: number; max: number } | null, currencyString: string): string {
  if (!priceRange) return "Price not available";
  
  if (priceRange.min === priceRange.max) {
    return formatPrice(priceRange.min, currencyString);
  }
  
  return `${formatPrice(priceRange.min, currencyString)} - ${formatPrice(priceRange.max, currencyString)}`;
}
