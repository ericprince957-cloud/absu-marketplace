import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { getRoles, requireUser } from "@/lib/auth";

export const metadata = { title: { default: "My account", template: "%s | My account" }, robots: { index: false } };

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview", exact: true },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  { href: "/dashboard/membership", label: "Membership", icon: "membership" },
  { href: "/dashboard/orders", label: "My orders", icon: "orders" },
  { href: "/dashboard/saved", label: "Saved", icon: "saved" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "bell" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");
  const roles = await getRoles(user.id);

  const switchLinks = [
    { href: "/marketplace", label: "Marketplace" },
    roles.includes("seller") ? { href: "/seller", label: "Seller area" } : { href: "/seller/apply", label: "Become a seller" },
    ...(roles.includes("admin") ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <AppShell area="My account" items={items} switchLinks={switchLinks}>
      {children}
    </AppShell>
  );
}
