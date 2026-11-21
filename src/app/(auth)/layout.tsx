import type { ReactNode } from "react";
import { ConfigNotice } from "@/components/layout/config-notice";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <ConfigNotice />
      <div className="pt-safe pb-safe mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <main id="main" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
