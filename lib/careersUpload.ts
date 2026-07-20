export const MAX_CV_IMAGE_SIZE_MB = 3;
export const MAX_CV_IMAGE_SIZE_BYTES = MAX_CV_IMAGE_SIZE_MB * 1024 * 1024;

export const ALLOWED_CV_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;

export const ALLOWED_CV_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const CV_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export function isAllowedCvImage(file: File): boolean {
  const ext = getFileExtension(file.name);
  if (ALLOWED_CV_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_CV_IMAGE_EXTENSIONS)[number])) {
    return true;
  }
  if (file.type && ALLOWED_CV_IMAGE_TYPES.has(file.type)) return true;
  return false;
}

export function isImageCvFilename(filename?: string): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename).replace(".", "");
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
}

export function isPdfCvFilename(filename?: string): boolean {
  return filename?.toLowerCase().endsWith(".pdf") ?? false;
}
