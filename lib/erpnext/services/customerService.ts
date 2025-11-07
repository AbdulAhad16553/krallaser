import { erpnextClient } from '../erpnextClient';

export interface ERPNextCustomer {
  name: string;
  customer_name: string;
  customer_type: string;
  customer_group: string;
  territory: string;
  mobile_no?: string;
  email_id?: string;
  disabled: 0 | 1;
}

export interface ERPNextQuotation {
  name: string;
  customer: string;
  customer_name: string;
  transaction_date: string;
  valid_till: string;
  status: string;
  grand_total: number;
  currency: string;
}

export interface ERPNextSalesOrder {
  name: string;
  customer: string;
  customer_name: string;
  transaction_date: string;
  delivery_date: string;
  status: string;
  grand_total: number;
  currency: string;
}

export class CustomerService {
  // Get customers with optional filters
  async getCustomers(filters?: {
    customer_name?: string;
    customer_type?: string;
    disabled?: 0 | 1;
  }): Promise<ERPNextCustomer[]> {
    try {
      const response = await erpnextClient.getDoc("Customer", "");
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get a single customer by name
  async getCustomer(customerName: string): Promise<ERPNextCustomer> {
    try {
      const response = await erpnextClient.getDoc('Customer', customerName);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Get quotations for a customer
  async getQuotations(filters?: {
    customer?: string;
    status?: string;
  }): Promise<ERPNextQuotation[]> {
    try {
      const response = await erpnextClient.getQuotations(filters);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  // Create a new quotation
  async createQuotation(quotationData: any): Promise<ERPNextQuotation> {
    try {
      const response = await erpnextClient.createQuotation(quotationData);
      return response.data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  // Get sales orders for a customer
  async getSalesOrders(filters?: {
    customer?: string;
    status?: string;
  }): Promise<ERPNextSalesOrder[]> {
    try {
      const response = await erpnextClient.getSalesOrders(filters);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  }

  // Create a new sales order
  async createSalesOrder(salesOrderData: any): Promise<ERPNextSalesOrder> {
    try {
      const response = await erpnextClient.createSalesOrder(salesOrderData);
      return response.data;
    } catch (error) {
      console.error('Error creating sales order:', error);
      throw error;
    }
  }

  // Search customers by keyword
  async searchCustomers(keyword: string): Promise<ERPNextCustomer[]> {
    try {
      const filters = {
        customer_name: `%${keyword}%`,
        disabled: 0
      };
      return await this.getCustomers(filters);
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService();
export default customerService;
