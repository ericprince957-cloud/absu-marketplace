import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { getRoles, requireUser } from "@/lib/auth";

export const metadata = { title: { default: "Seller area", template: "%s | Seller area" }, robots: { index: false } };

const sellerItems: NavItem[] = [
  { href: "/seller", label: "Overview", icon: "overview", exact: true },
  { href: "/seller/products", label: "My products", icon: "products", exact: false },
  { href: "/seller/products/new", label: "Add product", icon: "add", exact: true },
  { href: "/seller/orders", label: "Orders", icon: "orders" },
  { href: "/seller/sales", label: "Sales", icon: "sales" },
];

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/seller");
  const roles = await getRoles(user.id);
  const isSeller = roles.includes("seller");

  const items: NavItem[] = isSeller ? sellerItems : [{ href: "/seller/apply", label: "Apply to sell", icon: "add" }];

  return (
    <AppShell
      area="Seller area"
      items={items}
      switchLinks={[
        { href: "/marketplace", label: "Marketplace" },
        { href: "/dashboard", label: "My account" },
      ]}
    >
      {children}
    </AppShell>
  );
}
