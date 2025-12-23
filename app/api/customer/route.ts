import { NextResponse } from "next/server";

const ERP_DOMAIN = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
const ERP_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const ERP_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

export async function POST(request: Request) {
  if (!ERP_DOMAIN || !ERP_KEY || !ERP_SECRET) {
    return NextResponse.json(
      { success: false, message: "ERPNext credentials are missing" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const { name, phone, email } = body || {};

  if (!name || !phone) {
    return NextResponse.json(
      { success: false, message: "Customer name and phone are required" },
      { status: 400 }
    );
  }

  const payload = {
    doctype: "Customer",
    customer_name: name,
    customer_group: "Individual",
    customer_type: "Individual",
    territory: "All Territories",
    mobile_no: phone,
    email_id: email,
  };

  try {
    const response = await fetch(
      `https://${ERP_DOMAIN}/api/resource/Customer`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${ERP_KEY}:${ERP_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to create customer",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      data: data?.data || data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unexpected error creating customer",
      },
      { status: 500 }
    );
  }
}



