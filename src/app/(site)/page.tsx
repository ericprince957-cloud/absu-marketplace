import Link from "next/link";
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Store, UserPlus } from "lucide-react";
import { CategoryCircles } from "@/components/product/category-nav";
import { ProductRow } from "@/components/product/product-grid";
import { RecentlyViewed } from "@/components/layout/recently-viewed";
import { StudentListingsSlider } from "@/components/layout/student-listings-slider";
import { SearchBox } from "@/components/layout/search-box";
import { CampusChallengeBanner } from "@/components/layout/campus-challenge-banner";
import { LinkButton } from "@/components/ui/button";
import { membership } from "@/config/site";
import { listCategories } from "@/lib/data/categories";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { listProducts } from "@/lib/data/products";
import { promoBannerCampaign, promoBannerEnabled } from "@/flags";

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
  const [categories, { products }, slots, bannerEnabled, bannerCampaign] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 10 }),
    getFreeSlotsRemaining(),
    promoBannerEnabled(),
    promoBannerCampaign(),
  ]);

  const showCampusChallenge =
    bannerEnabled && bannerCampaign === "campus-challenge-2026";

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

      {showCampusChallenge ? <CampusChallengeBanner /> : null}

      <section className="max-w-3xl">
        <details className="group rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-brand-900 marker:hidden [&::-webkit-details-marker]:hidden">
            <span>About ABSU Trade</span>
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-sage text-brand-900 transition-transform group-open:rotate-180">
              <ArrowRight className="size-4 rotate-90" />
            </span>
          </summary>
          <div className="mt-3 space-y-4 border-t border-stone-100 pt-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-950 sm:text-xl">A student marketplace for ABSU and Uturu</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600 sm:text-base">
                ABSU Trade connects buyers with students and local sellers around Abia State University, Uturu.
                Browse available products and services, compare listing details, and contact sellers directly.
                Whether you need a phone, textbook, outfit, meal, hostel essential or a campus service, start by
                searching the marketplace or exploring a category.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-950">Buy locally. Sell to the campus community.</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600 sm:text-base">
                Students can create a seller account, publish listings with photos and prices, and reach people
                already looking around ABSU. Buyers can browse without paying a membership fee, review each
                listing, ask the seller questions and arrange a safe handover. Meet in a public place, inspect
                an item before paying, and never send money in advance to someone you do not know.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/marketplace" className="text-brand-800 underline-offset-4 hover:underline">Browse ABSU listings</Link>
              <Link href="/requests" className="text-brand-800 underline-offset-4 hover:underline">See what students need</Link>
              <Link href="/seller/apply" className="text-brand-800 underline-offset-4 hover:underline">Start selling on ABSU Trade</Link>
            </div>
          </div>
        </details>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="cat-heading">
          <SectionHeading id="cat-heading" title="Shop by category" />
          <CategoryCircles categories={categories} />
        </section>
      ) : null}

      <section aria-labelledby="latest-heading">
        <SectionHeading id="latest-heading" title="Fresh on campus" href="/marketplace" />
        {products.length > 0 ? (
          <ProductRow products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold">Nothing listed yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
              Be one of the first sellers on ABSU Trade. Apply in minutes and list your first product.
            </p>
            <LinkButton href="/seller/apply" className="mt-5">Become a seller</LinkButton>
          </div>
        )}
      </section>

      <StudentListingsSlider />
      <RecentlyViewed />

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
