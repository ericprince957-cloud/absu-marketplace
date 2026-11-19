import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("[data] listCategories failed:", error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) {
    console.error("[data] getCategoryBySlug failed:", error.message);
    return null;
  }
  return (data as Category | null) ?? null;
}
