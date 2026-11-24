import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { categoryVisual } from "@/lib/category-visual";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Visual category shortcuts on the home page, inspired by familiar shopping apps. */
export function CategoryCircles({ categories }: { categories: Category[] }) {
  const visibleCategories = categories.slice(0, 7);

  return (
    <ul className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-6 lg:grid-cols-4">
      {visibleCategories.map((category) => {
        const { Icon, bg, fg } = categoryVisual(category.name, category.slug);
        return (
          <li key={category.id} className="min-w-0">
            <Link
              href={`/category/${category.slug}`}
              className="group flex h-full flex-col items-center rounded-2xl border border-stone-200/80 bg-white px-1.5 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md active:scale-[0.98] sm:px-3 sm:py-4"
            >
              <span className={cn("grid size-[clamp(3.25rem,15vw,5rem)] place-items-center rounded-full ring-1 ring-black/5 transition group-hover:scale-105", bg, fg)}>
                <Icon className="size-7 sm:size-8" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="mt-2 line-clamp-2 min-h-8 w-full text-[11px] font-semibold leading-tight text-stone-800 sm:mt-3 sm:text-sm">
                {category.name}
              </span>
            </Link>
          </li>
        );
      })}
      <li className="min-w-0">
        <Link
          href="/marketplace"
          className="group flex h-full flex-col items-center rounded-2xl border border-dashed border-brand-300 bg-sage/50 px-1.5 py-3 text-center transition hover:-translate-y-0.5 hover:bg-sage active:scale-[0.98] sm:px-3 sm:py-4"
        >
          <span className="grid size-[clamp(3.25rem,15vw,5rem)] place-items-center rounded-full bg-brand-900 text-white shadow-sm transition group-hover:scale-105">
            <LayoutGrid className="size-7 sm:size-8" aria-hidden />
          </span>
          <span className="mt-2 inline-flex min-h-8 items-center justify-center gap-1 text-[11px] font-semibold leading-tight text-brand-900 sm:mt-3 sm:text-sm">
            View all <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>
      </li>
    </ul>
  );
}

/** Compact swipeable pills for listing pages. */
export function CategoryChips({ categories, activeId }: { categories: Category[]; activeId?: string }) {
  if (categories.length === 0) return null;
  const chip = "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition active:scale-95";
  return (
    <nav aria-label="Categories" className="snap-row hidden sm:flex sm:mx-0 sm:flex-wrap gap-2">
      <Link href="/marketplace" className={cn(chip, !activeId ? "bg-brand-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200")}>
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          aria-current={category.id === activeId ? "page" : undefined}
          className={cn(chip, category.id === activeId ? "bg-brand-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200")}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
