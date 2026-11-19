import Link from "next/link";
import { ArrowRight, BadgeCheck, Search, Store, UserPlus } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { LinkButton } from "@/components/ui/button";
import { membership } from "@/config/site";
import { listCategories } from "@/lib/data/categories";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { listProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";

const steps = [
  { icon: UserPlus, title: "Create your account", text: "Sign up and verify your email. The first 50 students get free membership for life." },
  { icon: Search, title: "Find what you need", text: "Search textbooks, gadgets, fashion, food and services from students on campus." },
  { icon: Store, title: "Sell your own things", text: "Apply to become a seller, add photos and a price, and start getting orders." },
];

export default async function HomePage() {
  const [categories, { products }, slots] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 8 }),
    getFreeSlotsRemaining(),
  ]);

  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-white sm:px-12 sm:py-20">
        <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="relative max-w-2xl">
          {slots !== null && slots > 0 ? (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-brand-100 ring-1 ring-white/20">
              <BadgeCheck className="size-4 text-gold-400" aria-hidden />
              {slots} of {membership.freeSlotLimit} free lifetime spots left
            </p>
          ) : null}
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-6xl">Buy and sell with fellow ABSU students.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
            The campus marketplace made for Uturu. Find affordable deals close to you, or turn what you have into cash.
          </p>
          <form action="/search" method="get" role="search" className="mt-7 flex max-w-xl gap-2">
            <label htmlFor="hero-search" className="sr-only">Search products</label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Search for a laptop, textbook, rice..."
              className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-white px-4 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-brand-400/50"
            />
            <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-gold-400 px-5 font-semibold text-brand-950 hover:bg-gold-500">
              <Search className="size-4" aria-hidden /> <span className="hidden sm:inline">Search</span>
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <LinkButton href="/marketplace" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Browse marketplace
            </LinkButton>
            <LinkButton href="/seller/apply" variant="ghost" className="text-white hover:bg-white/10">
              Become a seller <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="cat-heading">
          <div className="mb-5 flex items-end justify-between">
            <h2 id="cat-heading" className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="flex h-full min-h-20 items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white p-4 font-medium shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <span>{c.name}</span>
                  <ArrowRight className="size-4 shrink-0 text-stone-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="latest-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="text-2xl font-bold sm:text-3xl">Fresh on the marketplace</h2>
          <Link href="/marketplace" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">View all</Link>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <p className="font-semibold">Nothing listed yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
              Be one of the first sellers on ABSU Marketplace. Apply in minutes and list your first product.
            </p>
            <LinkButton href="/seller/apply" className="mt-5">Become a seller</LinkButton>
          </div>
        )}
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-6 text-2xl font-bold sm:text-3xl">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <s.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold">{i + 1}. {s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl bg-brand-50 px-6 py-10 text-center sm:px-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Simple, fair pricing</h2>
        <p className="mx-auto mt-2 max-w-xl text-stone-700">
          The first {membership.freeSlotLimit} students are free forever. After that it is {formatNaira(membership.priceNaira)} a month. Browsing is always free.
        </p>
        <LinkButton href="/pricing" size="lg" className="mt-6">See pricing</LinkButton>
      </section>
    </div>
  );
}
