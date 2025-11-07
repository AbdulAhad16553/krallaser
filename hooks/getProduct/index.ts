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
  product_attributes?: Array<{
    id: string;
    name: string;
    visible_on_product_page: boolean;
    used_for_variations: boolean;
    product_attributes_values: Array<{
      id: string;
      value: string;
    }>;
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

export const getProduct = async (storeId: string, productSlug: string) => {
  try {
    // Fetch single product from ERPNext
    const erpnextProduct = await productService.getProduct(productSlug);
    
    // Transform ERPNext product to match our interface
    const product: Product = {
      id: erpnextProduct.name,
      name: erpnextProduct.item_name,
      short_description: erpnextProduct.description,
      detailed_desc: erpnextProduct.description,
      type: 'simple',
      currency: 'USD',
      base_price: erpnextProduct.standard_rate,
      status: erpnextProduct.disabled ? 'inactive' : 'active',
      sale_price: erpnextProduct.standard_rate,
      sku: erpnextProduct.item_code || erpnextProduct.name || 'item',
      slug: (erpnextProduct.item_code || erpnextProduct.name || 'item').toLowerCase().replace(/\s+/g, '-'),
      enable_quote_request: true,
      product_images: erpnextProduct.website_image ? [{
        id: 'img-1',
        image_id: erpnextProduct.website_image,
        position: 1
      }] : [],
      product_variations: erpnextProduct.has_variants ? [{
        sale_price: erpnextProduct.standard_rate,
        base_price: erpnextProduct.standard_rate,
        sku: erpnextProduct.item_code
      }] : [],
      product_attributes: [] // ERPNext doesn't have this structure, so we'll leave it empty
    };

    // Fetch stock information for this product
    const stockData = await productService.getStockBalance({ item_code: productSlug });
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
      product,
      currentStock,
    };
  } catch (error) {
    console.error('Error fetching product from ERPNext:', error);
    throw error;
  }
}
