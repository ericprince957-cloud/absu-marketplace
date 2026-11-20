import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Laptop, Search, Shirt, ShoppingBag, Sparkles, Store, Utensils } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { StudentListingsSlider } from "@/components/layout/student-listings-slider";
import { LinkButton } from "@/components/ui/button";
import { membership } from "@/config/site";
import { listCategories } from "@/lib/data/categories";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { listProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";

const categoryIcons = [BookOpen, Laptop, Shirt, Utensils, BriefcaseBusiness, Sparkles];

export default async function HomePage() {
  const [categories, { products }, slots] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 8 }),
    getFreeSlotsRemaining(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-5 sm:space-y-12">
      <form action="/search" method="get" role="search" className="sticky top-[4.25rem] z-30 -mx-4 border-b border-stone-100 bg-stone-50/95 px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <label htmlFor="home-search" className="sr-only">Search products, categories and sellers</label>
        <div className="relative mx-auto max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" aria-hidden />
          <input id="home-search" name="q" type="search" placeholder="Search products, categories and sellers..."
            className="h-13 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:h-14 sm:text-base" />
        </div>
      </form>

      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand-900 text-white shadow-xl shadow-brand-950/10">
        <div aria-hidden className="absolute -right-20 -top-28 -z-10 size-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-36 right-1/3 -z-10 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="grid min-h-[17rem] items-center gap-6 px-5 py-8 sm:px-9 sm:py-10 md:grid-cols-[1.15fr_.85fr] md:px-12">
          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-indigo-100">
              <span className="size-1.5 rounded-full bg-gold-400" /> THE ABSU STUDENT MARKETPLACE
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">
              Find it on campus. <span className="text-gold-400">Sell it on campus.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100 sm:text-base sm:leading-7">
              Your campus marketplace for textbooks, gadgets, fashion, food and student services in Uturu.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 min-[420px]:flex-row">
              <LinkButton href="/marketplace" size="lg" className="border border-gold-400 bg-gold-400 text-brand-950 hover:bg-gold-500 hover:text-brand-950">
                Explore marketplace <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/seller/apply" variant="outline" size="lg" className="border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                Start selling
              </LinkButton>
            </div>
          </div>
          <div className="relative hidden min-h-52 items-center justify-center md:flex">
            <div aria-hidden className="absolute size-56 rounded-full border border-white/10 bg-white/[0.04]" />
            <div aria-hidden className="absolute size-40 rounded-full border border-white/10" />
            <div className="relative grid size-36 place-items-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
              <ShoppingBag className="size-16 text-gold-400" strokeWidth={1.25} />
              <span className="absolute -bottom-3 -right-8 rounded-xl border border-white/15 bg-white px-3 py-2 text-xs font-bold text-brand-900 shadow-lg">Made for ABSU</span>
            </div>
            <span className="absolute left-5 top-8 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-100">Buy nearby</span>
            <span className="absolute bottom-5 right-4 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-100">Sell with ease</span>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="categories-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">Find your next deal</p>
              <h2 id="categories-heading" className="mt-1 text-xl font-bold sm:text-2xl">Shop by category</h2>
            </div>
            <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all <ArrowRight className="size-4" /></Link>
          </div>
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
            {categories.map((category, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
                <li key={category.id} className="w-[7.4rem] shrink-0 snap-start sm:w-auto">
                  <Link href={`/category/${category.slug}`} className="group flex h-full min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="line-clamp-2 text-xs font-semibold text-stone-800 sm:text-sm">{category.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-label="Membership offer" className="relative overflow-hidden rounded-2xl border border-gold-400/60 bg-[#fff8e9] px-4 py-5 text-brand-950 sm:px-7">
        <div aria-hidden className="absolute -right-10 -top-16 size-40 rounded-full bg-gold-400/30 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 shadow-sm"><BadgeCheck className="size-6" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">Student seller membership</p>
              <h2 className="mt-0.5 text-lg font-extrabold sm:text-xl">
                {slots !== null && slots > 0 ? `${slots} free lifetime spots remaining` : "Start selling on ABSU Marketplace"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-brand-900/75 sm:text-sm">
                First {membership.freeSlotLimit} verified students get lifetime free membership. Then {formatNaira(membership.priceNaira)} per month. Browsing stays free.
              </p>
            </div>
          </div>
          <LinkButton href="/pricing" size="md" className="shrink-0 bg-brand-700 text-white hover:bg-brand-800">See membership <ArrowRight className="size-4" /></LinkButton>
        </div>
      </section>

      <StudentListingsSlider />

      <section aria-labelledby="featured-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">Discover something useful</p>
            <h2 id="featured-heading" className="mt-1 text-xl font-bold sm:text-2xl">Fresh on the marketplace</h2>
          </div>
          <Link href="/marketplace" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all <ArrowRight className="size-4" /></Link>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/70 px-5 py-8 text-center sm:py-10">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><Store className="size-6" /></span>
            <p className="mt-3 text-lg font-bold text-stone-900">Be among the first to list.</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-600">The marketplace is getting ready for its first listings. Start your seller application and help bring campus shopping online.</p>
            <LinkButton href="/seller/apply" size="lg" className="mt-4">Become a seller <ArrowRight className="size-4" /></LinkButton>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white px-5 py-6 sm:px-8">
        <div className="grid gap-5 text-center sm:grid-cols-3 sm:gap-4">
          <div><p className="text-sm font-bold text-stone-900">Built around ABSU</p><p className="mt-1 text-xs leading-5 text-stone-500">A marketplace for the Uturu student community.</p></div>
          <div><p className="text-sm font-bold text-stone-900">Browse for free</p><p className="mt-1 text-xs leading-5 text-stone-500">Explore available listings without a membership.</p></div>
          <div><p className="text-sm font-bold text-stone-900">Student-to-student</p><p className="mt-1 text-xs leading-5 text-stone-500">Discover products and services listed by campus sellers.</p></div>
        </div>
      </section>
    </div>
  );
}
