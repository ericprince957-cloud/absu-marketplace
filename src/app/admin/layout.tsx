import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

const items: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/sellers", label: "Seller applications", icon: "shield" },
  { href: "/admin/products", label: "Products", icon: "boxes" },
  { href: "/admin/categories", label: "Categories", icon: "tags" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/payments", label: "Payments", icon: "wallet" },
  { href: "/admin/messages", label: "Support inbox", icon: "mail" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side role check on every admin request. Non-admins get a 404.
  await requireAdmin();
  return (
    <AppShell area="Administrator" items={items} switchLinks={[{ href: "/", label: "View site" }]}>
      {children}
    </AppShell>
  );
}
