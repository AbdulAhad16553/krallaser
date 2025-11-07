import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`;
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY!;
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET!;

// ---- Fetch Template Items ----
async function getTemplateItems(limit = 100) {
  let templates: any[] = [];
  let start = 0;

  while (true) {
    const res = await axios.get(
      `${ERP_BASE_URL}/Item?filters=[["has_variants","=","1"]]&fields=["name","item_name","item_group","stock_uom","image"]&limit_start=${start}&limit_page_length=${limit}`,
      {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
      }
    );

    const data = res.data?.data || [];
    if (data.length === 0) break;

    templates = [...templates, ...data];
    start += limit;
  }

  return templates;
}

// ---- Fetch Variant Items for a Template ----
async function getVariantsForTemplate(templateName: string) {
  const res = await axios.get(
    `${ERP_BASE_URL}/Item?filters=[["variant_of","=","${templateName}"]]&fields=["name","item_name","variant_of","attributes","image"]&limit_page_length=200`,
    {
      headers: {
        Authorization: `token ${API_KEY}:${API_SECRET}`,
      },
    }
  );
  return res.data?.data || [];
}

// ---- API Route ----
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get all template items
    const templates = await getTemplateItems();

    // 2️⃣ Get variants (with images)
    const templatesWithVariants = await Promise.all(
      templates.map(async (template) => {
        const variants = await getVariantsForTemplate(template.name);
        return {
          ...template,
          variants,
        };
      })
    );

    return NextResponse.json({
      success: true,
      total_templates: templatesWithVariants.length,
      templates: templatesWithVariants,
    });
  } catch (error: any) {
    console.error("❌ Error fetching products with images:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template items with images" },
      { status: 500 }
    );
  }
}
