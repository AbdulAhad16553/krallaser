import { productService } from '@/lib/erpnext/services/productService';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_id?: string;
  featured: boolean;
  parent_id?: string;
}

export const getCategories = async (storeId: string) => {
  try {
    // Fetch categories from ERPNext
    const erpnextCategories = await productService.getCategories();
    
    // Transform ERPNext categories to match our interface
    const categories: Category[] = erpnextCategories
      .filter(category => !category.is_group) // Only get leaf categories
      .map(category => ({
        id: category.name,
        name: category.item_group_name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        image_id: category.image,
        featured: false,
        parent_id: category.parent_item_group
      }));

    return { categories };
  } catch (error) {
    console.error('Error fetching categories from ERPNext:', error);
    throw error;
  }
};

export const getAllCategories = async (storeId: string) => {
  try {
    // Fetch all categories from ERPNext (including parent categories)
    const erpnextCategories = await productService.getCategories();
    
    // Transform ERPNext categories to match our interface
    const categories: Category[] = erpnextCategories.map(category => ({
      id: category.name,
      name: category.item_group_name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      image_id: category.image,
      featured: false,
      parent_id: category.parent_item_group
    }));

    return { categories };
  } catch (error) {
    console.error('Error fetching all categories from ERPNext:', error);
    throw error;
  }
};
