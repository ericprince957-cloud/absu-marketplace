"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership, getRoles, requireUser } from "@/lib/auth";
import { fail, success, type ActionState } from "@/lib/action-state";
import { MAX_IMAGES_PER_PRODUCT, STORAGE_BUCKET } from "@/config/site";
import { formToObject, productSchema, sellerApplicationSchema, validationFailure } from "@/lib/validation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------- applications

export async function submitSellerApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/seller/apply");
  const parsed = sellerApplicationSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const roles = await getRoles(user.id);
  if (roles.includes("seller")) return fail("You are already an approved seller.");

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").update({ full_name: parsed.data.full_name, phone: parsed.data.phone, whatsapp: parsed.data.phone }).eq("id", user.id);
  if (profileError) return fail("We could not save your contact details. Please try again.");
  const { data: open } = await supabase
    .from("seller_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  const application = {
    business_name: parsed.data.business_name,
    description: parsed.data.description,
    categories_text: parsed.data.categories_text ?? null,
    phone: parsed.data.phone,
    location: parsed.data.location,
  };
  const { error } = open
    ? await supabase.from("seller_applications").update(application).eq("id", open.id).eq("user_id", user.id)
    : await supabase.from("seller_applications").insert({ ...application, user_id: user.id });
  if (error) {
    console.error("[actions] submitSellerApplication failed:", error.message);
    return fail("We could not submit your application. Please try again.");
  }

  revalidatePath("/seller/apply");
  return success("Application submitted. We will review it and notify you.");
}

// -------------------------------------------------------------------- products

export type SaveProductResult = ActionState & { productId?: string };

/** Create (id = null) or update a listing. Changes always go back to review. */
export async function saveProduct(id: string | null, formData: FormData): Promise<SaveProductResult> {
  const user = await requireUser("/seller/products");

  const roles = await getRoles(user.id);
  if (!roles.includes("seller")) return fail("Only approved sellers can list products.");

  const membership = await getMembership(user.id);
  if (!membership.hasAccess) return fail("Your seller access is not active. Renew it to list products.");

  const parsed = productSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const d = parsed.data;

  const fields = {
    title: d.title,
    description: d.description,
    price: d.price,
    category_id: d.category_id,
    condition: d.condition,
    quantity: d.quantity,
    location: d.location ?? null,
    campus_area: d.campus_area || null,
    hostel_name: d.hostel_name ?? null,
    academic_department: d.academic_department ?? null,
    academic_level: d.academic_level || null,
    course_code: d.course_code ?? null,
    status: "pending" as const,
    moderation_note: null,
  };

  const supabase = await createClient();

  if (id) {
    if (!UUID.test(id)) return fail("Invalid product.");
    const { data, error } = await supabase.from("products").update(fields).eq("id", id).eq("seller_id", user.id).select("id").maybeSingle();
    if (error || !data) {
      console.error("[actions] update product failed:", error?.message);
      return fail("We could not save your changes.");
    }
    revalidatePath("/seller/products");
    revalidatePath(`/product/${id}`);
    return { ok: true, productId: id, message: "Saved" };
  }

  const { data, error } = await supabase.from("products").insert({ ...fields, seller_id: user.id }).select("id").single();
  if (error || !data) {
    console.error("[actions] insert product failed:", error?.message);
    return fail("We could not create your listing. Please try again.");
  }
  revalidatePath("/seller/products");
  return { ok: true, productId: data.id as string, message: "Created" };
}

/** Register photos the browser has already uploaded to Storage (paths must be inside the user's own folder). */
export async function attachProductImages(productId: string, paths: string[]): Promise<ActionState> {
  const user = await requireUser("/seller/products");
  if (!UUID.test(productId) || paths.length === 0) return fail("Invalid request.");

  const prefix = `${user.id}/${productId}/`;
  if (!paths.every((p) => p.startsWith(prefix) && !p.includes(".."))) return fail("Invalid image path.");

  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("id").eq("id", productId).eq("seller_id", user.id).maybeSingle();
  if (!product) return fail("Product not found.");

  const { data: existing, error: listError } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false });
  if (listError) return fail("We could not read your photos.");
  if ((existing?.length ?? 0) + paths.length > MAX_IMAGES_PER_PRODUCT) return fail(`You can add up to ${MAX_IMAGES_PER_PRODUCT} photos.`);

  const start = (existing?.[0]?.position ?? -1) + 1;
  const { error } = await supabase
    .from("product_images")
    .insert(paths.map((path, i) => ({ product_id: productId, path, position: start + i })));
  if (error) {
    console.error("[actions] attachProductImages failed:", error.message);
    return fail("We could not save your photos.");
  }
  revalidatePath("/seller/products");
  revalidatePath(`/product/${productId}`);
  return success();
}

export async function deleteProductImage(imageId: string): Promise<ActionState> {
  await requireUser("/seller/products");
  if (!UUID.test(imageId)) return fail("Invalid image.");

  const supabase = await createClient();
  // RLS only returns rows for products the user owns.
  const { data: img } = await supabase.from("product_images").select("id,path,product_id").eq("id", imageId).maybeSingle();
  if (!img) return fail("Photo not found.");

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return fail("We could not remove that photo.");

  await supabase.storage.from(STORAGE_BUCKET).remove([img.path]);
  revalidatePath(`/product/${img.product_id}`);
  return success();
}

export async function setMyProductStatus(formData: FormData): Promise<void> {
  const user = await requireUser("/seller/products");
  const id = String(formData.get("product_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID.test(id) || !["sold", "archived"].includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", id).eq("seller_id", user.id);
  if (error) console.error("[actions] setMyProductStatus failed:", error.message);
  revalidatePath("/seller/products");
  revalidatePath(`/product/${id}`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const user = await requireUser("/seller/products");
  const id = String(formData.get("product_id") ?? "");
  if (!UUID.test(id)) return;

  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("path").eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id).eq("seller_id", user.id);
  if (error) {
    console.error("[actions] deleteProduct failed:", error.message);
    return;
  }
  const paths = (images ?? []).map((i: { path: string }) => i.path);
  if (paths.length > 0) await supabase.storage.from(STORAGE_BUCKET).remove(paths);

  revalidatePath("/seller/products");
  revalidatePath("/marketplace");
}
