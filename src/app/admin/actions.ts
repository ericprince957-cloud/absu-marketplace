"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { fail, success, type ActionState } from "@/lib/action-state";
import { categorySchema, formToObject, moderationSchema, validationFailure } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

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


export async function verifyUserAndNotify(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  if (!UUID.test(userId)) return;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Email delivery is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel before verifying users.");

  const admin = createAdminClient();
  const [{ data: authData, error: authError }, { data: profile, error: profileError }, { data: roleRows }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle(),
    admin.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (authError || !authData.user?.email) throw new Error("Could not find this user's authentication account.");
  if (profileError) throw new Error("Could not load this user's profile.");
  const email = authData.user.email;
  const name = profile?.full_name?.trim() || "ABSU Trade member";
  const roles = (roleRows ?? []).map((row) => row.role);
  const access = roles.includes("seller") ? "Seller access is enabled on your account." : "Your ABSU Trade account is now verified.";
  const siteUrl = await getSiteUrl();
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
  if (updateError) throw new Error("The email could not be marked as verified. Please try again.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [email], subject: "Your ABSU Trade account has been verified",
      html: '<!doctype html><html><body style="margin:0;background:#f5f5f4;padding:32px 16px;font-family:Arial,sans-serif;color:#171717"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:32px"><p style="font-size:13px;font-weight:700;letter-spacing:1px;color:#166044">ABSU TRADE</p><h1 style="font-size:24px">Your account is verified</h1><p>Hello ' + escapeHtml(name) + ',</p><p>Good news! The ABSU Trade team has manually verified your account.</p><p>' + escapeHtml(access) + '</p><p>You can now sign in and continue using ABSU Trade.</p><p style="margin:28px 0"><a href="' + siteUrl + '" style="display:inline-block;background:#166044;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Visit ABSU Trade</a></p><p style="font-size:12px;color:#78716c">If you have questions, reply to this email or contact ABSU Trade support.</p></div></body></html>',
    }),
  });
  if (!response.ok) {
    console.error("[admin] verification email failed:", await response.text());
    throw new Error("The account is verified, but the email could not be sent. Check the email provider settings and use Resend verified email to try again.");
  }
  revalidatePath("/admin/users");
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
