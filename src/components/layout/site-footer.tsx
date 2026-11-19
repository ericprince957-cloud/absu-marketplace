import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">{siteConfig.description}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Marketplace</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/marketplace" className="hover:text-brand-700">Browse products</Link></li>
            <li><Link href="/search" className="hover:text-brand-700">Search</Link></li>
            <li><Link href="/seller/apply" className="hover:text-brand-700">Become a seller</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-700">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Company</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/about" className="hover:text-brand-700">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand-700">Contact &amp; support</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Log in</Link></li>
            <li><Link href="/register" className="hover:text-brand-700">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {siteConfig.name}. Built for students of Abia State University, Uturu.
      </div>
    </footer>
  );
}
