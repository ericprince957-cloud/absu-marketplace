import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SellerApplicationForm } from "@/components/dashboard/seller-application-form";
import { Alert, StatusBadge } from "@/components/ui/feedback";
import { Card, PageHeader } from "@/components/ui/card";
import { getProfile, getRoles, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { SellerApplication } from "@/types";

export const metadata: Metadata = { title: "Become a seller" };

export default async function ApplyPage() {
  const user = await requireUser("/seller/apply");
  const roles = await getRoles(user.id);
  if (roles.includes("seller")) redirect("/seller");

  const supabase = await createClient();
  const [{ data }, profile] = await Promise.all([
    supabase.from("seller_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
    getProfile(user.id),
  ]);
  const latest = (data?.[0] ?? null) as SellerApplication | null;

  return (
    <>
      <PageHeader title="Become a seller" description="Tell us a little about what you plan to sell. Most applications are reviewed quickly." />

      {latest?.status === "pending" ? (
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Application under review</h2>
            <StatusBadge status="pending" />
          </div>
          <p className="text-sm text-stone-600">
            You applied on {formatDate(latest.created_at)} as <strong>{latest.business_name}</strong>. We will notify you as soon as there is a decision.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {latest?.status === "rejected" ? (
            <Alert tone="error" title="Your last application was not approved">
              {latest.admin_note ? `Reason: ${latest.admin_note}. ` : ""}You can apply again with more detail.
            </Alert>
          ) : null}
          <Card>
            <SellerApplicationForm defaultPhone={profile?.whatsapp ?? profile?.phone} defaultFullName={profile?.full_name} />
          </Card>
        </div>
      )}
    </>
  );
}
