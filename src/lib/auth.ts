import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { membership } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import type { MembershipEntitlement, MembershipInfo, Profile, Role } from "@/types";

/** Current authenticated user, verified with the Supabase Auth server (not just a cookie). */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export async function requireUser(nextPath = "/dashboard"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!user.email_confirmed_at) redirect(`/verify-email?email=${encodeURIComponent(user.email ?? "")}`);
  return user;
}

export const getRoles = cache(async (userId: string): Promise<Role[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) {
    console.error("[auth] getRoles failed:", error.message);
    return [];
  }
  return (data ?? []).map((r: { role: Role }) => r.role);
});

export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin");
  const roles = await getRoles(user.id);
  // 404 (not 403) so the existence of the admin area is not advertised.
  if (!roles.includes("admin")) notFound();
  return user;
}

export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    console.error("[auth] getProfile failed:", error.message);
    return null;
  }
  return (data as Profile | null) ?? null;
});

export function computeMembership(row: MembershipEntitlement | null): MembershipInfo {
  if (!row) return { state: "none", hasAccess: false, freeSlotNumber: null, paidUntil: null, canRenew: false };

  if (row.kind === "free_lifetime") {
    const active = row.status === "active";
    return {
      state: active ? "free_lifetime" : "expired",
      hasAccess: active,
      freeSlotNumber: row.free_slot_number,
      paidUntil: null,
      canRenew: false,
    };
  }

  const expiresAt = row.paid_until ? new Date(row.paid_until).getTime() : 0;
  const stillValid = row.status === "active" && expiresAt > Date.now();
  const renewFrom = expiresAt - membership.renewWindowDays * 24 * 60 * 60 * 1000;
  return {
    state: stillValid ? "active" : "expired",
    hasAccess: stillValid,
    freeSlotNumber: null,
    paidUntil: row.paid_until,
    canRenew: stillValid && Date.now() >= renewFrom,
  };
}

/** Membership as seen by the database (RLS: users can read only their own row). */
export const getMembership = cache(async (userId: string): Promise<MembershipInfo> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_entitlements")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] getMembership failed:", error.message);
    return computeMembership(null);
  }
  return computeMembership(data as MembershipEntitlement | null);
});
