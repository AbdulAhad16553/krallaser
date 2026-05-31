import { getAllSlugs } from "@/lib/blogArticles";
import { SITE_URL } from "@/lib/seo";
import { getErpnextImageUrl } from "@/lib/erpnextImageUtils";

export type SitemapImageEntry = {
  loc: string;
  title: string;
  caption: string;
};

export type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  images?: SitemapImageEntry[];
};

const STATIC_ROUTES: { path: string; changefreq: SitemapUrlEntry["changefreq"]; priority: number }[] = [
  { path: "", changefreq: "daily", priority: 1 },
  { path: "/shop", changefreq: "weekly", priority: 0.9 },
  { path: "/parts", changefreq: "weekly", priority: 0.9 },
  { path: "/machine", changefreq: "weekly", priority: 0.9 },
  { path: "/category", changefreq: "weekly", priority: 0.85 },
  { path: "/about-us", changefreq: "monthly", priority: 0.8 },
  { path: "/contact", changefreq: "monthly", priority: 0.8 },
  { path: "/blog", changefreq: "weekly", priority: 0.85 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/terms-conditions", changefreq: "yearly", priority: 0.3 },
];

function entry(
  path: string,
  changefreq: SitemapUrlEntry["changefreq"],
  priority: number,
  lastmod: string,
  images?: SitemapImageEntry[]
): SitemapUrlEntry {
  return {
    loc: `${SITE_URL}${path}`,
    lastmod,
    changefreq,
    priority,
    images,
  };
}

export function getStaticSitemapUrls(): SitemapUrlEntry[] {
  const lastmod = new Date().toISOString().split("T")[0];
  const logoImage: SitemapImageEntry = {
    loc: `${SITE_URL}/krallogo.svg`,
    title: "Krallaser — laser cutting machines & parts Pakistan",
    caption: "Krallaser logo",
  };

  return [
    entry("", "daily", 1, lastmod, [logoImage]),
    ...STATIC_ROUTES.filter((r) => r.path !== "").map((r) =>
      entry(r.path, r.changefreq, r.priority, lastmod)
    ),
    ...getAllSlugs().map((slug) =>
      entry(`/blog/${slug}`, "monthly", 0.75, lastmod)
    ),
  ];
}

/** All sitemap URLs including every product with image metadata for Google Image search. */
export async function getSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const lastmod = new Date().toISOString().split("T")[0];
  const urls = getStaticSitemapUrls();
  const seenLocs = new Set(urls.map((u) => u.loc));

  try {
    const { productService } = await import("@/lib/erpnext/services/productService");
    const [products, categories] = await Promise.all([
      productService.getProducts({ disabled: 0 }),
      productService.getCategories(),
    ]);

    console.log(`Sitemap: adding ${products.length} Krallaser products`);

    for (const product of products) {
      const slug = encodeURIComponent(product.item_code || product.name);
      if (!slug) continue;

      const productName = product.item_name || product.item_code || product.name;
      const productPath = `/product/${slug}`;
      const loc = `${SITE_URL}${productPath}`;
      if (seenLocs.has(loc)) continue;
      seenLocs.add(loc);

      const imagePath = product.website_image || product.image;
      const images: SitemapImageEntry[] = [];
      if (imagePath) {
        const imageLoc = getErpnextImageUrl(imagePath);
        if (imageLoc && imageLoc !== "/placeholder.svg") {
          images.push({
            loc: imageLoc,
            title: productName,
            caption: productName,
          });
        }
      }

      urls.push(entry(productPath, "weekly", 0.85, lastmod, images.length ? images : undefined));
    }

    for (const category of categories) {
      if (Number(category.custom__is_website_item) === 1) continue;
      if (category.is_group) continue;
      const slug = category.name.toLowerCase().replace(/\s+/g, "-");
      const path = `/category/${slug}`;
      const loc = `${SITE_URL}${path}`;
      if (seenLocs.has(loc)) continue;
      seenLocs.add(loc);
      urls.push(entry(path, "weekly", 0.6, lastmod));
    }
  } catch (error) {
    console.error("Sitemap: ERP entries skipped:", error);
  }

  return urls;
}

export function buildSitemapXml(urls: SitemapUrlEntry[]): string {
  const body = urls
    .map((u) => {
      const imageTags =
        u.images
          ?.map(
            (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`
          )
          .join("\n") ?? "";

      return `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>${imageTags ? `\n${imageTags}` : ""}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
