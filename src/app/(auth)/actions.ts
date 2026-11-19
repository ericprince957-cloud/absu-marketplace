"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fail, success, type ActionState } from "@/lib/action-state";
import { safeNextPath } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site-url";
import {
  forgotSchema,
  formToObject,
  loginSchema,
  registerSchema,
  resetSchema,
  validationFailure,
} from "@/lib/validation";

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const { full_name, email, phone, password } = parsed.data;

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Copied into `profiles` by the database trigger (see docs/BACKEND_CONTRACT.md).
      data: { full_name, phone: phone || null },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard?verified=1")}`,
    },
  });

  if (error) {
    if (/password/i.test(error.message)) return fail(error.message, { password: [error.message] });
    if (/rate limit|too many/i.test(error.message)) return fail("Too many attempts. Please wait a few minutes and try again.");
    console.error("[auth] signUp failed:", error.message);
    return fail("We could not create your account. Please try again.");
  }

  // Same response whether or not the email already exists (prevents account enumeration).
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (/not confirmed/i.test(error.message)) {
      redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
    }
    return fail("Incorrect email or password.");
  }

  const { data: profile } = await supabase.from("profiles").select("is_suspended").eq("id", data.user.id).maybeSingle();
  if (profile?.is_suspended) {
    await supabase.auth.signOut();
    return fail("This account has been suspended. Contact support if you think this is a mistake.");
  }

  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resendVerification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Enter a valid email address.");

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard?verified=1")}` },
  });

  if (error) {
    if (/rate limit|too many|seconds/i.test(error.message)) return fail("Please wait a minute before requesting another email.");
    console.error("[auth] resend failed:", error.message);
    return fail("We could not send the email. Please try again shortly.");
  }
  return success("Verification email sent. Check your inbox and spam folder.");
}

export async function forgotPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) console.error("[auth] resetPasswordForEmail failed:", error.message);

  // Always the same message so attackers cannot discover which emails are registered.
  return success("If an account exists for that email, a reset link is on its way.");
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return fail("Your reset link has expired. Request a new one.");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (/same|different/i.test(error.message)) return fail("Choose a password you have not used before.");
    console.error("[auth] updateUser failed:", error.message);
    return fail("We could not update your password. Please try again.");
  }

  await supabase.auth.signOut();
  redirect("/login?reset=1");
}
