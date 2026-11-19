import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonStyles } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

export const mainLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Support" },
];

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="ml-3 hidden items-center gap-1 md:flex" aria-label="Main">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-brand-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <form action="/search" method="get" role="search" className="ml-auto hidden max-w-xs flex-1 lg:block">
          <label htmlFor="header-search" className="sr-only">Search products</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input id="header-search" name="q" type="search" placeholder="Search products"
              className="h-10 w-full rounded-xl border border-stone-300 bg-stone-50 pl-9 pr-3 text-sm focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20" />
          </div>
        </form>
        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          {user ? (
            <Link href="/dashboard" className={buttonStyles({ variant: "primary", size: "sm" })}>My dashboard</Link>
          ) : (
            <>
              <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>Log in</Link>
              <Link href="/register" className={buttonStyles({ variant: "primary", size: "sm" })}>Join free</Link>
            </>
          )}
          <ThemeToggle />
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Link href="/search" aria-label="Search" className="grid size-11 place-items-center rounded-xl border border-stone-200 bg-white text-stone-800 transition hover:bg-stone-100">
            <Search className="size-5" aria-hidden />
          </Link>
          <ThemeToggle />
          <MobileMenu links={mainLinks} signedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
