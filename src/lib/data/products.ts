import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/config/site";
import { sanitizeSearch } from "@/lib/utils";
import type { Product, ProductCondition, SellerPublic } from "@/types";

export const PRODUCT_SELECT =
  "*, categories(id,name,slug), product_images(id,product_id,path,position)";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID_RE.test(v);

export type ProductSort = "newest" | "price_asc" | "price_desc";

export interface ProductQuery {
  q?: string;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  campusArea?: string;
  academicDepartment?: string;
  academicLevel?: string;
  courseCode?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

function sortImages(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    product_images: [...(p.product_images ?? [])].sort((a, b) => a.position - b.position),
  }));
}

/** Public listing: approved products only (RLS enforces this too). */
export async function listProducts(query: ProductQuery = {}): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, query.page ?? 1);
  const from = (page - 1) * pageSize;

  let req = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("status", "approved");

  const q = sanitizeSearch(query.q);
  if (q) req = req.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (query.categoryId && isUuid(query.categoryId)) req = req.eq("category_id", query.categoryId);
  if (query.sellerId && isUuid(query.sellerId)) req = req.eq("seller_id", query.sellerId);
  if (query.minPrice !== undefined && Number.isFinite(query.minPrice)) req = req.gte("price", query.minPrice);
  if (query.maxPrice !== undefined && Number.isFinite(query.maxPrice)) req = req.lte("price", query.maxPrice);
  if (query.condition) req = req.eq("condition", query.condition);
  if (query.campusArea) req = req.eq("campus_area", query.campusArea);
  if (query.academicDepartment) req = req.ilike("academic_department", `%${sanitizeSearch(query.academicDepartment)}%`);
  if (query.academicLevel) req = req.eq("academic_level", query.academicLevel);
  if (query.courseCode) req = req.ilike("course_code", `%${sanitizeSearch(query.courseCode)}%`);

  if (query.sort === "price_asc") req = req.order("price", { ascending: true });
  else if (query.sort === "price_desc") req = req.order("price", { ascending: false });
  else req = req.order("created_at", { ascending: false });

  const { data, count, error } = await req.range(from, from + pageSize - 1);
  if (error) {
    console.error("[data] listProducts failed:", error.message);
    return { products: [], total: 0 };
  }
  return { products: sortImages((data ?? []) as unknown as Product[]), total: count ?? 0 };
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  // RLS: visitors can read approved products; owners and admins can also read their own/pending ones.
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) {
    console.error("[data] getProduct failed:", error.message);
    return null;
  }
  if (!data) return null;
  return sortImages([data as unknown as Product])[0];
}

export async function getSellerPublic(sellerId: string): Promise<SellerPublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("seller_public").select("*").eq("id", sellerId).maybeSingle();
  if (error) {
    console.error("[data] getSellerPublic failed:", error.message);
    return null;
  }
  return (data as SellerPublic | null) ?? null;
}

export async function getSavedProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_products")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", productIds);
  if (error) {
    console.error("[data] getSavedProductIds failed:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r: { product_id: string }) => r.product_id));
}

export async function listSavedProducts(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_products")
    .select(`created_at, products(${PRODUCT_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[data] listSavedProducts failed:", error.message);
    return [];
  }
  const rows = (data ?? []) as unknown as { products: Product | Product[] | null }[];
  const items = rows
    .map((r) => (Array.isArray(r.products) ? r.products[0] : r.products))
    .filter((p): p is Product => Boolean(p));
  return sortImages(items);
}

export async function listSellerProducts(sellerId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[data] listSellerProducts failed:", error.message);
    return [];
  }
  return sortImages((data ?? []) as unknown as Product[]);
}

export async function getSellerContact(
  productId: string,
): Promise<{ whatsapp: string | null; phone: string | null; full_name: string | null } | null> {
  const supabase = await createClient();
  // Database function: returns WhatsApp contact for an approved, non-suspended seller listing.
  const { data, error } = await supabase.rpc("get_seller_contact", { p_product_id: productId });
  if (error) {
    console.error("[data] getSellerContact failed:", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}
