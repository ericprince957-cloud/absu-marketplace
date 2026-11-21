"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  Heart,
  LayoutDashboard,
  Mail,
  Package,
  PlusCircle,
  ReceiptText,
  ShieldCheck,
  Tags,
  UserCog,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  profile: UserRound,
  membership: CreditCard,
  orders: ReceiptText,
  saved: Heart,
  bell: Bell,
  products: Package,
  add: PlusCircle,
  sales: BarChart3,
  users: Users,
  shield: ShieldCheck,
  tags: Tags,
  wallet: Wallet,
  boxes: Boxes,
  mail: Mail,
  settings: UserCog,
};

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof icons;
  /** Match only this exact path (used for overview pages). */
  exact?: boolean;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Highlight only the most specific matching link (e.g. "Add product", not also "My products").
  const matches = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const activeHref = items.filter(matches).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Section" className="snap-row gap-2 pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
      {items.map((item) => {
        const Icon = icons[item.icon] ?? LayoutDashboard;
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-medium transition active:scale-95 md:rounded-xl",
              active
                ? "bg-brand-900 text-white"
                : "bg-white text-stone-700 ring-1 ring-stone-200 md:bg-transparent md:ring-0 md:hover:bg-stone-200/60",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
