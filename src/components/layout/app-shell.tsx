import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AppMenu } from "@/components/layout/app-menu";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ConfigNotice } from "@/components/layout/config-notice";
import { Logo } from "@/components/layout/logo";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { logout } from "@/app/(auth)/actions";

/** Shared frame for the student, seller and admin areas. Always signed-in. */
export function AppShell({
  area,
  items,
  children,
  switchLinks,
}: {
  area: string;
  items: NavItem[];
  children: ReactNode;
  switchLinks?: { href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen bg-cream pb-tabbar">
      <ConfigNotice />
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <span className="hidden rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-white md:inline">{area}</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              {switchLinks?.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200/60">
                  {l.label}
                </Link>
              ))}
            </div>
            <AppMenu area={area} items={items} switchLinks={switchLinks} />
            <form action={logout} className="hidden md:block">
              <button type="submit" aria-label="Log out" className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-stone-700 active:bg-stone-200 sm:hover:bg-stone-200/60">
                <LogOut className="size-[18px]" aria-hidden />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 md:grid md:grid-cols-[230px_1fr] md:gap-8 md:py-8">
        <aside className="md:sticky md:top-24 md:self-start">
          <SidebarNav items={items} />
        </aside>
        <main id="main" className="min-w-0 pt-2 md:pt-0">
          {children}
        </main>
      </div>
      <BottomNav signedIn />
    </div>
  );
}
