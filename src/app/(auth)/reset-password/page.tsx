import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  // The emailed link signs the user in via /auth/callback; without a session there is nothing to reset.
  const user = await getUser();
  if (!user) redirect("/login?error=link");

  return (
    <>
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <p className="mt-1 text-sm text-stone-600">Pick something you do not use anywhere else.</p>
      <div className="mt-5">
        <ResetPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Cancel
        </Link>
      </p>
    </>
  );
}
