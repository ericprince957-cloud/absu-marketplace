import Link from "next/link";
import { BadgeCheck, HandCoins, Headset, Search } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const trust = [
  { Icon: Search, title: "Free to browse", text: "No account needed" },
  { Icon: BadgeCheck, title: "Verified students", text: "Email-verified members" },
  { Icon: HandCoins, title: "Pay in person", text: "Meet and inspect first" },
  { Icon: Headset, title: "Real support", text: "Message us anytime" },
];

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/marketplace", label: "All products" },
      { href: "/search", label: "Search" },
      { href: "/dashboard/saved", label: "Saved items" },
      { href: "/dashboard/orders", label: "My orders" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/seller/apply", label: "Become a seller" },
      { href: "/seller/products/new", label: "List a product" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact & support" },
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-6 md:grid-cols-4">
          {trust.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-900">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-stone-900">{title}</span>
                <span className="block text-xs leading-snug text-stone-500">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 bg-brand-950 text-brand-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">{siteConfig.description}</p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-white">{col.title}</h2>
              <ul className="mt-3 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1.5 text-sm text-brand-200 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-brand-300 sm:px-6">
            © {new Date().getFullYear()} {siteConfig.name}. Built for students of Abia State University, Uturu.
          </p>
        </div>
      </div>
    </footer>
  );
}
