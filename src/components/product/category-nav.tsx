import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { categoryVisual } from "@/lib/category-visual";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Round pastel category buttons in a swipeable row (home page). */
export function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <ul className="snap-row -mx-4 gap-3 px-4 py-1 sm:mx-0 sm:justify-between sm:px-0">
      {categories.map((c) => {
        const { Icon, bg, fg } = categoryVisual(c.name, c.slug);
        return (
          <li key={c.id} className="w-[68px] sm:w-24">
            <Link href={`/category/${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
              <span className={cn("grid size-14 place-items-center rounded-full shadow-sm ring-2 ring-white transition group-active:scale-95 sm:size-[72px]", bg, fg)}>
                <Icon className="size-6 sm:size-7" aria-hidden />
              </span>
              <span className="line-clamp-2 text-xs font-medium leading-tight text-stone-800">{c.name}</span>
            </Link>
          </li>
        );
      })}
      <li className="w-[68px] sm:w-24">
        <Link href="/marketplace" className="group flex flex-col items-center gap-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-white text-brand-900 shadow-sm ring-2 ring-white transition group-active:scale-95 sm:size-[72px]">
            <LayoutGrid className="size-5 sm:size-6" aria-hidden />
          </span>
          <span className="text-xs font-medium text-stone-800">View all</span>
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
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          aria-current={c.id === activeId ? "page" : undefined}
          className={cn(chip, c.id === activeId ? "bg-brand-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200")}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
