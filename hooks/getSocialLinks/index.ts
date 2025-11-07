import { storeService } from '@/lib/erpnext/services/storeService';

export const getSocialLink = async (storeId: string) => {
    try {
        // Get social links from ERPNext store service
        const socialLinks = await storeService.getSocialLinks();
        
        return { socialLinks };
    } catch (error) {
        console.error('Error fetching social links from ERPNext:', error);
        return { socialLinks: [] };
    }
};
