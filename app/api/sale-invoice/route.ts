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

type CompanyDefaults = {
  default_income_account?: string;
  default_receivable_account?: string;
  default_cost_center?: string;
  default_warehouse?: string;
};

function normalizeCurrencyCode(currency?: string): string {
  if (!currency) return "PKR";
  const code = currency.split(" - ")[0]?.trim();
  return code || "PKR";
}

function erpHeaders(): HeadersInit {
  return {
    Authorization: `token ${ERP_KEY}:${ERP_SECRET}`,
    "Content-Type": "application/json",
  };
}

async function erpGet<T = any>(path: string): Promise<T | null> {
  const response = await fetch(`https://${ERP_DOMAIN}${path}`, {
    headers: erpHeaders(),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return (data?.data ?? data) as T;
}

async function erpMethod<T = any>(
  method: string,
  args: Record<string, unknown>
): Promise<T | null> {
  const response = await fetch(`https://${ERP_DOMAIN}/api/method/${method}`, {
    method: "POST",
    headers: erpHeaders(),
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return (data?.message ?? null) as T | null;
}

async function companyExists(company: string): Promise<boolean> {
  const response = await fetch(
    `https://${ERP_DOMAIN}/api/resource/Company/${encodeURIComponent(company)}`,
    { headers: erpHeaders(), cache: "no-store" }
  );
  return response.ok;
}

async function resolveCompanyName(companyId?: string): Promise<string | null> {
  // Only trust the passed company if it actually exists in ERPNext.
  // The storefront may hardcode a slug (e.g. "Krallaser") that doesn't match
  // the real ERPNext company name (e.g. "Kral Laser").
  if (companyId && (await companyExists(companyId))) {
    return companyId;
  }

  const companies = await erpGet<Array<{ name: string }>>(
    "/api/resource/Company?fields=%5B%22name%22%5D&limit_page_length=1"
  );
  return companies?.[0]?.name ?? null;
}

async function getCompanyDefaults(company: string): Promise<CompanyDefaults | null> {
  return erpGet<CompanyDefaults>(
    `/api/resource/Company/${encodeURIComponent(company)}`
  );
}

async function getPartyAccount(
  customer: string,
  company: string
): Promise<string | null> {
  const account = await erpMethod<string>("erpnext.accounts.party.get_party_account", {
    party_type: "Customer",
    party: customer,
    company,
  });
  return typeof account === "string" && account.trim() ? account : null;
}

async function findReceivableAccount(company: string): Promise<string | null> {
  const filters = encodeURIComponent(
    JSON.stringify([
      ["company", "=", company],
      ["account_type", "=", "Receivable"],
      ["is_group", "=", 0],
    ])
  );
  const fields = encodeURIComponent(JSON.stringify(["name"]));
  const accounts = await erpGet<Array<{ name: string }>>(
    `/api/resource/Account?filters=${filters}&fields=${fields}&limit_page_length=1`
  );
  return accounts?.[0]?.name ?? null;
}

async function getItemIncomeAccount(
  itemCode: string,
  companyDefaults: CompanyDefaults | null
): Promise<string | null> {
  const item = await erpGet<{ income_account?: string }>(
    `/api/resource/Item/${encodeURIComponent(itemCode)}`
  );
  return item?.income_account || companyDefaults?.default_income_account || null;
}

async function findIncomeAccount(company: string): Promise<string | null> {
  const filters = encodeURIComponent(
    JSON.stringify([
      ["company", "=", company],
      ["account_type", "=", "Income Account"],
      ["is_group", "=", 0],
    ])
  );
  const fields = encodeURIComponent(JSON.stringify(["name"]));
  const accounts = await erpGet<Array<{ name: string }>>(
    `/api/resource/Account?filters=${filters}&fields=${fields}&limit_page_length=1`
  );
  return accounts?.[0]?.name ?? null;
}

async function getDefaultSellingPriceList(): Promise<string | null> {
  const settings = await erpGet<{ selling_price_list?: string }>(
    "/api/resource/Selling Settings/Selling Settings"
  );
  return settings?.selling_price_list || null;
}

function buildLineItem(item: CartItem, qtyMultiplier = 1) {
  const saleRate = Number(item.salePrice ?? item.price ?? item.basePrice ?? 0) || 0;
  const baseRate = Number(item.basePrice ?? item.price ?? saleRate) || saleRate;
  // We already applied the discount on our side, so pin the final rate and let
  // ERPNext show the original list price for reference.
  const row: Record<string, unknown> = {
    item_code: item.product_id || item.id || item.name,
    qty: (item.quantity || 1) * qtyMultiplier,
    rate: saleRate,
    price_list_rate: baseRate > saleRate ? baseRate : saleRate,
    description: item.name,
  };

  return row;
}

function buildInvoiceItems(items: CartItem[]) {
  const invoiceItems: any[] = [];

  items.forEach((item) => {
    if (item.type === "bundle" && Array.isArray(item.bundleItems)) {
      const bundleQuantity = item.quantity || 1;
      item.bundleItems.forEach((bundleItem) => {
        invoiceItems.push(buildLineItem(bundleItem, bundleQuantity));
      });
      return;
    }

    invoiceItems.push(buildLineItem(item));
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
  const { customer, items, shipping, companyId, coupon, currency } = body || {};
  const invoiceCurrency = normalizeCurrencyCode(currency);

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

  const company = await resolveCompanyName(companyId);
  if (!company) {
    return NextResponse.json(
      { success: false, message: "Company not found in ERPNext" },
      { status: 400 }
    );
  }

  const companyDefaults = await getCompanyDefaults(company);
  const debitTo =
    (await getPartyAccount(customer, company)) ||
    companyDefaults?.default_receivable_account ||
    (await findReceivableAccount(company)) ||
    null;

  if (!debitTo) {
    return NextResponse.json(
      {
        success: false,
        message: `Receivable account not found for company "${company}". Set a default receivable account on the company or customer in ERPNext.`,
      },
      { status: 400 }
    );
  }

  const invoiceItems = buildInvoiceItems(items);
  const defaultIncomeAccount =
    companyDefaults?.default_income_account ||
    (await findIncomeAccount(company)) ||
    null;
  const defaultCostCenter = companyDefaults?.default_cost_center || null;

  for (const row of invoiceItems) {
    const itemCode = row.item_code;
    if (!itemCode) continue;

    const incomeAccount =
      (await getItemIncomeAccount(itemCode, companyDefaults)) ||
      defaultIncomeAccount;

    if (!incomeAccount) {
      return NextResponse.json(
        {
          success: false,
          message: `Income account missing for item ${itemCode}. Set default income account on the company or item in ERPNext.`,
        },
        { status: 400 }
      );
    }

    if (incomeAccount === debitTo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ERPNext income account and receivable account are the same. Configure separate accounts in ERPNext Company settings.",
        },
        { status: 400 }
      );
    }

    row.income_account = incomeAccount;
    if (defaultCostCenter) row.cost_center = defaultCostCenter;
    row.uom = row.uom || "Nos";
  }

  const today = new Date().toISOString().split("T")[0];
  const sellingPriceList = await getDefaultSellingPriceList();

  const payload: Record<string, unknown> = {
    doctype: "Sales Invoice",
    posting_date: today,
    due_date: today,
    customer,
    company,
    currency: invoiceCurrency,
    conversion_rate: 1,
    plc_conversion_rate: 1,
    price_list_currency: invoiceCurrency,
    debit_to: debitTo,
    update_stock: 0,
    // Prices are already discounted on our side, so don't let ERPNext
    // re-apply pricing rules / coupons (avoids missing-data errors and
    // double discounting).
    ignore_pricing_rule: 1,
    items: invoiceItems,
    contact_email: shipping?.email,
    contact_mobile: shipping?.phone,
    remarks: `Ship to: ${shipping?.address || "N/A"} ${
      shipping?.city ? `(${shipping.city})` : ""
    }\nNotes: ${shipping?.notes || "N/A"}${
      coupon?.code ? `\nCoupon: ${coupon.code}` : ""
    }`,
  };

  if (sellingPriceList) {
    payload.selling_price_list = sellingPriceList;
  }

  // Apply the coupon as a plain invoice-level discount instead of sending
  // `coupon_code` (which would force ERPNext to re-run the linked pricing rule).
  if (coupon?.discountType === "percentage" && coupon.discountPercentage > 0) {
    payload.additional_discount_percentage = coupon.discountPercentage;
    payload.apply_discount_on = "Grand Total";
  } else if (coupon?.discountAmount > 0) {
    payload.discount_amount = coupon.discountAmount;
    payload.apply_discount_on = "Grand Total";
  }

  try {
    const response = await fetch(
      `https://${ERP_DOMAIN}/api/resource/Sales Invoice`,
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
