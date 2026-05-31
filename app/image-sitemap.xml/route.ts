import { NextResponse } from "next/server";
import { buildSitemapXml, getSitemapUrls } from "@/lib/sitemapUrls";

/** Image entries are included in the main sitemap; this route lists product URLs that have images only. */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const all = await getSitemapUrls();
    const withImages = all.filter((u) => u.images && u.images.length > 0);
    const xml = buildSitemapXml(withImages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Image sitemap failed:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
