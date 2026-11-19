import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/auth-forms";
import { Alert } from "@/components/ui/feedback";
import { membership } from "@/config/site";
import { getUser } from "@/lib/auth";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getUser()) redirect("/dashboard");
  const remaining = await getFreeSlotsRemaining();

  return (
    <>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-stone-600">Join your fellow ABSU students on the marketplace.</p>

      <div className="mt-5">
        {remaining !== null && remaining > 0 ? (
          <Alert tone="success" title={`${remaining} of ${membership.freeSlotLimit} free lifetime spots left`}>
            Verify your email to claim a free spot. After that, membership is {formatNaira(membership.priceNaira)} per month.
          </Alert>
        ) : remaining === 0 ? (
          <Alert tone="info" title="Free spots are gone">
            Membership is {formatNaira(membership.priceNaira)} per month. You can browse for free and pay when you are ready to sell or order.
          </Alert>
        ) : null}
      </div>

      <div className="mt-5">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
