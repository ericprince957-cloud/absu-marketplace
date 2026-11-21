import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerificationForm, VerifySignupOtpForm } from "@/components/auth/auth-forms";
import { first } from "@/lib/utils";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const email = first((await searchParams).email)?.trim().toLowerCase() ?? "";

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <MailCheck className="size-7" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {email ? (
          <>
            We sent a 6-digit verification code to <strong className="text-stone-900">{email}</strong>.
          </>
        ) : (
          "We sent a 6-digit verification code to your email address."
        )}{" "}
        Enter the code below to activate your account and claim your membership spot. Check your spam folder if it is not in your inbox.
      </p>

      {email ? (
        <div className="mt-6 space-y-5 text-left">
          <VerifySignupOtpForm email={email} />
          <div className="border-t border-stone-200 pt-4">
            <p className="mb-3 text-center text-xs text-stone-500">Did not receive a code?</p>
            <ResendVerificationForm email={email} />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-stone-600">
          Return to <Link href="/register" className="font-semibold text-brand-700 hover:underline">create account</Link> and enter your email again.
        </p>
      )}

      <p className="mt-6 text-sm text-stone-600">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
