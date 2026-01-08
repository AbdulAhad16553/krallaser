import { NextResponse } from "next/server";

const ERP_DOMAIN = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
const ERP_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const ERP_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

type CartItem = {
  id?: string;
  product_id?: string;
  name?: string;
  quantity?: number;
  salePrice?: number;
  price?: number;
  basePrice?: number;
  bundleItems?: CartItem[];
  type?: string;
};

function buildInvoiceItems(items: CartItem[]) {
  const invoiceItems: any[] = [];

  items.forEach((item) => {
    if (item.type === "bundle" && Array.isArray(item.bundleItems)) {
      const bundleQuantity = item.quantity || 1;
      item.bundleItems.forEach((bundleItem) => {
        invoiceItems.push({
          item_code: bundleItem.product_id || bundleItem.id || bundleItem.name,
          qty: (bundleItem.quantity || 1) * bundleQuantity,
          rate:
            bundleItem.salePrice ??
            bundleItem.price ??
            bundleItem.basePrice ??
            0,
          description: bundleItem.name,
        });
      });
      return;
    }

    invoiceItems.push({
      item_code: item.product_id || item.id || item.name,
      qty: item.quantity || 1,
      rate: item.salePrice ?? item.price ?? item.basePrice ?? 0,
      description: item.name,
    });
  });

  return invoiceItems;
}

export async function POST(request: Request) {
  if (!ERP_DOMAIN || !ERP_KEY || !ERP_SECRET) {
    return NextResponse.json(
      { success: false, message: "ERPNext credentials are missing" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const { customer, items, shipping, companyId } = body || {};

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Customer is required to create invoice" },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { success: false, message: "No items found to create invoice" },
      { status: 400 }
    );
  }

  const invoiceItems = buildInvoiceItems(items);
  const today = new Date().toISOString().split("T")[0];

  const payload = {
    doctype: "Sales Invoice",
    posting_date: today,
    due_date: today,
    customer,
    company: companyId,
    items: invoiceItems,
    contact_email: shipping?.email,
    contact_mobile: shipping?.phone,
    remarks: `Ship to: ${shipping?.address || "N/A"} ${
      shipping?.city ? `(${shipping.city})` : ""
    }\nNotes: ${shipping?.notes || "N/A"}`,
  };

  try {
    const response = await fetch(
      `https://${ERP_DOMAIN}/api/resource/Sales Invoice`,
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
          message: data?.message || "Failed to create sales invoice",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sales invoice created successfully",
      data: data?.data || data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unexpected error creating sales invoice",
      },
      { status: 500 }
    );
  }
}




