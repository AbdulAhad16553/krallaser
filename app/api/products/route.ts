import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/erpnext/services/productService';
import { erpnextClient } from '@/lib/erpnext/erpnextClient';
import { productCache, stockCache, priceCache } from '@/lib/cache';
import { trackPaginationPerformance, trackPaginationCacheHit, trackPaginationCacheMiss } from '@/lib/paginationPerformance';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    // Create cache key with pagination
    const cacheKey = `products-page-${page}-limit-${limit}`;
    const cachedProducts = productCache.get(cacheKey);
    
    if (cachedProducts) {
      console.log(`⚡ Serving products page ${page} from cache`);
      const loadTime = Date.now() - startTime;
      trackPaginationPerformance(loadTime, true);
      trackPaginationCacheHit();
      
      return NextResponse.json({ 
        products: cachedProducts.products,
        pagination: cachedProducts.pagination,
        cached: true,
        loadTime
      });
    }

    console.log(`🔄 Fetching products page ${page} (${limit} items) from ERPNext...`);
    
    // Fetch products from ERPNext with pagination
    const products = await productService.getProducts({ disabled: 0 }, limit, offset);
    
    // Batch fetch all prices and stock data to avoid N+1 queries
    const productCodes = products.map(p => p.name);
    const variantCodes = products.flatMap(p => 
      p.has_variants && (p as any).variants 
        ? (p as any).variants.map((v: any) => v.name)
        : []
    );
    const allItemCodes = [...productCodes, ...variantCodes];

    // Batch fetch prices
    const pricePromises = allItemCodes.map(async (itemCode) => {
      const cacheKey = `price-${itemCode}`;
      const cached = priceCache.get(cacheKey);
      if (cached) return { itemCode, price: cached };
      
      try {
        const { data: prices } = await erpnextClient.getList<any>(
          "Item Price",
          { item_code: itemCode },
          ["price_list_rate", "currency"],
          1
        );
        
        const priceData = prices && prices.length > 0 
          ? { price_list_rate: prices[0].price_list_rate || 0, currency: prices[0].currency || 'PKR' }
          : { price_list_rate: 0, currency: 'PKR' };
          
        priceCache.set(cacheKey, priceData, 15 * 60 * 1000); // 15 minutes
        return { itemCode, price: priceData };
      } catch (error) {
        return { itemCode, price: { price_list_rate: 0, currency: 'PKR' } };
      }
    });

    // Batch fetch stock data
    const stockPromises = allItemCodes.map(async (itemCode) => {
      const cacheKey = `stock-${itemCode}`;
      const cached = stockCache.get(cacheKey);
      if (cached) return { itemCode, stock: cached };
      
      try {
        const { data: stockData } = await erpnextClient.getItemStock(itemCode);
        const stockInfo = stockData && stockData.length > 0 
          ? {
              totalStock: stockData.reduce((total: number, bin: any) => total + (bin.actual_qty || 0), 0),
              bins: stockData
            }
          : null;
          
        stockCache.set(cacheKey, stockInfo, 2 * 60 * 1000); // 2 minutes
        return { itemCode, stock: stockInfo };
      } catch (error) {
        return { itemCode, stock: null };
      }
    });

    // Execute all batch operations in parallel
    const [priceResults, stockResults] = await Promise.all([
      Promise.all(pricePromises),
      Promise.all(stockPromises)
    ]);

    // Create lookup maps for O(1) access
    const priceMap = new Map(priceResults.map(r => [r.itemCode, r.price]));
    const stockMap = new Map(stockResults.map(r => [r.itemCode, r.stock]));

    // Transform ERPNext products to match frontend interface
    const transformedProducts = products.map((product, index) => {
      // Get price from lookup map (O(1) access)
      const priceData = priceMap.get(product.name) || { price_list_rate: product.standard_rate || 0, currency: 'PKR' };
      const itemPrice = Number(priceData.price_list_rate) || 0;
      const currency = priceData.currency || 'PKR';

      // Get stock information from lookup map (O(1) access)
      const stockInfo = stockMap.get(product.name) || null;
      
      // Handle variations (using lookup maps for O(1) access)
      let variations = [];
      if (product.has_variants && (product as any).variants) {
        variations = (product as any).variants.map((variant: any) => {
          // Get variant price from lookup map
          const variantPriceData = priceMap.get(variant.name) || { price_list_rate: variant.price || variant.standard_rate || 0, currency: 'PKR' };
          const variantPrice = Number(variantPriceData.price_list_rate) || 0;

          // Get variant stock from lookup map
          const variantStockInfo = stockMap.get(variant.name) || null;
          
          return {
            id: variant.name,
            sale_price: variantPrice,
            base_price: variantPrice,
            sku: variant.name,
            name: variant.item_name,
            image: variant.image,
            stock: variantStockInfo
          };
        });
      }
      
      // For variable products, calculate price range from variations
      let displayPrice = itemPrice;
      let priceRange = null;
      
      if (product.has_variants && variations.length > 0) {
        // Calculate price range from variations
        const variationPrices = variations
          .map((v: any) => v.sale_price || v.base_price || 0)
          .filter((price: number) => price > 0);
          
        if (variationPrices.length > 0) {
          const minPrice = Math.min(...variationPrices);
          const maxPrice = Math.max(...variationPrices);
          priceRange = { min: minPrice, max: maxPrice };
          displayPrice = minPrice; // Use minimum price as the main display price
        }
      }

      return {
        id: product.name,
        name: product.item_name,
        short_description: product.description,
        detailed_desc: product.description,
        type: product.has_variants ? 'variable' : 'simple',
        currency: currency,
        base_price: displayPrice,
        status: product.disabled ? 'inactive' : 'active',
        sale_price: displayPrice,
        sku: product.item_code || product.name || `item-${index}`,
        slug: (product.item_code || product.name || `item-${index}`).toLowerCase().replace(/\s+/g, '-'),
        enable_quote_request: true,
        product_images: product.website_image ? [{
          id: `img-${index}`,
          image_id: product.website_image,
          position: 1
        }] : [],
        product_variations: variations,
        stock: stockInfo,
        // Add price range for variable products
        ...(priceRange && { price_range: priceRange })
      };
    });

    // Get total count for pagination (cached separately for better performance)
    const totalCountCacheKey = 'products-total-count';
    let totalProducts = productCache.get(totalCountCacheKey);
    
    if (!totalProducts) {
      console.log('🔄 Fetching total product count...');
      totalProducts = await productService.getProducts({ disabled: 0 }, 1000);
      // Cache total count for 30 minutes
      productCache.set(totalCountCacheKey, totalProducts, 30 * 60 * 1000);
    } else {
      console.log('⚡ Using cached total count');
    }
    
    const totalPages = Math.ceil(totalProducts.length / limit);
    
    // Create pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalProducts: totalProducts.length,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
      offset
    };

    // Cache the transformed products with pagination
    const cacheData = {
      products: transformedProducts,
      pagination
    };
    productCache.set(cacheKey, cacheData, 30 * 60 * 1000); // 30 minutes

    const loadTime = Date.now() - startTime;
    console.log(`✅ Products page ${page} loaded in ${loadTime}ms (${transformedProducts.length} items)`);
    
    // Track performance metrics
    trackPaginationPerformance(loadTime, false);
    trackPaginationCacheMiss();
    
    // Debug: Check for duplicate products in API response
    const productIds = transformedProducts.map(p => p.id || p.sku || p.name);
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
      console.log(`⚠️ Duplicate products detected in API response:`);
      console.log(`📊 Total products: ${transformedProducts.length}`);
      console.log(`🔍 Unique products: ${uniqueIds.size}`);
      
      // Find and log duplicates
      const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
      console.log(`🔍 Duplicate IDs:`, [...new Set(duplicates)]);
    }
    
    // Debug: Log products with variations to check pricing
    const productsWithVariations = transformedProducts.filter(p => p.type === 'variable' && p.product_variations?.length > 0);
    if (productsWithVariations.length > 0) {
      console.log(`🔍 Found ${productsWithVariations.length} products with variations:`);
      productsWithVariations.slice(0, 3).forEach(product => {
        console.log(`  - ${product.name}: ${product.product_variations.length} variations, base_price: ${product.base_price}, price_range:`, product.price_range);
        product.product_variations.slice(0, 2).forEach((variation: any) => {
          console.log(`    * ${variation.name}: base_price: ${variation.base_price}, sale_price: ${variation.sale_price}`);
        });
      });
    }

    return NextResponse.json({ 
      products: transformedProducts,
      pagination,
      cached: false,
      loadTime,
      performance: {
        totalProducts: transformedProducts.length,
        batchOperations: allItemCodes.length,
        cacheHit: false
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
