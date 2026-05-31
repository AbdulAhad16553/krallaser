import { BRAND_NAME } from "@/lib/brand";

type ProductNameSource = {
  item_name?: string | null;
  name?: string | null;
  item_code?: string | null;
};

/** Human-readable product title (ERP item name first). */
export function getProductDisplayName(product: ProductNameSource): string {
  return (
    product.item_name?.trim() ||
    product.name?.trim() ||
    product.item_code?.trim() ||
    "Product"
  );
}

/** Image alt / Google Image title — item name only so search shows the product name. */
export function productImageAlt(productName: string): string {
  return productName?.trim() || "Product";
}

/** Browser tab & web results: product name first. */
export function productPageTitle(productName: string): string {
  const name = productName?.trim() || "Product";
  return name;
}

/** Absolute metadata title = item name only (no site suffix). */
export function productMetadataTitle(productName: string) {
  return { absolute: productPageTitle(productName) };
}

export function productMetaDescription(productName: string, itemGroup?: string): string {
  const name = productName?.trim() || "Product";
  const group = itemGroup?.trim();
  return group
    ? `${name} — buy at ${BRAND_NAME}, Pakistan. ${group}. Laser cutting machines & parts. Lahore support, nationwide delivery.`
    : `${name} — buy at ${BRAND_NAME}, Pakistan. Laser cutting machines & parts. Lahore support, nationwide delivery.`;
}

export function productImageCaption(productName: string): string {
  return productImageAlt(productName);
}
