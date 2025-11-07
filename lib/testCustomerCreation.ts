import axios from "axios";

export async function createCustomer() {
  try {
    const payload = {
      doctype: "Customer",
      customer_name: "abdul ahad",
      customer_group: "Individual",
      customer_type: "Individual",
      territory: "All Territories",
      email_id: "rajaahad1010@gmail.com",
      mobile_no: "03001234567"
      // Removed customer_primary_contact and customer_primary_address 
      // as they require existing records in ERPNext
    };

    const response = await axios.post(
      `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource/Customer`,
      payload,
      {
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_ERPNEXT_API_KEY}:${process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Customer created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create customer:", error.response?.data || error.message);
    throw error;
  }
}
