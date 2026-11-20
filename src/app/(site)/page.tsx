import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Laptop, Search, Shirt, ShoppingBag, Sparkles, Store, Utensils, Zap } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { StudentListingsSlider } from "@/components/layout/student-listings-slider";
import { RecentlyViewed } from "@/components/layout/recently-viewed";
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
    listProducts({ pageSize: 10 }),
    getFreeSlotsRemaining(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-8 sm:space-y-14">
      <form action="/search" method="get" role="search" className="sticky top-[4.25rem] z-30 -mx-4 border-b border-stone-100 bg-stone-50/95 px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <label htmlFor="home-search" className="sr-only">Search products, categories and sellers</label>
        <div className="relative mx-auto max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" aria-hidden />
          <input id="home-search" name="q" type="search" placeholder="What are you looking for on campus?"
            className="h-13 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:h-14 sm:text-base" />
        </div>
      </form>

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#171717] text-white shadow-2xl shadow-stone-900/10">
        <div aria-hidden className="absolute -right-20 -top-28 -z-10 size-80 rounded-full bg-[#d4af37]/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-36 right-1/3 -z-10 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="grid min-h-[19rem] items-center gap-7 px-5 py-9 sm:px-9 sm:py-11 md:grid-cols-[1.15fr_.85fr] md:px-12">
          <div className="relative z-10">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-stone-200">
              <span className="size-1.5 rounded-full bg-emerald-400" /> MADE FOR THE ABSU COMMUNITY
            </p>
            <h1 className="max-w-xl font-display text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Campus finds. <span className="text-[#e7c95f]">Real student sellers.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-300 sm:text-base sm:leading-7">
              Discover useful things around Uturu — from textbooks and hostel essentials to tech, fashion and everyday needs.
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <LinkButton href="/marketplace" size="lg" className="border border-[#e7c95f] bg-[#e7c95f] text-stone-950 hover:bg-[#f0d77f] hover:text-stone-950">
                Explore the market <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/seller/apply" variant="outline" size="lg" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                <Store className="size-4" /> Start selling
              </LinkButton>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-stone-400">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#e7c95f]" /> Student-focused marketplace</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="size-4 text-emerald-400" /> Browse without an account</span>
            </div>
          </div>
          <div className="relative hidden min-h-64 items-center justify-center md:flex">
            <div aria-hidden className="absolute size-64 rounded-full border border-white/10 bg-white/[0.025]" />
            <div aria-hidden className="absolute size-48 rounded-full border border-white/10" />
            <div className="relative grid size-36 place-items-center rounded-[2.5rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
              <ShoppingBag className="size-16 text-[#e7c95f]" strokeWidth={1.2} />
            </div>
            <span className="absolute left-2 top-8 rounded-2xl border border-white/10 bg-[#252525] px-4 py-3 text-xs font-semibold text-stone-200 shadow-xl">Find campus essentials</span>
            <span className="absolute bottom-7 right-0 rounded-2xl border border-white/10 bg-[#252525] px-4 py-3 text-xs font-semibold text-stone-200 shadow-xl">Buy from student sellers</span>
            <span className="absolute right-5 top-2 grid size-11 place-items-center rounded-2xl bg-[#e7c95f] text-stone-950 shadow-lg"><Sparkles className="size-5" /></span>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="categories-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">Start exploring</p>
              <h2 id="categories-heading" className="mt-1 font-display text-2xl font-bold sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-stone-700 hover:text-brand-700">All categories <ArrowRight className="size-4" /></Link>
          </div>
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
            {categories.map((category, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
                <li key={category.id} className="w-[7.4rem] shrink-0 snap-start sm:w-auto">
                  <Link href={`/category/${category.slug}`} className="group flex h-full min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center transition hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-lg">
                    <span className="grid size-14 place-items-center rounded-[1.2rem] bg-stone-100 text-stone-800 transition group-hover:bg-[#171717] group-hover:text-[#e7c95f]">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="line-clamp-2 text-xs font-bold text-stone-800 sm:text-sm">{category.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-label="Membership offer" className="relative overflow-hidden rounded-[1.5rem] border border-[#e7d89e] bg-[#fffaf0] px-4 py-5 text-stone-950 sm:px-7">
        <div aria-hidden className="absolute -right-10 -top-16 size-40 rounded-full bg-[#e7c95f]/30 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-stone-900 shadow-sm"><BadgeCheck className="size-6" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600">For student sellers</p>
              <h2 className="mt-0.5 text-lg font-extrabold sm:text-xl">
                {slots !== null && slots > 0 ? `${slots} free lifetime spots remaining` : "Ready to put your products on campus?"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-stone-600 sm:text-sm">
                First {membership.freeSlotLimit} verified students get lifetime free membership. Then {formatNaira(membership.priceNaira)} per month. Browsing stays free.
              </p>
            </div>
          </div>
          <LinkButton href="/pricing" size="md" className="shrink-0 bg-stone-950 text-white hover:bg-stone-800">Seller membership <ArrowRight className="size-4" /></LinkButton>
        </div>
      </section>

      <StudentListingsSlider />

      <section aria-labelledby="featured-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">Fresh from the community</p>
            <h2 id="featured-heading" className="mt-1 font-display text-2xl font-bold sm:text-3xl">Just landed on campus</h2>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">The latest approved listings from ABSU sellers.</p>
          </div>
          <Link href="/marketplace" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-stone-700 hover:text-brand-700">View all <ArrowRight className="size-4" /></Link>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center sm:py-10">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-stone-800 shadow-sm"><Store className="size-6" /></span>
            <p className="mt-3 text-lg font-bold text-stone-900">Be among the first to list.</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-600">Approved student listings will appear here automatically. Start your seller application and help bring campus shopping online.</p>
            <LinkButton href="/seller/apply" size="lg" className="mt-4">Become a seller <ArrowRight className="size-4" /></LinkButton>
          </div>
        )}
      </section>

      <RecentlyViewed />

      <section className="rounded-[1.5rem] bg-stone-100 px-5 py-7 sm:px-8">
        <div className="mb-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">A better way to shop around campus</p>
          <h2 className="mt-1 font-display text-xl font-bold text-stone-950 sm:text-2xl">Made for the ABSU community</h2>
        </div>
        <div className="grid gap-5 text-center sm:grid-cols-3 sm:gap-4">
          <div><p className="text-sm font-bold text-stone-900">Browse freely</p><p className="mt-1 text-xs leading-5 text-stone-500">Explore products without creating an account.</p></div>
          <div><p className="text-sm font-bold text-stone-900">Discover local listings</p><p className="mt-1 text-xs leading-5 text-stone-500">Find useful items shared by sellers around Uturu.</p></div>
          <div><p className="text-sm font-bold text-stone-900">Shop with care</p><p className="mt-1 text-xs leading-5 text-stone-500">Review each listing and agree on safe campus handover.</p></div>
        </div>
      </section>
    </div>
  );
}
