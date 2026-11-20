import type { ReactNode } from "react";
import { ConfigNotice } from "@/components/layout/config-notice";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ConfigNotice />
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[60vh] max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-10">
        {children}
      </main>
      <MobileBottomNav />
      <SiteFooter />
    </>
  );
}
