import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterControl } from "@/components/ui/field";
import { PRODUCT_CONDITIONS } from "@/config/site";
import type { Category } from "@/types";

export interface FilterValues {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  condition?: string;
  sort?: string;
}

/**
 * Plain GET form: works without JavaScript, is shareable as a URL and needs no client state.
 * `lockedCategory` hides the category picker on category pages.
 */
export function ProductFilters({
  action,
  categories,
  values,
  lockedCategory = false,
}: {
  action: string;
  categories: Category[];
  values: FilterValues;
  lockedCategory?: boolean;
}) {
  return (
    <form action={action} method="get" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
        <label htmlFor="f-q" className="sr-only">
          Search
        </label>
        <input id="f-q" name="q" type="search" defaultValue={values.q} placeholder="Search textbooks, phones, food..." className={`${filterControl} pl-9`} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {!lockedCategory ? (
          <div className="col-span-2 lg:col-span-2">
            <label htmlFor="f-cat" className="mb-1 block text-xs font-medium text-stone-600">Category</label>
            <select id="f-cat" name="category" defaultValue={values.category ?? ""} className={filterControl}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="f-min" className="mb-1 block text-xs font-medium text-stone-600">Min price (₦)</label>
          <input id="f-min" name="min" type="number" min={0} inputMode="numeric" defaultValue={values.min} className={filterControl} />
        </div>
        <div>
          <label htmlFor="f-max" className="mb-1 block text-xs font-medium text-stone-600">Max price (₦)</label>
          <input id="f-max" name="max" type="number" min={0} inputMode="numeric" defaultValue={values.max} className={filterControl} />
        </div>
        <div>
          <label htmlFor="f-cond" className="mb-1 block text-xs font-medium text-stone-600">Condition</label>
          <select id="f-cond" name="condition" defaultValue={values.condition ?? ""} className={filterControl}>
            <option value="">Any</option>
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sort" className="mb-1 block text-xs font-medium text-stone-600">Sort by</label>
          <select id="f-sort" name="sort" defaultValue={values.sort ?? "newest"} className={filterControl}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm">
          <SlidersHorizontal className="size-4" aria-hidden /> Apply filters
        </Button>
        <a href={action} className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium text-stone-600 hover:bg-stone-100">
          Clear
        </a>
      </div>
    </form>
  );
}
