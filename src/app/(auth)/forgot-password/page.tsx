import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-stone-600">Enter your email and we will send you a reset link.</p>
      <div className="mt-5">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
