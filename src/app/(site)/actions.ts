"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoles, getUser, requireUser } from "@/lib/auth";
import { fail, success, type ActionState } from "@/lib/action-state";
import { contactSchema, formToObject, orderSchema, validationFailure } from "@/lib/validation";

/** Save or unsave a product for the logged-in user. */
export async function toggleSaved(productId: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(productId)) return { ok: false };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("saved_products")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", productId)
    : await supabase.from("saved_products").insert({ user_id: user.id, product_id: productId });

  if (error) {
    console.error("[actions] toggleSaved failed:", error.message);
    return { ok: false };
  }
  revalidatePath("/dashboard/saved");
  return { ok: true };
}

/** Place a free buyer order request. The database checks stock, availability and ownership. */
export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getUser();
  if (!user) return fail("Please log in to place an order.");

  const parsed = orderSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.rpc("place_order", {
    p_product_id: parsed.data.product_id,
    p_quantity: parsed.data.quantity,
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    const m = error.message;
    if (m.includes("account_suspended")) return fail("This account is currently restricted.");
    if (m.includes("own_product")) return fail("You cannot order your own product.");
    if (m.includes("out_of_stock")) return fail("Not enough stock available for that quantity.");
    if (m.includes("not_available")) return fail("This product is no longer available.");
    console.error("[actions] place_order failed:", m);
    return fail("We could not place your order. Please try again.");
  }

  revalidatePath("/dashboard/orders");
  return success("Order sent. The seller has been notified. Track it under My orders.");
}

/** Public contact form. Stored in `support_messages` (insert-only for visitors). */
export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("website") ?? "").length > 0) return success("Thanks, we received your message.");

  const parsed = contactSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("support_messages").insert(parsed.data);
  if (error) {
    console.error("[actions] submitContact failed:", error.message);
    return fail("We could not send your message. Please try again.");
  }
  return success("Thanks, we received your message and will reply by email.");
}


/** Create an In Search Of request for the campus community. */
export async function createItemRequest(formData: FormData): Promise<void> {
  const user = await requireUser("/requests");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const campusArea = String(formData.get("campus_area") ?? "").trim();
  const hostelName = String(formData.get("hostel_name") ?? "").trim();
  const neededBy = String(formData.get("needed_by") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const areas = ["Main Campus", "Permanent Site", "Annex", "Off-Campus", "Town"];
  if (title.length < 5 || title.length > 120 || description.length < 10 || description.length > 1500 || (campusArea && !areas.includes(campusArea)) || hostelName.length > 100 || (categoryId && !/^[0-9a-f-]{36}$/i.test(categoryId))) {
    redirect("/requests?error=invalid");
  }
  if (neededBy && (!/^\d{4}-\d{2}-\d{2}$/.test(neededBy) || Number.isNaN(Date.parse(neededBy)) || neededBy < new Date().toISOString().slice(0, 10))) {
    redirect("/requests?error=date");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("item_requests").insert({
    requester_id: user.id, title, description, category_id: categoryId || null, campus_area: campusArea || null,
    hostel_name: hostelName || null, needed_by: neededBy || null,
  });
  if (error) {
    console.error("[actions] createItemRequest failed:", error.message);
    redirect("/requests?error=save");
  }
  revalidatePath("/requests");
  redirect("/requests?created=1");
}

/** Approved sellers can respond to an open request; their verified profile WhatsApp is used. */
export async function respondToItemRequest(formData: FormData): Promise<void> {
  const user = await requireUser("/requests");
  const requestId = String(formData.get("request_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || message.length < 5 || message.length > 800) redirect("/requests?error=response");
  const roles = await getRoles(user.id);
  if (!roles.includes("seller")) redirect("/seller/apply");
  const supabase = await createClient();
  const [{ data: profile }, { data: request }] = await Promise.all([
    supabase.from("profiles").select("whatsapp").eq("id", user.id).maybeSingle(),
    supabase.from("item_requests").select("id").eq("id", requestId).eq("status", "open").maybeSingle(),
  ]);
  if (!request) redirect("/requests?error=closed");
  if (!profile?.whatsapp) redirect("/requests?error=whatsapp");
  const { error } = await supabase.from("item_request_responses").insert({
    request_id: requestId, seller_id: user.id, message, contact_whatsapp: profile?.whatsapp ?? null,
  });
  if (error) {
    console.error("[actions] respondToItemRequest failed:", error.message);
    redirect("/requests?error=duplicate");
  }
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  redirect("/requests?responded=1");
}
