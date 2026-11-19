import type { ReactNode } from "react";
import { ConfigNotice } from "@/components/layout/config-notice";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <ConfigNotice />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <main id="main" className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
