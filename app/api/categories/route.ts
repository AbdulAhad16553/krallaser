import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/erpnext/services/productService';

export async function GET(request: NextRequest) {
  try {
    // Fetch categories from ERPNext (no store ID required)
    const categories = await productService.getCategories();
    
    // Transform ERPNext categories to match frontend interface
    const transformedCategories = categories.map(category => ({
      id: category.name,
      name: category.item_group_name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      image_id: category.image,
      featured: false,
      parent_id: category.parent_item_group
    }));

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
