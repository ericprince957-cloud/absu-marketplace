import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = ["", "/marketplace", "/pricing", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`,
  }));

  try {
    const supabase = await createClient();
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from("categories").select("slug").eq("is_active", true),
      supabase.from("products").select("id,updated_at").eq("status", "approved").order("updated_at", { ascending: false }).limit(1000),
    ]);
    (cats ?? []).forEach((c: { slug: string }) => entries.push({ url: `${base}/category/${c.slug}` }));
    (prods ?? []).forEach((p: { id: string; updated_at: string }) =>
      entries.push({ url: `${base}/product/${p.id}`, lastModified: p.updated_at }),
    );
  } catch {
    // Backend unavailable: static pages only.
  }
  return entries;
}
