"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Plus, ShoppingBag, Store, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (path: string) => boolean;
}

/**
 * Floating pill navigation for phones (hidden from tablet width up).
 * The brand circle is Home. Add new tabs to the array below as features ship (e.g. Inbox).
 * Hidden on product pages, which have their own sticky "Contact seller" bar.
 */
export function BottomNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/product/")) return null;

  const tabs: Tab[] = [
    { href: "/marketplace", label: "Browse", Icon: Store, match: (p) => p.startsWith("/marketplace") || p.startsWith("/category") || p.startsWith("/search") },
    { href: "/seller", label: "Sell", Icon: Plus, match: (p) => p.startsWith("/seller") },
    { href: "/dashboard/saved", label: "Saved", Icon: Heart, match: (p) => p.startsWith("/dashboard/saved") },
    {
      href: signedIn ? "/dashboard" : "/login",
      label: signedIn ? "Account" : "Log in",
      Icon: UserRound,
      match: (p) => (p.startsWith("/dashboard") && !p.startsWith("/dashboard/saved")) || p === "/login" || p === "/register",
    },
  ];
  const onHome = pathname === "/";

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
    >
      <ul className="pointer-events-auto mx-auto flex h-[68px] max-w-md items-center gap-1 rounded-full bg-white/95 p-2 shadow-[0_10px_30px_rgba(8,33,26,0.18)] ring-1 ring-stone-200 backdrop-blur">
        <li className="shrink-0">
          <Link
            href="/"
            aria-label="ABSU Marketplace home"
            aria-current={onHome ? "page" : undefined}
            className={cn(
              "grid size-[52px] place-items-center rounded-full bg-brand-900 text-white shadow-md transition active:scale-95",
              onHome && "ring-[3px] ring-gold-400",
            )}
          >
            <ShoppingBag className="size-[22px]" aria-hidden />
          </Link>
        </li>

        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={label} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[10.5px] font-medium transition active:scale-95",
                  active ? "bg-brand-900 text-white shadow-md" : "text-stone-500",
                )}
              >
                <Icon className={cn("size-5", active && "fill-white/20")} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                <span className="truncate">{label}</span>
                {active ? <span aria-hidden className="absolute -bottom-0.5 size-1.5 rounded-full bg-gold-400" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
