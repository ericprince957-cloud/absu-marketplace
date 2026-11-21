import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap, HandCoins, Search, ShieldCheck, Store, UserPlus } from "lucide-react";
import { CategoryCircles } from "@/components/product/category-nav";
import { ProductRow } from "@/components/product/product-grid";
import { SearchBox } from "@/components/layout/search-box";
import { LinkButton } from "@/components/ui/button";
import { membership } from "@/config/site";
import { listCategories } from "@/lib/data/categories";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { listProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";

const steps = [
  { icon: UserPlus, title: "Create your account", text: "Sign up and verify your email. The first 50 students get free membership for life." },
  { icon: Search, title: "Find what you need", text: "Textbooks, gadgets, fashion, food and services from students on campus." },
  { icon: Store, title: "Sell your own things", text: "Apply to become a seller, add photos and a price, and start getting orders." },
];

function SectionHeading({ id, title, href, cta = "View all" }: { id: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 sm:mb-5">
      <h2 id={id} className="text-[22px] font-semibold text-brand-950 sm:text-3xl">{title}</h2>
      {href ? (
        <Link href={href} className="inline-flex h-10 shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 active:opacity-70">
          {cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const [categories, { products }, slots] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 10 }),
    getFreeSlotsRemaining(),
  ]);

  return (
    <div className="space-y-9 sm:space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-sage px-5 pb-6 pt-7 sm:px-12 sm:py-16">
        <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-200/60 blur-2xl sm:size-80" />
        <div aria-hidden className="absolute -bottom-20 -left-10 size-48 rounded-full bg-gold-400/20 blur-2xl" />
        <div className="relative max-w-2xl">
          {slots !== null && slots > 0 ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-900 shadow-sm sm:text-sm">
              <BadgeCheck className="size-4 text-brand-600" aria-hidden />
              {slots} of {membership.freeSlotLimit} free lifetime spots left
            </p>
          ) : null}
          <h1 className="text-[34px] font-semibold leading-[1.08] text-brand-950 sm:text-6xl">
            Buy &amp; sell with <span className="italic text-brand-700">fellow ABSU</span> students.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-stone-700 sm:text-lg">
            The campus marketplace made for Uturu. Find affordable deals close to you, or turn what you have into cash.
          </p>
          <SearchBox id="hero-search" className="mt-5 max-w-xl" />
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:gap-3">
            <LinkButton href="/marketplace" size="lg">Shop now</LinkButton>
            <LinkButton href="/seller/apply" size="lg" variant="outline" className="bg-white">Start selling</LinkButton>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 ? (
        <section aria-labelledby="cat-heading">
          <SectionHeading id="cat-heading" title="Shop by category" />
          <CategoryCircles categories={categories} />
        </section>
      ) : null}

      {/* Latest */}
      <section aria-labelledby="latest-heading">
        <SectionHeading id="latest-heading" title="Fresh on campus" href="/marketplace" />
        {products.length > 0 ? (
          <ProductRow products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold">Nothing listed yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
              Be one of the first sellers on ABSU Marketplace. Apply in minutes and list your first product.
            </p>
            <LinkButton href="/seller/apply" className="mt-5">Become a seller</LinkButton>
          </div>
        )}
      </section>

      {/* Promo cards: only real destinations and real numbers */}
      <section aria-label="Highlights" className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Link href="/seller/apply" className="group relative overflow-hidden rounded-3xl bg-brand-900 p-6 text-white transition active:scale-[0.99] sm:p-8">
          <div aria-hidden className="absolute -right-8 -top-8 size-36 rounded-full bg-brand-700/50" />
          <GraduationCap className="relative size-8 text-gold-400" aria-hidden />
          <h3 className="relative mt-3 text-2xl font-semibold text-white">Got something to sell?</h3>
          <p className="relative mt-1 max-w-xs text-sm text-brand-100">List it in minutes and reach students on campus.</p>
          <span className="relative mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-brand-950">
            Start selling <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
        <Link href="/pricing" className="group relative overflow-hidden rounded-3xl bg-gold-400/25 p-6 transition active:scale-[0.99] sm:p-8">
          <div aria-hidden className="absolute -right-8 -top-8 size-36 rounded-full bg-gold-400/40" />
          <HandCoins className="relative size-8 text-brand-900" aria-hidden />
          <h3 className="relative mt-3 text-2xl font-semibold text-brand-950">Free for the first {membership.freeSlotLimit}</h3>
          <p className="relative mt-1 max-w-xs text-sm text-stone-700">
            Then {formatNaira(membership.priceNaira)} a month. Browsing is always free.
          </p>
          <span className="relative mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-brand-900 px-5 text-sm font-semibold text-white">
            See pricing <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading">
        <SectionHeading id="how-heading" title="How it works" />
        <ol className="grid gap-3 md:grid-cols-3 md:gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 md:block md:p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sage text-brand-800">
                <s.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-sans text-base font-bold text-stone-900 md:mt-4">{i + 1}. {s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-stone-500">
          <ShieldCheck className="size-4 text-brand-600" aria-hidden /> Meet on campus, inspect the item, then pay the seller in person.
        </p>
      </section>
    </div>
  );
}
