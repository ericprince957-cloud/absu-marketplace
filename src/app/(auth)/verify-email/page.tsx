import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerificationForm } from "@/components/auth/auth-forms";
import { first } from "@/lib/utils";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const email = first((await searchParams).email) ?? "";

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <MailCheck className="size-7" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {email ? (
          <>
            We sent a verification link to <strong className="text-stone-900">{email}</strong>.
          </>
        ) : (
          "We sent you a verification link."
        )}{" "}
        Open it to activate your account and claim your membership spot. Check spam if you do not see it.
      </p>
      {email ? (
        <div className="mt-6 text-left">
          <ResendVerificationForm email={email} />
        </div>
      ) : null}
      <p className="mt-6 text-sm text-stone-600">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
