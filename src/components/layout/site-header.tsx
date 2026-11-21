import Link from "next/link";
import { ChevronDown, Heart, LayoutGrid, UserRound } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchBox } from "@/components/layout/search-box";
import { getUser } from "@/lib/auth";
import { listCategories } from "@/lib/data/categories";

export const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Support" },
];

/**
 * Phones: logo row scrolls away, the search bar stays pinned (the negative `top` offset equals the logo row height).
 * Desktop: one sticky header with search, icons and a nav row.
 */
export async function SiteHeader() {
  const [user, categories] = await Promise.all([getUser(), listCategories()]);
  const signedIn = Boolean(user);

  return (
    <header className="sticky -top-[60px] z-[60] border-b border-stone-200 bg-cream md:top-0 md:bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-[60px] items-center gap-4 md:h-[72px]">
          <Logo />

          <div className="mx-auto hidden max-w-xl flex-1 md:block">
            <SearchBox id="header-search-desktop" />
          </div>

          <nav aria-label="Account" className="ml-auto hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <Link href="/dashboard/saved" className="grid min-w-16 place-items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-100">
              <Heart className="size-5" aria-hidden /> Saved
            </Link>
            <Link href={signedIn ? "/dashboard" : "/login"} className="grid min-w-16 place-items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-100">
              <UserRound className="size-5" aria-hidden /> {signedIn ? "Account" : "Log in"}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <MobileMenu links={mainLinks} categories={categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name }))} signedIn={signedIn} />
          </div>
        </div>

        {/* Phone search bar (stays pinned while scrolling) */}
        <div className="pb-3 md:hidden">
          <SearchBox id="header-search-mobile" />
        </div>

        {/* Desktop nav row */}
        <div className="hidden items-center gap-2 pb-3 md:flex">
          <details className="group relative">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl bg-brand-900 px-4 text-sm font-semibold text-white marker:hidden">
              <LayoutGrid className="size-4" aria-hidden /> All Categories
              <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden />
            </summary>
            <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
              {categories.length === 0 ? (
                <p className="p-3 text-sm text-stone-500">No categories yet</p>
              ) : (
                categories.map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-brand-50">
                    {c.name}
                  </Link>
                ))
              )}
            </div>
          </details>
          <nav aria-label="Main" className="flex items-center">
            {mainLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-brand-900 hover:underline hover:underline-offset-8">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
