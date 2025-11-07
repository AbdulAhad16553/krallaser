import { NextResponse } from "next/server";
import axios from "axios";

const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`;
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

export async function GET() {
  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/Company`,
      {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      companies: response.data.data,
      message: `Found ${response.data.data.length} companies`
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || error.message,
        companies: []
      },
      { status: 500 }
    );
  }
}

