import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("image_id");
    const width = searchParams.get("w");
    const height = searchParams.get("h");
    const quality = searchParams.get("q") || "80";

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
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

    // Construct optimized image URL
    let imageUrl: string;
    
    if (imageId.startsWith('/files/')) {
      imageUrl = `https://${erpnextDomain}${imageId}`;
    } else {
      imageUrl = `https://${erpnextDomain}/files/${imageId}`;
    }

    // Add optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('f', 'webp'); // Force WebP format for better compression

    const optimizedUrl = `${imageUrl}?${params.toString()}`;

    // Fetch the optimized image
    const response = await fetch(optimizedUrl, {
      headers: {
        'Accept': 'image/webp,image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Image-Optimizer/1.0)'
      }
    });

    if (!response.ok) {
      // Fallback to original image if optimization fails
      const fallbackResponse = await fetch(imageUrl);
      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: "Image not found" },
          { status: 404 }
        );
      }
      
      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': fallbackResponse.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': fallbackBuffer.byteLength.toString()
        }
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/webp';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.byteLength.toString(),
        'X-Optimized': 'true'
      }
    });

  } catch (error: any) {
    console.error("Error optimizing image:", error);
    return NextResponse.json(
      { error: "Failed to optimize image" },
      { status: 500 }
    );
  }
}
