import { z } from "zod";
import { ORDER_STATUSES, PRODUCT_CONDITIONS, PRODUCT_STATUSES } from "@/config/site";
import type { ActionState } from "@/lib/action-state";

const phone = z.string().trim().regex(/^\+?[0-9\s-]{10,16}$/, "Enter a valid phone number, e.g. 08012345678");
const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`).optional().transform((v) => (v ? v : undefined));
const password = z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters").regex(/[A-Za-z]/, "Include at least one letter").regex(/[0-9]/, "Include at least one number");

export const registerSchema = z.object({ full_name: z.string().trim().min(2, "Enter your full name").max(80), email: z.string().trim().toLowerCase().email("Enter a valid email address"), phone: phone.optional().or(z.literal("")), password, confirm_password: z.string() }).refine((d) => d.password === d.confirm_password, { path: ["confirm_password"], message: "Passwords do not match" });
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") });
export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address") });
export const resetSchema = z.object({ password, confirm_password: z.string() }).refine((d) => d.password === d.confirm_password, { path: ["confirm_password"], message: "Passwords do not match" });
export const profileSchema = z.object({ full_name: z.string().trim().min(2, "Enter your full name").max(80), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/, "3-30 characters: letters, numbers and underscore").optional().or(z.literal("")), phone: phone.optional().or(z.literal("")), whatsapp: phone.optional().or(z.literal("")), faculty: optionalText(80), department: optionalText(80), level: optionalText(20), hostel: optionalText(80), bio: optionalText(300) });
export const productSchema = z.object({ title: z.string().trim().min(3, "Title is too short").max(120, "Keep the title under 120 characters"), description: z.string().trim().min(10, "Describe the item in at least 10 characters").max(2000), price: z.coerce.number({ error: "Enter a price" }).positive("Price must be greater than 0").max(100_000_000), category_id: z.string().uuid("Choose a category"), condition: z.enum(PRODUCT_CONDITIONS.map((c) => c.value) as [string, ...string[]]), quantity: z.coerce.number().int("Whole numbers only").min(1, "At least 1").max(1000), location: optionalText(100), campus_area: z.enum(["Main Campus","Permanent Site","Annex","Off-Campus","Town"]).optional().or(z.literal("")), hostel_name: optionalText(100), academic_department: optionalText(100), academic_level: z.enum(["100L","200L","300L","400L","500L"]).optional().or(z.literal("")), course_code: optionalText(30) }).superRefine((d, ctx) => { if (["0370b302-780b-48ff-a75a-e1b4754c9aac","745bc3a9-214f-4263-990f-1e46e3a21254"].includes(d.category_id)) { for (const key of ["academic_department","academic_level","course_code"] as const) if (!d[key]) ctx.addIssue({ code: "custom", path: [key], message: "Required for study materials" }); } });
export const sellerApplicationSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  business_name: z.string().trim().min(2, "Enter a shop or business name").max(80),
  description: z.string().trim().min(10, "Tell buyers what you plan to sell").max(1000),
  categories_text: optionalText(200),
  phone,
  location: z.string().trim().min(2, "Enter your hostel, street or pickup area").max(120),
});
export const orderSchema = z.object({ product_id: z.string().uuid(), quantity: z.coerce.number().int().min(1, "At least 1").max(100), note: optionalText(300) });
export const categorySchema = z.object({ name: z.string().trim().min(2, "Name is too short").max(50), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"), description: optionalText(200), sort_order: z.coerce.number().int().min(0).max(1000).default(0) });
export const contactSchema = z.object({ name: z.string().trim().min(2, "Enter your name").max(80), email: z.string().trim().toLowerCase().email("Enter a valid email address"), subject: z.string().trim().min(3, "Add a subject").max(120), message: z.string().trim().min(10, "Message is too short").max(2000) });
export const moderationSchema = z.object({ product_id: z.string().uuid(), status: z.enum(PRODUCT_STATUSES), note: optionalText(300) });
export const orderStatusSchema = z.object({ order_id: z.string().uuid(), status: z.enum(ORDER_STATUSES) });

export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}
export function validationFailure(error: z.ZodError): ActionState {
  return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined> };
}
