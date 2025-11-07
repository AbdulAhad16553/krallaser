import { NextRequest, NextResponse } from "next/server";
import { erpnextClient } from "@/lib/erpnext/erpnextClient";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const itemCode = url.searchParams.get("item");

    if (!itemCode) {
      return NextResponse.json({ error: "Missing item code" }, { status: 400 });
    }

    const { data, message, status } = await erpnextClient.getItemStock(itemCode);
    
    if (status && status !== 200) {
      return NextResponse.json({ error: message || "Failed to fetch stock" }, { status });
    }

    // Calculate total stock across all warehouses
    const totalStock = data?.reduce((total: number, bin: any) => {
      return total + (bin.actual_qty || 0);
    }, 0) || 0;

    return NextResponse.json({ 
      stock: data || [],
      totalStock,
      itemCode 
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock information' },
      { status: 500 }
    );
  }
}
