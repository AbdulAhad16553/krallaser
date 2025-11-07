import { NextRequest, NextResponse } from 'next/server';
import { erpnextClient } from '@/lib/erpnext/erpnextClient';

export async function GET(request: NextRequest) {
  try {
    // Get statistics directly from ERPNext (no store ID required)
    console.log('Fetching store statistics from ERPNext...');
    
    // Get total products count
    const { data: products } = await erpnextClient.getList('Item', { disabled: 0 }, ['name'], 1000);
    const totalProducts = products?.length || 0;
    
    // Get total categories count
    const { data: categories } = await erpnextClient.getItemGroups();
    const totalCategories = categories?.length || 0;
    
    // Get products with prices (products on sale)
    const { data: productsWithPrices } = await erpnextClient.getList('Item Price', {}, ['item_code'], 1000);
    const productsOnSale = productsWithPrices?.length || 0;
    
    // Get stock balance (products in stock)
    const { data: stockBalance } = await erpnextClient.getStockBalance();
    const productsInStock = stockBalance?.filter(item => item.actual_qty > 0).length || 0;
    
    const stats = {
      totalProducts,
      totalCategories,
      productsOnSale,
      productsInStock,
    };

    console.log('Store stats fetched successfully:', stats);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching store stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store statistics', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
