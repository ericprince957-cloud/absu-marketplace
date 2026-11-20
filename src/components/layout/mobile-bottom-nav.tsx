"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home, matches: (path: string) => path === "/" },
  { href: "/marketplace", label: "Browse", icon: LayoutGrid, matches: (path: string) => path.startsWith("/marketplace") || path.startsWith("/category") || path.startsWith("/product") },
  { href: "/login", label: "Account", icon: UserRound, matches: (path: string) => path.startsWith("/dashboard") || path.startsWith("/login") || path.startsWith("/register") },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Bottom navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {items.map((item) => {
          const active = item.matches(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${active ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`}>
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
