"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
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
    if (m.includes("membership_required")) return fail("You need an active membership to place orders.");
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
