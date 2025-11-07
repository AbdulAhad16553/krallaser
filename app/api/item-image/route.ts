import { NextRequest, NextResponse } from "next/server";
import { erpnextClient } from "@/lib/erpnext/erpnextClient";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

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

    // Fetch only the image field for the specific item
    const { data, status, message } = await erpnextClient.getDoc("Item", itemName);

    if (!data) {
      return NextResponse.json(
        { error: message || "Item not found" },
        { status: status || 404 }
      );
    }

    // Get image data
    const imagePath = (data as any).image;
    const itemNameDisplay = (data as any).item_name;
    
    // Generate optimized image URLs
    const optimizedImageUrl = imagePath ? getOptimizedImageUrl(imagePath, {
      width: 400,
      height: 400,
      quality: 90
    }) : null;
    
    const thumbnailUrl = imagePath ? getOptimizedImageUrl(imagePath, {
      width: 100,
      height: 100,
      quality: 80
    }) : null;

    // Return optimized image data
    return NextResponse.json({
      item_name: (data as any).name,
      item_name_display: itemNameDisplay,
      image: imagePath,
      optimized_image: optimizedImageUrl,
      thumbnail: thumbnailUrl,
      has_image: !!imagePath,
      success: true
    });

  } catch (error: any) {
    console.error("Error fetching item image:", error);
    return NextResponse.json(
      { error: "Failed to fetch item image" },
      { status: 500 }
    );
  }
}
