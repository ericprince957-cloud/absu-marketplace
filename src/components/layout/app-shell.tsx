import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { ConfigNotice } from "@/components/layout/config-notice";
import { logout } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

export function AppShell({ area, items, children, switchLinks }: {
  area: string; items: NavItem[]; children: ReactNode;
  switchLinks?: { href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-stone-50">
      <ConfigNotice />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-3 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
          <Logo />
          <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 sm:inline">{area}</span>
          <div className="ml-auto flex shrink-0 items-center">
            <form action={logout}>
              <button type="submit" aria-label="Log out" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                <LogOut className="size-4" aria-hidden /><span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
          {switchLinks?.length ? (
            <nav aria-label="Quick links" className="order-3 flex w-full flex-wrap gap-1 border-t border-stone-100 pt-2 sm:order-none sm:ml-auto sm:w-auto sm:flex-nowrap sm:justify-end sm:border-0 sm:pt-0">
              {switchLinks.map((l) => <Link key={l.href} href={l.href} className="flex min-h-10 min-w-0 flex-1 items-center justify-center rounded-xl px-2 py-2 text-center text-xs font-semibold leading-tight text-stone-700 transition hover:bg-stone-100 sm:flex-none sm:whitespace-nowrap sm:px-3 sm:text-sm">{l.label}</Link>)}
            </nav>
          ) : null}
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 md:py-10">
        <aside className="min-w-0 md:sticky md:top-6 md:self-start"><SidebarNav items={items} /></aside>
        <main id="main" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
