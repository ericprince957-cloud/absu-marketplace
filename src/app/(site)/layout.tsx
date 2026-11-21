import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ConfigNotice } from "@/components/layout/config-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getUser } from "@/lib/auth";
import { getNavBadges } from "@/lib/data/badges";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [user, badges] = await Promise.all([getUser(), getNavBadges()]);

  return (
    <div className="pb-tabbar">
      <ConfigNotice />
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[60vh] max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        {children}
      </main>
      <SiteFooter />
      <BottomNav signedIn={Boolean(user)} badges={badges} />
    </div>
  );
}
