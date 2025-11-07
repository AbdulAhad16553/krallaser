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

    // Fetch variant items for the template
    const variantsResponse = await fetch(
      `${ERP_BASE_URL}/Item?filters=[["variant_of","=","${templateItemName}"]]&fields=["name","item_name","attributes.attribute","attributes.attribute_value"]&limit_page_length=100`,
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
      return NextResponse.json({ attributes: [] });
    }

    // Extract unique attributes and their values
    const attributeMap = new Map<string, Set<string>>();
    
    variants.forEach((variant: any) => {
      // Handle the new response format where attributes are individual fields
      if (variant.attribute && variant.attribute_value) {
        if (!attributeMap.has(variant.attribute)) {
          attributeMap.set(variant.attribute, new Set());
        }
        attributeMap.get(variant.attribute)!.add(variant.attribute_value);
      }
    });

    // Convert to array format
    const attributes: Array<{ attribute: string; attribute_value: string }> = [];
    attributeMap.forEach((values, attribute) => {
      values.forEach(value => {
        attributes.push({ attribute, attribute_value: value });
      });
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
