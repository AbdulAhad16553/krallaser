import { erpnextClient } from '../erpnextClient';

export interface ERPNextStore {
  name: string;
  store_name: string;
  store_type: string;
  domain?: string;
  subdomain?: string;
  company_id?: string;
  primary_color?: string;
  secondary_color?: string;
  currency?: string;
  tagline?: string;
  coming_soon?: 0 | 1;
  payment_method_active?: 0 | 1;
  fav_icon_id?: string;
  header_logo_id?: string;
  footer_logo_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ERPNextSocialLink {
  platform_name: string;
  social_link: string;
}

export class StoreService {
  // Get store information by domain
  async getStoreByDomain(domain: string): Promise<ERPNextStore | null> {
    try {
      // Since ERPNext doesn't have a built-in store concept, we'll create a mock store
      // based on the domain and use ERPNext company information
      const companies = await erpnextClient.getList('Company', {}, [
        'name',
        'company_name',
        'default_currency',
        'country',
        'phone_no',
        'email',
        'website'
      ]);

      // Defensive checks, addressing possible null/unknown types
      if (
        companies &&
        typeof companies === 'object' &&
        'data' in companies &&
        companies.data &&
        typeof companies.data === 'object' &&
        'data' in companies.data &&
        Array.isArray(companies.data.data) &&
        companies.data.data.length > 0
      ) {
        const company = companies.data.data[0];

        // Create a store object based on company data
        const store: ERPNextStore = {
          name: company.name,
          store_name: company.company_name || company.name,
          store_type: 'ecommerce',
          domain: domain,
          company_id: company.name,
          primary_color: '#3B82F6', // Default blue
          secondary_color: '#1F2937', // Default dark
          currency: company.default_currency || 'USD',
          tagline: `Welcome to ${company.company_name || company.name}`,
          coming_soon: 0,
          payment_method_active: 1,
          email: company.email,
          phone: company.phone_no,
          address: company.country,
          city: company.country,
          country: company.country
        };

        return store;
      }

      return null;
    } catch (error) {
      console.error('Error fetching store by domain:', error);
      throw error;
    }
  }

  // Get social links (we'll create mock data since ERPNext doesn't have social links)
  async getSocialLinks(): Promise<ERPNextSocialLink[]> {
    try {
      // Return empty array or mock social links
      return [];
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  }

  // Get store contact details
  async getContactDetails(): Promise<{
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }> {
    try {
      const companies = await erpnextClient.getList('Company', {}, [
        'email',
        'phone_no',
        'country'
      ]);

      const companyList = (companies as any)?.data?.data;
      if (Array.isArray(companyList) && companyList.length > 0) {
        const company = companyList[0];
        return {
          email: company.email,
          phone: company.phone_no,
          address: company.country,
          city: company.country,
          country: company.country
        };
      }

      return {};
    } catch (error) {
      console.error('Error fetching contact details:', error);
      throw error;
    }
  }

  // Get store settings
  async getStoreSettings(): Promise<{
    currency: string;
    primary_color: string;
    secondary_color: string;
    tagline: string;
    coming_soon: boolean;
    payment_method_active: boolean;
  }> {
    try {
      const companies = await erpnextClient.getList('Company', {}, [
        'default_currency',
        'company_name'
      ]);

      const companyList = (companies as any)?.data?.data;
      if (Array.isArray(companyList) && companyList.length > 0) {
        const company = companyList[0];
        return {
          currency: company.default_currency || 'USD',
          primary_color: '#3B82F6',
          secondary_color: '#1F2937',
          tagline: `Welcome to ${company.company_name || 'Our Store'}`,
          coming_soon: false,
          payment_method_active: true
        };
      }

      return {
        currency: 'USD',
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        tagline: 'Welcome to Our Store',
        coming_soon: false,
        payment_method_active: true
      };
    } catch (error) {
      console.error('Error fetching store settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storeService = new StoreService();
export default storeService;
