import { NextRequest, NextResponse } from "next/server";

const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`;
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY!;
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateItemName = searchParams.get('template');
    
    if (!templateItemName) {
      return NextResponse.json(
        { error: 'Template item name is required' },
        { status: 400 }
      );
    }

    // Fetch all variant items for the template with pagination support
    // ERPNext returns each attribute as a separate row, so we need to fetch all pages
    let allVariants: any[] = [];
    let start = 0;
    const pageLength = 1000; // Increased limit to ensure we get all variants
    let hasMore = true;

    while (hasMore) {
      const variantsResponse = await fetch(
        `${ERP_BASE_URL}/Item?filters=[["variant_of","=","${templateItemName}"]]&fields=["name","item_name","attributes.attribute","attributes.attribute_value"]&limit_start=${start}&limit_page_length=${pageLength}`,
        {
          headers: {
            Authorization: `token ${API_KEY}:${API_SECRET}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!variantsResponse.ok) {
        throw new Error(`ERPNext API error: ${variantsResponse.status}`);
      }

      const variantsData = await variantsResponse.json();
      const variants = variantsData.data || [];
      
      if (variants.length === 0) {
        hasMore = false;
      } else {
        allVariants = allVariants.concat(variants);
        // If we got fewer results than requested, we've reached the end
        if (variants.length < pageLength) {
          hasMore = false;
        } else {
          start += pageLength;
        }
      }
    }

    if (allVariants.length === 0) {
      return NextResponse.json({ attributes: [] });
    }

    // Extract unique attributes and their values
    // ERPNext returns each attribute as a separate row when requesting attributes.attribute
    const attributeMap = new Map<string, Set<string>>();
    
    allVariants.forEach((variant: any) => {
      // Handle ERPNext response format where attributes are returned as flat fields
      // Each row represents one attribute of a variant
      if (variant.attribute && variant.attribute_value) {
        const attributeName = variant.attribute;
        const attributeValue = variant.attribute_value;
        
        if (!attributeMap.has(attributeName)) {
          attributeMap.set(attributeName, new Set());
        }
        attributeMap.get(attributeName)!.add(attributeValue);
      }
      
      // Also handle case where attributes might be in an array format
      if (variant.attributes && Array.isArray(variant.attributes)) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attribute && attr.attribute_value) {
            const attributeName = attr.attribute;
            const attributeValue = attr.attribute_value;
            
            if (!attributeMap.has(attributeName)) {
              attributeMap.set(attributeName, new Set());
            }
            attributeMap.get(attributeName)!.add(attributeValue);
          }
        });
      }
    });

    // Convert to array format
    const attributes: Array<{ attribute: string; attribute_value: string }> = [];
    attributeMap.forEach((values, attribute) => {
      values.forEach(value => {
        attributes.push({ attribute, attribute_value: value });
      });
    });

    // Sort attributes by name and values for consistent display
    attributes.sort((a, b) => {
      if (a.attribute !== b.attribute) {
        return a.attribute.localeCompare(b.attribute);
      }
      return a.attribute_value.localeCompare(b.attribute_value);
    });

    return NextResponse.json({ attributes });

  } catch (error: any) {
    console.error('Error fetching attributes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attributes' },
      { status: 500 }
    );
  }
}
