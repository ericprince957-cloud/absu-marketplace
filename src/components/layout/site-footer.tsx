import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-9 px-4 py-10 sm:px-6 md:grid-cols-4 md:py-14">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600">{siteConfig.description}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">
            <span className="size-1.5 rounded-full bg-brand-600" /> Made for ABSU, Uturu
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-900">Marketplace</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            <li><Link href="/marketplace" className="transition hover:text-brand-700">Browse products</Link></li>
            <li><Link href="/search" className="transition hover:text-brand-700">Search</Link></li>
            <li><Link href="/seller/apply" className="transition hover:text-brand-700">Become a seller</Link></li>
            <li><Link href="/pricing" className="transition hover:text-brand-700">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-900">Company</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            <li><Link href="/about" className="transition hover:text-brand-700">About</Link></li>
            <li><Link href="/contact" className="transition hover:text-brand-700">Contact &amp; support</Link></li>
            <li><Link href="/login" className="transition hover:text-brand-700">Log in</Link></li>
            <li><Link href="/register" className="transition hover:text-brand-700">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 px-4 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {siteConfig.name}. Built for students of Abia State University, Uturu.
      </div>
    </footer>
  );
}
