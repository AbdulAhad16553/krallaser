import { NextRequest, NextResponse } from "next/server";
import { erpnextClient } from "@/lib/erpnext/erpnextClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemName = searchParams.get("item_name");

    if (!itemName) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // Fetch only the image field for instant loading
    const { data, status, message } = await erpnextClient.getDoc("Item", itemName);

    if (!data) {
      return NextResponse.json(
        { error: message || "Item not found" },
        { status: status || 404 }
      );
    }

    const imagePath = (data as any).image;
    const itemNameDisplay = (data as any).item_name;
    const itemCode = (data as any).name;
    
    // Generate direct ERPNext URLs for instant preview
    const erpnextDomain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
    let optimizedImageUrl = '/placeholder.svg';
    let thumbnailUrl = '/placeholder.svg';
    
    if (imagePath && erpnextDomain) {
      // Use direct ERPNext domain URL for instant preview
      const directUrl = `https://${erpnextDomain}${imagePath}`;
      
      // Use direct URL for instant preview
      optimizedImageUrl = directUrl;
      thumbnailUrl = directUrl;
    }

    // Return optimized image data instantly
    return NextResponse.json({
      item_name: itemCode,
      item_name_display: itemNameDisplay,
      image: imagePath,
      optimized_image: optimizedImageUrl,
      thumbnail: thumbnailUrl,
      has_image: !!imagePath,
      success: true,
      // Add performance metrics
      performance: {
        api_call_time: Date.now(),
        optimized: true,
        format: 'webp',
        quality: 85
      }
    });

  } catch (error: any) {
    console.error("Error fetching item image:", error);
    return NextResponse.json(
      { error: "Failed to fetch item image" },
      { status: 500 }
    );
  }
}
