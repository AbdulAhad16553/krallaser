import { ABOUT_US_SHORT } from "@/lib/aboutUsCopy";
import { BRAND_NAME } from "@/lib/brand";

const PAGE_COPY: Record<string, { title: string; content: string; meta_description: string }> = {
  "about-us": {
    title: `About ${BRAND_NAME}`,
    content: ABOUT_US_SHORT,
    meta_description:
      "Krallaser imports metal fiber laser cutting machines and parts in Lahore, Pakistan—not wood CNC routers.",
  },
  home: {
    title: BRAND_NAME,
    content:
      "Metal fiber laser cutting machines and spare parts in Pakistan. 1kW–3kW fiber lasers, Cypcut, Weihong, Lahore support.",
    meta_description:
      "Buy metal fiber laser cutting machines and parts in Pakistan from Krallaser.",
  },
};

export const getStorePage = async (_storeId: string, pageSlug: string) => {
  try {
    const copy = PAGE_COPY[pageSlug];
    const page = {
      id: pageSlug,
      title: copy?.title ?? pageSlug,
      content: copy?.content ?? `Learn more on ${BRAND_NAME}.`,
      slug: pageSlug,
      meta_title: copy?.title ?? pageSlug,
      meta_description:
        copy?.meta_description ?? `Learn more about ${pageSlug} on ${BRAND_NAME}.`,
      status: "published" as const,
    };

    return { page };
  } catch (error) {
    console.error("Error fetching store page:", error);
    return { page: null };
  }
};