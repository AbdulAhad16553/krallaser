import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageIds, options = {} } = await request.json();
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "Image IDs array is required" },
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

    const {
      width = 400,
      height = 400,
      quality = 80,
      format = 'webp'
    } = options;

    // Batch process all images
    const optimizedImages = await Promise.all(
      imageIds.map(async (imageId: string) => {
        if (!imageId || imageId === '/placeholder.svg') {
          return {
            imageId,
            optimizedUrl: '/placeholder.svg',
            thumbnailUrl: '/placeholder.svg',
            success: false,
            error: 'Invalid image ID'
          };
        }

        try {
          // Construct image URL
          let imageUrl: string;
          if (imageId.startsWith('/files/')) {
            imageUrl = `https://${erpnextDomain}${imageId}`;
          } else {
            imageUrl = `https://${erpnextDomain}/files/${imageId}`;
          }

          // Add optimization parameters
          const params = new URLSearchParams();
          params.append('w', width.toString());
          params.append('h', height.toString());
          params.append('q', quality.toString());
          params.append('f', format);

          const optimizedUrl = `${imageUrl}?${params.toString()}`;
          
          // Generate thumbnail URL (smaller size)
          const thumbnailParams = new URLSearchParams();
          thumbnailParams.append('w', '100');
          thumbnailParams.append('h', '100');
          thumbnailParams.append('q', '70');
          thumbnailParams.append('f', format);
          
          const thumbnailUrl = `${imageUrl}?${thumbnailParams.toString()}`;

          return {
            imageId,
            optimizedUrl,
            thumbnailUrl,
            success: true
          };
        } catch (error) {
          console.error(`Error processing image ${imageId}:`, error);
          return {
            imageId,
            optimizedUrl: '/placeholder.svg',
            thumbnailUrl: '/placeholder.svg',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Separate successful and failed optimizations
    const successful = optimizedImages.filter(img => img.success);
    const failed = optimizedImages.filter(img => !img.success);

    console.log(`✅ Batch optimized ${successful.length}/${imageIds.length} images successfully`);
    if (failed.length > 0) {
      console.warn(`⚠️ Failed to optimize ${failed.length} images:`, failed.map(f => f.imageId));
    }

    return NextResponse.json({
      success: true,
      optimizedImages,
      summary: {
        total: imageIds.length,
        successful: successful.length,
        failed: failed.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in batch image optimization:", error);
    return NextResponse.json(
      { 
        error: "Failed to batch optimize images",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
