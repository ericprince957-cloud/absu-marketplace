"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Plus, Store, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (path: string) => boolean;
}

/**
 * Thumb-reach navigation for phones (hidden from tablet width up).
 * Hidden on product pages, which have their own sticky "Order" bar.
 */
export function BottomNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/product/")) return null;

  const tabs: Tab[] = [
    { href: "/", label: "Home", Icon: Home, match: (p) => p === "/" },
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

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 pb-safe backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          const isSell = label === "Sell";
          return (
            <li key={label} className="h-full">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition active:scale-95",
                  active ? "text-brand-900" : "text-stone-500",
                )}
              >
                {isSell ? (
                  <span className="-mt-4 grid size-11 place-items-center rounded-full bg-brand-900 text-white shadow-lg ring-4 ring-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                ) : (
                  <Icon className={cn("size-5", active && "fill-brand-900/10")} aria-hidden />
                )}
                <span className={cn(isSell && "-mt-0.5")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
