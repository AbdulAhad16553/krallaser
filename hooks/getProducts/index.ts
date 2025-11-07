import { productService } from '@/lib/erpnext/services/productService';

export interface Product {
  id: string;
  name: string;
  short_description?: string;
  detailed_desc?: string;
  type: string;
  currency: string;
  base_price: number;
  status: string;
  sale_price: number;
  sku: string;
  slug: string;
  enable_quote_request: boolean;
  product_images?: Array<{
    id: string;
    image_id: string;
    position: number;
  }>;
  product_variations?: Array<{
    sale_price: number;
    base_price: number;
    sku: string;
  }>;
}

export interface StockInfo {
  sku: string;
  available_quantity: number;
  reserved_quantity: number;
  total_quantity: number;
  warehouse_id: string;
  store_warehouse?: {
    name: string;
  };
}

export const getProducts = async (storeId: string) => {
  try {
    // Fetch products from ERPNext
    const erpnextProducts = await productService.getProducts({ disabled: 0 });
    
    // Transform ERPNext products to match our interface
    const products: Product[] = erpnextProducts.map((product, index) => ({
      id: product.name,
      name: product.item_name,
      short_description: product.description,
      detailed_desc: product.description,
      type: 'simple',
      currency: 'PKR',
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

    // Fetch stock information
    const stockData = await productService.getStockBalance();
    const currentStock: StockInfo[] = stockData.map(stock => ({
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
      products,
      currentStock,
    };
  } catch (error) {
    console.error('Error fetching products from ERPNext:', error);
    throw error;
  }
}
