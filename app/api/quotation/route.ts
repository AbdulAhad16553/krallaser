import { NextResponse } from "next/server";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`;
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

// Helper function to check if customer exists
async function checkCustomerExists(customerName: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/Customer/${encodeURIComponent(customerName)}`,
      {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
      }
    );
    return response.status === 200;
  } catch (error: any) {
    // If customer doesn't exist, ERPNext returns 404
    return false;
  }
}

// Helper function to get the default company
async function getDefaultCompany(): Promise<string> {
  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/Company`,
      {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
      }
    );
    
    // Return the first company found, or a default name
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].name;
    }
    return "Your Company"; // Fallback default
  } catch (error: any) {
    console.error("Error fetching companies:", error.response?.data || error.message);
    return "Your Company"; // Fallback default
  }
}

// Helper function to create a new customer
async function createCustomer(customerData: any): Promise<any> {
  const customerPayload = {
    doctype: "Customer",
    customer_name: customerData.customer_name,
    customer_type: "Individual",
    customer_group: "Individual",
    territory: "All Territories",
    email_id: customerData.email,
    mobile_no: customerData.mobile || "",
    // Remove the problematic fields that require existing records
    // customer_primary_contact: customerData.customer_name,
    // customer_primary_address: customerData.customer_name,
  };

  const response = await axios.post(
    `${ERP_BASE_URL}/Customer`,
    customerPayload,
    {
      headers: {
        Authorization: `token ${API_KEY}:${API_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Step 1: Check if customer exists, create if not
    let customerName = body.customer_name;
    const customerExists = await checkCustomerExists(customerName);
    
    if (!customerExists) {
      console.log(`Customer ${customerName} not found, creating new customer...`);
      try {
        const newCustomer = await createCustomer({
          customer_name: customerName,
          email: body.email,
          mobile: body.mobile || "",
        });
        console.log(`Customer created successfully: ${newCustomer.name}`);
      } catch (customerError: any) {
        console.error("Error creating customer:", customerError.response?.data || customerError.message);
        return NextResponse.json(
          { 
            success: false, 
            message: `Failed to create customer: ${customerError.response?.data?.message || customerError.message}` 
          },
          { status: 500 }
        );
      }
    } else {
      console.log(`Customer ${customerName} already exists`);
    }
    
    // Step 2: Get default company and create quotation
    const defaultCompany = await getDefaultCompany();
    console.log(`Using company: ${defaultCompany}`);
    
    const quotationData = {
      doctype: "Quotation",
      quotation_to: "Customer",
      party_name: customerName,
      company: defaultCompany,
      transaction_date: new Date().toISOString().split("T")[0],
      valid_till: body.valid_till || "2025-12-31",
      items: body.items.map((item: any) => ({
        item_code: item.item_code,
        qty: item.qty,
        rate: item.rate,
        uom: item.uom || "Nos",
        description: item.description || "",
      })),
      contact_email: body.email,
      remarks: body.remarks || "",
    };

    const response = await axios.post(
      `${ERP_BASE_URL}/Quotation`,
      quotationData,
      {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: response.data.data,
      message: customerExists ? "Quotation created successfully!" : "Customer created and quotation submitted successfully!"
    });
  } catch (error: any) {
    console.error("Error creating quotation:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
