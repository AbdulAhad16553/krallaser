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

    console.log(`🚀 Batch fetching images for ${itemNames.length} items...`);
    const startTime = performance.now();

    // Batch process all items to get only image field
    const imageResults = await Promise.all(
      itemNames.map(async (itemName: string) => {
        try {
          // Fetch only the image field for instant loading
          const { data, status, message } = await erpnextClient.getDoc("Item", itemName);

          if (!data) {
            return {
              item_name: itemName,
              success: false,
              error: message || "Item not found",
              image: null
            };
          }

          const imagePath = (data as any).image;
          const itemNameDisplay = (data as any).item_name;
          const itemCode = (data as any).name;
          
          // Generate direct ERPNext URL for instant preview (same as product detail)
          const erpnextDomain = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN;
          let imageUrl = '/placeholder.svg';
          
          console.log('🔍 Image URL generation:', { 
            itemName, 
            imagePath, 
            erpnextDomain,
            hasDomain: !!erpnextDomain 
          });
          
          if (imagePath) {
            if (erpnextDomain) {
              // Use environment variable domain
              imageUrl = `https://${erpnextDomain}${imagePath}`;
              console.log('✅ Generated full image URL with env domain:', imageUrl);
            } else {
              // Fallback: try to extract domain from the imagePath or use a default
              console.warn('⚠️ NEXT_PUBLIC_ERPNEXT_DOMAIN not set, using fallback');
              // You can set a default domain here or extract from imagePath
              imageUrl = imagePath.startsWith('http') ? imagePath : `/placeholder.svg`;
              console.log('⚠️ Using fallback image URL:', imageUrl);
            }
          } else {
            console.warn('⚠️ No imagePath found for item:', itemName);
          }

          const result = {
            item_name: itemCode,
            item_name_display: itemNameDisplay,
            image: imagePath,
            image_url: imageUrl,
            has_image: !!imagePath,
            success: true
          };
          
          console.log('🔍 API returning result:', { 
            itemName: itemCode, 
            hasImage: !!imagePath, 
            imageUrl: imageUrl,
            success: result.success 
          });
          
          return result;

        } catch (error) {
          console.error(`Error processing item ${itemName}:`, error);
          return {
            item_name: itemName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            image: null
          };
        }
      })
    );

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Separate successful and failed results
    const successful = imageResults.filter(result => result.success);
    const failed = imageResults.filter(result => !result.success);

    console.log(`✅ Batch image fetching completed in ${duration.toFixed(2)}ms`);
    console.log(`📊 Results: ${successful.length}/${itemNames.length} images fetched successfully`);
    console.log('🔍 Sample successful results:', successful.slice(0, 3));

    if (failed.length > 0) {
      console.warn(`⚠️ Failed to fetch ${failed.length} images:`, failed.map(f => f.item_name));
    }

    const response = {
      success: true,
      imageResults,
      summary: {
        total: itemNames.length,
        successful: successful.length,
        failed: failed.length,
        duration: duration
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Final API response structure:', {
      success: response.success,
      imageResultsLength: response.imageResults.length,
      summary: response.summary,
      sampleImageResult: response.imageResults[0]
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Error in batch image fetching:", error);
    return NextResponse.json(
      { 
        error: "Failed to batch fetch images",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
