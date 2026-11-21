"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Logo } from "@/components/layout/logo";
import { navIcons, type NavItem } from "@/components/layout/sidebar-nav";
import { CountBadge } from "@/components/ui/count-badge";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Hamburger + slide-in drawer for the dashboard, seller and admin areas on phones. Keeps the screen free until needed. */
export function AppMenu({
  area,
  items,
  switchLinks,
}: {
  area: string;
  items: NavItem[];
  switchLinks?: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close the drawer whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const attention = items.reduce((n, i) => n + (i.badgeTone === "neutral" ? 0 : (i.badge ?? 0)), 0);
  const matches = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const activeHref = items.filter(matches).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="app-drawer"
        aria-label="Open menu"
        className="relative grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm transition active:scale-95"
      >
        <Menu className="size-[18px]" aria-hidden />
        <CountBadge count={attention} />
      </button>

      <div className={cn("fixed inset-0 z-[70] transition", open ? "visible" : "invisible delay-200")} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-brand-950/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          id="app-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={`${area} menu`}
          className={cn(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-stone-200 px-4">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-xl text-stone-700 active:bg-stone-200">
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-stone-500">{area}</h2>
            <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {items.map((item) => {
                const Icon = navIcons[item.icon] ?? LayoutDashboard;
                const active = item.href === activeHref;
                return (
                  <li key={item.href} className="border-b border-stone-100 last:border-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 px-4 text-[15px] font-medium",
                        active ? "bg-brand-50 text-brand-900" : "text-stone-800 active:bg-brand-50",
                      )}
                    >
                      <Icon className="size-[18px] text-brand-700" aria-hidden />
                      {item.label}
                      <CountBadge count={item.badge ?? 0} tone={item.badgeTone} inline />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {switchLinks?.length ? (
              <>
                <h2 className="mb-2 mt-7 px-1 text-xs font-semibold uppercase tracking-widest text-stone-500">Switch to</h2>
                <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {switchLinks.map((l) => (
                    <li key={l.href} className="border-b border-stone-100 last:border-0">
                      <Link href={l.href} className="flex min-h-12 items-center px-4 text-[15px] font-medium text-stone-800 active:bg-brand-50">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <form action={logout} className="shrink-0 border-t border-stone-200 p-4 pb-safe">
            <button type="submit" className={buttonStyles({ variant: "outline", size: "lg", className: "w-full" })}>
              <LogOut className="size-4" aria-hidden /> Log out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
