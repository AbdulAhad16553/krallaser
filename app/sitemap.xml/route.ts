import { NextResponse } from "next/server";
import {
  buildSitemapXml,
  getSitemapUrls,
  getStaticSitemapUrls,
} from "@/lib/sitemapUrls";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const urls = await getSitemapUrls();
    const xml = buildSitemapXml(urls);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    const xml = buildSitemapXml(getStaticSitemapUrls());
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
