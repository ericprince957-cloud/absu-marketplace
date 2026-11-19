import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { ConfigNotice } from "@/components/layout/config-notice";
import { logout } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

/** Shared frame for the student, seller and admin areas. */
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
    <div className="min-h-screen bg-stone-50">
      <ConfigNotice />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 sm:inline">{area}</span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {switchLinks?.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                {l.label}
              </Link>
            ))}
            <form action={logout}>
              <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100">
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-10">
        <aside className="md:sticky md:top-6 md:self-start">
          <SidebarNav items={items} />
        </aside>
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
