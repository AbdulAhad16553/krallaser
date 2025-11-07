import { StoreTemplate, StoreProductsResponse, transformStoreTemplateToProduct } from './index';

// Server-side version of getStoreTemplateProduct
export const getStoreTemplateProductServer = async (slug: string, baseUrl: string) => {
  try {
    const response = await fetch(`${baseUrl}/api/fetchStore`);
    const data: StoreProductsResponse = await response.json();
    
    if (data.success) {
      console.log('Looking for slug:', slug);
      console.log('Available templates:', data.templates.map(t => t.name));
      
      // Find the template that matches the slug
      const template = data.templates.find(t => {
        const templateSlug = t.name.toLowerCase().replace(/\s+/g, '-');
        console.log('Comparing:', templateSlug, 'with', slug.toLowerCase());
        return templateSlug === slug.toLowerCase();
      });
      
      if (template) {
        console.log('Found template:', template);
        return {
          product: {
            products: [transformStoreTemplateToProduct(template)]
          },
          currentStock: [] // Will be populated from stock data
        };
      } else {
        console.log('No template found for slug:', slug);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching store template product:', error);
    return null;
  }
};
