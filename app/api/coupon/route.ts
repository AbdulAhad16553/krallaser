import { NextRequest, NextResponse } from "next/server";
import {
  validateAndApplyCoupon,
  type CartLine,
} from "@/lib/erpnext/services/couponService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const code = body?.code?.trim();
    const items: CartLine[] = Array.isArray(body?.items) ? body.items : [];

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const result = await validateAndApplyCoupon(code, items);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        message: error?.message || "Failed to validate coupon",
      },
      { status: 500 }
    );
  }
}
