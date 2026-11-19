import Link from "next/link";
import { ArrowRight, BadgeCheck, Search, Store, UserPlus, BookOpen, Laptop, Shirt, Utensils, BriefcaseBusiness, Sparkles } from "lucide-react";
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

const categoryIcons = [BookOpen, Laptop, Shirt, Utensils, BriefcaseBusiness, Sparkles];

export default async function HomePage() {
  const [categories, { products }, slots] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 8 }),
    getFreeSlotsRemaining(),
  ]);

  return (
    <div className="space-y-14 sm:space-y-16">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand-900 px-5 py-9 text-white shadow-xl shadow-brand-950/10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div aria-hidden className="absolute -right-24 -top-28 -z-10 size-80 rounded-full bg-brand-500/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-36 right-1/4 -z-10 size-72 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-indigo-100">
            <span className="size-1.5 rounded-full bg-gold-400" /> MADE FOR ABSU STUDENTS
          </p>
          {slots !== null && slots > 0 ? (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-3.5 py-1.5 text-sm font-semibold text-gold-400 ring-1 ring-gold-400/30">
              <BadgeCheck className="size-4" aria-hidden />
              {slots} of {membership.freeSlotLimit} free lifetime spots left
            </p>
          ) : null}
          <h1 className="max-w-2xl text-[2.55rem] font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Campus finds. <span className="text-gold-400">Student prices.</span> Right here in Uturu.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base sm:leading-8">
            Buy and sell with fellow ABSU students. Discover affordable deals close to you, or turn what you have into cash.
          </p>
          <form action="/search" method="get" role="search" className="mt-6 flex max-w-xl gap-2 rounded-2xl bg-white p-1.5 shadow-lg shadow-black/10">
            <label htmlFor="hero-search" className="sr-only">Search products</label>
            <input id="hero-search" name="q" type="search" placeholder="What are you looking for?"
              className="h-11 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400 sm:text-base" />
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 font-bold text-brand-950 transition hover:bg-gold-500 sm:px-5">
              <Search className="size-4" aria-hidden /><span className="hidden sm:inline">Search</span>
            </button>
          </form>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <LinkButton href="/marketplace" variant="primary" size="lg" className="border border-gold-400 bg-gold-400 text-brand-950 hover:bg-gold-500 hover:text-brand-950">
              Browse marketplace <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton href="/seller/apply" variant="outline" size="lg" className="border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              Become a seller
            </LinkButton>
          </div>
          <p className="mt-5 text-xs font-medium text-indigo-200">A marketplace built around the ABSU student community.</p>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="cat-heading">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Explore</p>
              <h2 id="cat-heading" className="mt-1 text-2xl font-bold sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="/marketplace" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all <ArrowRight className="size-4" /></Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`}
                    className="group flex min-h-[5.75rem] items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md sm:p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-stone-800 sm:text-base">{c.name}</span>
                    <ArrowRight className="size-4 shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="latest-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Just listed</p>
            <h2 id="latest-heading" className="mt-1 text-2xl font-bold sm:text-3xl">Fresh on the marketplace</h2>
          </div>
          <Link href="/marketplace" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">View all <ArrowRight className="size-4" /></Link>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-300 bg-brand-50/70 px-5 py-9 text-center sm:px-8 sm:py-11">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><Store className="size-6" aria-hidden /></span>
            <p className="mt-4 text-lg font-bold text-stone-900">The first great find starts here.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              There are no listings just yet. Be among the first ABSU students to put something up for sale.
            </p>
            <LinkButton href="/seller/apply" size="lg" className="mt-5">Become a seller <ArrowRight className="size-4" /></LinkButton>
          </div>
        )}
      </section>

      <section aria-labelledby="how-heading">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Simple from start to finish</p>
          <h2 id="how-heading" className="mt-1 text-2xl font-bold sm:text-3xl">How it works</h2>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><s.icon className="size-5" aria-hidden /></span>
                <span className="font-display text-3xl font-bold text-brand-100">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 px-5 py-9 text-center sm:px-10 sm:py-11">
        <div aria-hidden className="absolute -right-16 -top-20 size-48 rounded-full bg-gold-400/25 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">No surprises</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Simple, fair pricing</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-stone-700 sm:text-base">
            The first {membership.freeSlotLimit} students are free forever. After that it is {formatNaira(membership.priceNaira)} a month. Browsing is always free.
          </p>
          <LinkButton href="/pricing" size="lg" className="mt-5">See pricing <ArrowRight className="size-4" /></LinkButton>
        </div>
      </section>
    </div>
  );
}
