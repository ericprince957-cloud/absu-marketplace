"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { fail, success, type ActionState } from "@/lib/action-state";
import { categorySchema, formToObject, moderationSchema, validationFailure } from "@/lib/validation";

/**
 * Every action here calls requireAdmin() FIRST. That is a UX/early-exit check;
 * the real enforcement is in the database (RLS + is_admin() inside each RPC),
 * so a forged request from a non-admin is rejected there too.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function reviewSellerApplication(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("application_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (!UUID.test(id) || !["approve", "reject"].includes(decision)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_seller_application", {
    p_application_id: id,
    p_approve: decision === "approve",
    p_note: note || null,
  });
  if (error) console.error("[admin] review_seller_application failed:", error.message);
  revalidatePath("/admin/sellers");
  revalidatePath("/admin");
}

export async function moderateProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = moderationSchema.safeParse({
    product_id: formData.get("product_id"),
    status: formData.get("status"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success || !["approved", "rejected", "archived"].includes(parsed.data.status)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("moderate_product", {
    p_product_id: parsed.data.product_id,
    p_status: parsed.data.status,
    p_note: parsed.data.note ?? null,
  });
  if (error) console.error("[admin] moderate_product failed:", error.message);
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
  revalidatePath("/admin");
}

export async function setUserSuspended(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const suspended = String(formData.get("suspended") ?? "") === "true";
  if (!UUID.test(userId) || userId === admin.id) return; // admins cannot suspend themselves

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_suspended", { p_user_id: userId, p_suspended: suspended });
  if (error) console.error("[admin] admin_set_suspended failed:", error.message);
  revalidatePath("/admin/users");
}

export async function grantFreeSlot(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  if (!UUID.test(userId)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_grant_free_slot", { p_user_id: userId });
  if (error) console.error("[admin] admin_grant_free_slot failed:", error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/seller");
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sort_order,
    is_active: true,
  });
  if (error) {
    if (error.code === "23505") return fail("Please fix the highlighted fields.", { slug: ["That slug is already used"] });
    console.error("[admin] createCategory failed:", error.message);
    return fail("Could not create the category.");
  }
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return success("Category created.");
}

export async function updateCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!UUID.test(id) || !parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      sort_order: parsed.data.sort_order,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) console.error("[admin] updateCategory failed:", error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function submitSellerReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireUser } = await import("@/lib/auth");
  const reporter = await requireUser();
  const sellerId = String(formData.get("seller_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  const allowed = ["scam_or_fraud","fake_or_misleading_listing","unsafe_or_abusive","payment_issue","unresponsive_seller","other"];
  if (!UUID.test(sellerId) || !UUID.test(productId) || sellerId === reporter.id || !allowed.includes(reason) || details.length < 10 || details.length > 1000) {
    return fail("Please select a reason and provide at least 10 characters of detail.");
  }
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("id,seller_id").eq("id", productId).maybeSingle();
  if (!product || product.seller_id !== sellerId) return fail("This seller or listing could not be verified.");
  const { error } = await supabase.from("seller_reports").insert({ reporter_id: reporter.id, seller_id: sellerId, product_id: productId, reason, details });
  if (error) {
    console.error("[reports] submit failed:", error.message);
    return fail("We could not submit your report. Please try again.");
  }
  revalidatePath("/admin/reports");
  return success("Report sent to the marketplace team. Thank you for helping keep the community safe.");
}

export async function updateSellerReport(formData: FormData): Promise<void> {
  await requireAdmin();
  const reportId = String(formData.get("report_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNote = String(formData.get("admin_note") ?? "").trim().slice(0, 500);
  if (!UUID.test(reportId) || !["open","reviewing","resolved","dismissed"].includes(status)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("seller_reports").update({ status, admin_note: adminNote || null, reviewed_at: new Date().toISOString() }).eq("id", reportId);
  if (error) console.error("[admin] update seller report failed:", error.message);
  revalidatePath("/admin/reports");
}
