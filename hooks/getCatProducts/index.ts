import { productService } from '@/lib/erpnext/services/productService';
import { getAllCategories } from '@/hooks/getCategories';

export const getCatProducts = async (storeId: string, catSlug: string) => {
    try {
        // First, get all categories to find the one matching the slug
        const { categories } = await getAllCategories(storeId);
        const matchingCategory = categories.find(
            cat => cat.slug === catSlug || cat.slug === decodeURIComponent(catSlug)
        );
        
        // Use the actual category name/id (not slug) to fetch products
        // If no match found, try using the slug directly (in case it's already the category name)
        const categoryName = matchingCategory ? matchingCategory.id : catSlug;
        const categoryDisplayName = matchingCategory ? matchingCategory.name : catSlug;
        
        // Get products by category from ERPNext using the actual category name
        const products = await productService.getProductsByCategory(categoryName);
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

        // Get subcategories if they exist
        const subCategories = matchingCategory 
            ? categories.filter(cat => cat.parent_id === matchingCategory.id)
            : [];

        return {
            catName: categoryDisplayName,
            catProducts,
            catSubCats: subCategories, // Return subcategories if they exist
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
