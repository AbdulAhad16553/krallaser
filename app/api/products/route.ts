import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/erpnext/services/productService';
import { erpnextClient } from '@/lib/erpnext/erpnextClient';
import { productCache, stockCache, priceCache } from '@/lib/cache';
import { trackPaginationPerformance, trackPaginationCacheHit, trackPaginationCacheMiss } from '@/lib/paginationPerformance';
import { getErpnextImageUrl, getCatalogThumbnailSrc } from '@/lib/erpnextImageUtils';
import { parseErpTags } from '@/lib/erpnext/tags';
import {
  attachPromotionsToProducts,
  getActivePromotionsByItemCode,
} from '@/lib/erpnext/services/pricingRuleService';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const mode = searchParams.get('mode') || 'all'; // machine | parts | all
    const light = searchParams.get('light') === '1';
    const nocache = searchParams.get('nocache') === '1' || searchParams.get('bust') === '1';
    const offset = (page - 1) * limit;

    const quoteFilter = mode === 'machine' ? 1 : mode === 'parts' ? 0 : undefined;
    
    const cacheKey = `products-page-${page}-limit-${limit}-mode-${mode}-light-${light ? 1 : 0}`;
    const cachedProducts = nocache ? null : productCache.get(cacheKey);
    
    if (cachedProducts) {
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

    const filters: { disabled: 0 | 1; custom_quotation_item?: 0 | 1 } = {
      disabled: 0,
    };
    if (quoteFilter !== undefined)
      filters.custom_quotation_item = quoteFilter as 0 | 1;

    const products = await productService.getProducts(filters, limit, offset);
    
    const productCodes = products.map(p => p.name);
    const variantCodes = products.flatMap(p => 
      p.has_variants && (p as any).variants 
        ? (p as any).variants.map((v: any) => v.name)
        : []
    );
    const allItemCodes = [...new Set([...productCodes, ...variantCodes])];

    let priceMap = new Map<string, { price_list_rate: number; currency: string }>();
    let stockMap = new Map<string, { totalStock: number; bins: any[] } | null>();

    if (!light) {
      // Fetch prices per item (batch "in" filter may not work in all ERPNext versions)
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
          priceCache.set(cacheKey, priceData, 15 * 60 * 1000);
          return { itemCode, price: priceData };
        } catch {
          return { itemCode, price: { price_list_rate: 0, currency: 'PKR' } };
        }
      });

      // Fetch stock per item (reliable across ERPNext versions)
      const stockPromises = allItemCodes.map(async (itemCode) => {
        const ckey = `stock-${itemCode}`;
        const cached = stockCache.get(ckey);
        // Only use cache when we have a definite cached result (truthy = has stock data; we don't cache null to avoid ambiguity)
        if (cached !== null && cached !== undefined) return { itemCode, stock: cached };
        try {
          const { data: stockData } = await erpnextClient.getItemStock(itemCode);
          const stockInfo = stockData && stockData.length > 0
            ? { totalStock: stockData.reduce((t: number, b: any) => t + (b.actual_qty || 0), 0), bins: stockData }
            : null;
          stockCache.set(ckey, stockInfo, 2 * 60 * 1000);
          return { itemCode, stock: stockInfo };
        } catch {
          return { itemCode, stock: null };
        }
      });

      const [priceResults, stockResults] = await Promise.all([
        Promise.all(pricePromises),
        Promise.all(stockPromises),
      ]);

      priceMap = new Map(priceResults.map((r) => [r.itemCode, r.price]));
      stockMap = new Map(stockResults.map((r) => [r.itemCode, r.stock]));
    }

    // Transform ERPNext products to match frontend interface
    const promotions = await getActivePromotionsByItemCode();

    const transformedProducts = attachPromotionsToProducts(
      products.map((product, index) => {
      // Use ERPNext custom field "custom_quotation_item" as the source
      const rawEnableQuote =
        (product as any).custom_quotation_item ??
        (product as any).custom_custom_quotation_item ??
        0;
      const enableQuoteRequest =
        rawEnableQuote === true ||
        rawEnableQuote === "1" ||
        rawEnableQuote === 1 ||
        rawEnableQuote === "Yes";
      // Get price from lookup map (O(1) access) or standard_rate in light mode
      const priceData = light
        ? { price_list_rate: product.standard_rate || 0, currency: 'PKR' }
        : priceMap.get(product.name) || { price_list_rate: product.standard_rate || 0, currency: 'PKR' };
      const itemPrice = Number(priceData.price_list_rate) || 0;
      const currency = priceData.currency || 'PKR';

      // Get stock information from lookup map (O(1) access); skipped in light mode
      const stockInfo = light ? null : stockMap.get(product.name) || null;
      
      // Handle variations (using lookup maps for O(1) access)
      let variations = [];
      if (product.has_variants && (product as any).variants) {
        variations = (product as any).variants.map((variant: any) => {
          // Get variant price from lookup map
          const variantPriceData = light
            ? { price_list_rate: variant.price || variant.standard_rate || 0, currency: 'PKR' }
            : priceMap.get(variant.name) || { price_list_rate: variant.price || variant.standard_rate || 0, currency: 'PKR' };
          const variantPrice = Number(variantPriceData.price_list_rate) || 0;

          // Get variant stock from lookup map
          const variantStockInfo = light ? null : stockMap.get(variant.name) || null;
          
          return {
            id: variant.name,
            sale_price: variantPrice,
            base_price: variantPrice,
            sku: variant.name,
            name: variant.item_name,
            image: variant.image,
            image_url: variant.image ? getErpnextImageUrl(variant.image) : undefined,
            thumbnail_url: getCatalogThumbnailSrc(variant.image ?? undefined),
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

        // Fallback: if no price range yet but a variation has price, use it
        if (!priceRange) {
          const pricedVariation = variations.find(
            (v: any) => Number(v.sale_price || v.base_price || 0) > 0
          );
          if (pricedVariation) {
            const fallbackPrice = Number(pricedVariation.sale_price || pricedVariation.base_price || 0);
            displayPrice = fallbackPrice;
            priceRange = { min: fallbackPrice, max: fallbackPrice };
          }
        }
      }

      const imagePath = product.website_image || product.image;
      const tags = parseErpTags((product as any)._user_tags);
      return {
        id: product.name,
        name: product.item_name,
        short_description: product.description,
        detailed_desc: product.description,
        item_group: product.item_group,
        type: product.has_variants ? 'variable' : 'simple',
        currency: currency,
        base_price: displayPrice,
        status: product.disabled ? 'inactive' : 'active',
        sale_price: displayPrice,
        sku: product.item_code || product.name || `item-${index}`,
        slug: (product.item_code || product.name || `item-${index}`).toLowerCase().replace(/\s+/g, '-'),
        custom_quotation_item: rawEnableQuote,
        enable_quote_request: enableQuoteRequest,
        product_images: imagePath ? [{
          id: `img-${index}`,
          image_id: imagePath,
          position: 1,
          thumbnail_url: getCatalogThumbnailSrc(imagePath),
        }] : [],
        image_url: imagePath ? getErpnextImageUrl(imagePath) : undefined,
        thumbnail_url: getCatalogThumbnailSrc(imagePath),
        product_variations: variations,
        stock: stockInfo,
        tags,
        ...(priceRange && { price_range: priceRange })
      };
    }),
      promotions
    );

    const totalCountCacheKey = `products-total-count-${mode}`;
    let totalProducts = productCache.get(totalCountCacheKey) as any[] | undefined;
    if (!totalProducts) {
      const countLimit = light ? undefined : 5000;
      const allFiltered = await productService.getProducts(filters, countLimit, 0);
      totalProducts = allFiltered;
      productCache.set(totalCountCacheKey, totalProducts, 30 * 60 * 1000);
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
    const withPrice = transformedProducts.filter((p) => (p.base_price || p.sale_price) > 0).length;
    const withStock = transformedProducts.filter((p) => p.stock?.totalStock > 0 || (p.product_variations || []).some((v: any) => v.stock?.totalStock > 0)).length;
    console.log(`✅ Products page ${page} loaded in ${loadTime}ms | ${transformedProducts.length} items | ${withPrice} with price | ${withStock} with stock`);
    
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
