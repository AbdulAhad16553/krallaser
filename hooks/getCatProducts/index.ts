import { productService } from '@/lib/erpnext/services/productService';

export const getCatProducts = async (storeId: string, catSlug: string) => {
    try {
        // Get products by category from ERPNext
        const products = await productService.getProductsByCategory(catSlug);
        const stockData = await productService.getStockBalance();
        
        // Transform ERPNext products to match expected format
        const catProducts = products.map((product, index) => ({
            id: product.name,
            name: product.item_name,
            short_description: product.description,
            detailed_desc: product.description,
            type: 'simple',
            currency: 'USD',
            base_price: product.standard_rate,
            status: product.disabled ? 'inactive' : 'active',
            sale_price: product.standard_rate,
            sku: product.item_code || product.name || `item-${index}`,
            slug: (product.item_code || product.name || `item-${index}`).toLowerCase().replace(/\s+/g, '-'),
            enable_quote_request: true,
            product_images: product.website_image ? [{
                id: `img-${index}`,
                image_id: product.website_image,
                position: 1
            }] : [],
            product_variations: product.has_variants ? [{
                sale_price: product.standard_rate,
                base_price: product.standard_rate,
                sku: product.item_code
            }] : []
        }));

        // Transform stock data
        const currentStock = stockData.map(stock => ({
            sku: stock.item_code,
            available_quantity: stock.actual_qty,
            reserved_quantity: stock.reserved_qty,
            total_quantity: stock.projected_qty,
            warehouse_id: stock.warehouse,
            store_warehouse: {
                name: stock.warehouse
            }
        }));

        return {
            catName: catSlug,
            catProducts,
            catSubCats: [], // ERPNext doesn't have sub-categories in the same way
            currentStock,
        };
    } catch (error) {
        console.error('Error fetching category products from ERPNext:', error);
        return {
            catName: catSlug,
            catProducts: [],
            catSubCats: [],
            currentStock: [],
        };
    }
};
