import { MAX_IMAGE_BYTES } from "@/config/site";

const MAX_DIMENSION = 1600;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Resize and re-encode a photo in the browser so uploads are small and fast on mobile data. */
export async function compressImage(file: File): Promise<Blob> {
  if (!ALLOWED.includes(file.type)) throw new Error("Use JPG, PNG or WebP photos.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Could not process the photo.");
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("That photo is too large. Try a smaller one.");
  return blob;
}
