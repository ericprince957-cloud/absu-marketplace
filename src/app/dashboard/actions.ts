"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { fail, success, type ActionState } from "@/lib/action-state";
import { formToObject, orderStatusSchema, profileSchema, validationFailure } from "@/lib/validation";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/dashboard/profile");
  const parsed = profileSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.full_name,
      username: d.username || null,
      phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      faculty: d.faculty ?? null,
      department: d.department ?? null,
      level: d.level ?? null,
      hostel: d.hostel ?? null,
      bio: d.bio ?? null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return fail("Please fix the highlighted fields.", { username: ["That username is taken"] });
    console.error("[actions] updateProfile failed:", error.message);
    return fail("We could not save your profile. Please try again.");
  }

  revalidatePath("/dashboard", "layout");
  return success("Profile saved.");
}

/**
 * Change an order's status. The database function decides who may do what:
 * buyers can cancel their pending orders; sellers can confirm, complete or cancel.
 */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const user = await requireUser("/dashboard/orders");
  const parsed = orderStatusSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: parsed.data.order_id,
    p_status: parsed.data.status,
  });
  if (error) console.error("[actions] update_order_status failed:", user.id, error.message);

  revalidatePath("/dashboard/orders");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/sales");
}

export async function markNotificationsRead(): Promise<void> {
  const user = await requireUser("/dashboard/notifications");
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
  if (error) console.error("[actions] markNotificationsRead failed:", error.message);
  revalidatePath("/dashboard", "layout");
}
