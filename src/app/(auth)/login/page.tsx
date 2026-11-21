import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { Alert } from "@/components/ui/feedback";
import { getUser } from "@/lib/auth";
import { first, safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeNextPath(first(sp.next), "/dashboard");

  const user = await getUser();
  if (user) redirect(next);

  return (
    <>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-stone-600">Log in to buy, sell and manage your membership.</p>
      <div className="mt-5 space-y-3">
        {first(sp.checkEmail) ? <Alert tone="success">Account created. Check your email and click the confirmation link. After confirmation, return here and log in.</Alert> : null}
        {first(sp.verified) ? <Alert tone="success">Your email has been confirmed. You can now log in.</Alert> : null}
        {first(sp.reset) ? <Alert tone="success">Password updated. Log in with your new password.</Alert> : null}
        {first(sp.error) === "link" ? <Alert tone="error">That confirmation link is invalid or has expired. Please register again or contact support.</Alert> : null}
      </div>
      <div className="mt-5">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        New to ABSU Marketplace?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
