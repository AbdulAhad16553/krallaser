import { NextResponse } from "next/server";
import { getActivePromotionsByItemCode } from "@/lib/erpnext/services/pricingRuleService";

export async function GET() {
  try {
    const promotions = await getActivePromotionsByItemCode();
    const byItemCode: Record<string, unknown> = {};

    promotions.forEach((promo, key) => {
      if (!key.startsWith("__")) byItemCode[key] = promo;
    });

    return NextResponse.json({
      success: true,
      promotionsByItemCode: byItemCode,
      count: Object.keys(byItemCode).length,
    });
  } catch (error: any) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load pricing rules",
      },
      { status: 500 }
    );
  }
}
