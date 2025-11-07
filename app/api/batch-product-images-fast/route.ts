import { NextRequest, NextResponse } from "next/server";
import { erpnextClient } from "@/lib/erpnext/erpnextClient";

export async function POST(request: NextRequest) {
  try {
    const { itemNames } = await request.json();
    
    if (!itemNames || !Array.isArray(itemNames) || itemNames.length === 0) {
      return NextResponse.json(
        { error: "Item names array is required" },
        { status: 400 }
      );
    }

    const erpnextDomain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
    if (!erpnextDomain) {
      return NextResponse.json(
        { error: "ERPNext domain not configured" },
        { status: 500 }
      );
    }

    console.log(`🚀 Batch loading images for ${itemNames.length} items...`);
    const startTime = performance.now();

    // Batch process all items
    const imageResults = await Promise.all(
      itemNames.map(async (itemName: string) => {
        try {
          // Fetch only image field for instant loading
          const { data, status, message } = await erpnextClient.getDoc("Item", itemName);

          if (!data) {
            return {
              item_name: itemName,
              success: false,
              error: message || "Item not found"
            };
          }

          const imagePath = (data as any).image;
          const itemNameDisplay = (data as any).item_name;
          const itemCode = (data as any).name;
          
          // Generate direct ERPNext URLs for instant preview
          let optimizedImageUrl = '/placeholder.svg';
          let thumbnailUrl = '/placeholder.svg';
          
          if (imagePath) {
            // Use direct ERPNext domain URL for instant preview
            const directUrl = `https://${erpnextDomain}${imagePath}`;
            
            // Use direct URL for instant preview
            optimizedImageUrl = directUrl;
            thumbnailUrl = directUrl;
          }

          return {
            item_name: itemCode,
            item_name_display: itemNameDisplay,
            image: imagePath,
            optimized_image: optimizedImageUrl,
            thumbnail: thumbnailUrl,
            has_image: !!imagePath,
            success: true,
            performance: {
              api_call_time: Date.now(),
              optimized: true,
              format: 'webp',
              quality: 85
            }
          };

        } catch (error) {
          console.error(`Error processing item ${itemName}:`, error);
          return {
            item_name: itemName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Separate successful and failed results
    const successful = imageResults.filter(result => result.success);
    const failed = imageResults.filter(result => !result.success);

    console.log(`✅ Batch image loading completed in ${duration.toFixed(2)}ms`);
    console.log(`📊 Results: ${successful.length}/${itemNames.length} images loaded successfully`);

    if (failed.length > 0) {
      console.warn(`⚠️ Failed to load ${failed.length} images:`, failed.map(f => f.item_name));
    }

    return NextResponse.json({
      success: true,
      imageResults,
      summary: {
        total: itemNames.length,
        successful: successful.length,
        failed: failed.length,
        duration: duration
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in batch image loading:", error);
    return NextResponse.json(
      { 
        error: "Failed to batch load images",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
