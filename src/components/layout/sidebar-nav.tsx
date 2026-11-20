"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Boxes, CreditCard, Heart, LayoutDashboard, Mail, Package, PlusCircle, ReceiptText, ShieldCheck, Tags, UserCog, UserRound, Users, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
const icons: Record<string, LucideIcon> = { overview: LayoutDashboard, profile: UserRound, membership: CreditCard, orders: ReceiptText, saved: Heart, bell: Bell, products: Package, add: PlusCircle, sales: BarChart3, users: Users, shield: ShieldCheck, tags: Tags, wallet: Wallet, boxes: Boxes, mail: Mail, settings: UserCog };
export interface NavItem { href: string; label: string; icon: keyof typeof icons; exact?: boolean; }
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const matches = (item: NavItem) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const activeHref = items.filter(matches).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav aria-label="Section" className="grid min-w-0 grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:flex md:flex-col">
      {items.map((item) => {
        const Icon = icons[item.icon] ?? LayoutDashboard;
        const active = item.href === activeHref;
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
          className={cn("flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-center text-xs font-semibold leading-tight transition-colors sm:px-3 sm:text-sm md:justify-start md:text-left", active ? "bg-brand-700 text-white" : "text-stone-700 hover:bg-stone-100")}>
          <Icon className="size-4 shrink-0" aria-hidden /><span className="min-w-0">{item.label}</span>
        </Link>;
      })}
    </nav>
  );
}
