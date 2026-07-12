import { NextResponse } from "next/server";

const ERP_DOMAIN = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
const ERP_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const ERP_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

function erpHeaders(): HeadersInit {
  return {
    Authorization: `token ${ERP_KEY}:${ERP_SECRET}`,
    "Content-Type": "application/json",
  };
}

/**
 * Reduce any phone format to its core local number so the same person is
 * matched regardless of how they typed it.
 *   "03005900148"      -> "3005900148"
 *   "+92 3005900148"   -> "3005900148"
 *   "0092-300-5900148" -> "3005900148"
 *   "3005900148"       -> "3005900148"
 */
function corePhone(phone?: string): string {
  let digits = (phone || "").replace(/\D/g, "");
  digits = digits.replace(/^0+/, ""); // drop leading zeros (e.g. 0, 0092)
  if (digits.startsWith("92")) digits = digits.slice(2); // drop PK country code
  return digits;
}

async function findCustomerByPhone(phone: string): Promise<string | null> {
  const core = corePhone(phone);
  if (!core || core.length < 6) return null;

  const filters = encodeURIComponent(
    JSON.stringify([["mobile_no", "like", `%${core}%`]])
  );
  const fields = encodeURIComponent(JSON.stringify(["name", "mobile_no"]));

  try {
    const response = await fetch(
      `https://${ERP_DOMAIN}/api/resource/Customer?filters=${filters}&fields=${fields}&limit_page_length=1`,
      { headers: erpHeaders(), cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = await response.json().catch(() => ({}));
    const rows = Array.isArray(data?.data) ? data.data : [];
    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

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

  // Reuse an existing customer with the same phone number instead of
  // creating a duplicate on every checkout.
  const existingCustomer = await findCustomerByPhone(phone);
  if (existingCustomer) {
    return NextResponse.json({
      success: true,
      message: "Existing customer matched by phone",
      existing: true,
      data: { name: existingCustomer },
    });
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
        headers: erpHeaders(),
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
      existing: false,
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
