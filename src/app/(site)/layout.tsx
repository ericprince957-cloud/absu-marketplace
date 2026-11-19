import type { ReactNode } from "react";
import { ConfigNotice } from "@/components/layout/config-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ConfigNotice />
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
