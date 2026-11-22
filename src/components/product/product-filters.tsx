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
  campus_area?: string;
  hostel_name?: string;
  academic_department?: string;
  academic_level?: string;
  course_code?: string;
  sort?: string;
}

/**
 * Plain GET form (works without JavaScript, shareable URLs).
 * On phones the extra filters sit behind a "Filters" button (a CSS-only checkbox toggle); on desktop they are always visible.
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
  const label = "mb-1 block text-xs font-medium text-stone-600";
  const activeCount = [values.min, values.max, values.condition, values.campus_area, values.hostel_name, values.academic_department, values.academic_level, values.course_code, values.sort, !lockedCategory && values.category].filter(Boolean).length;

  return (
    <form action={action} method="get" className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200 sm:p-4">
      <input type="checkbox" id="filters-toggle" className="peer sr-only" aria-label="Show filters" />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
          <label htmlFor="f-q" className="sr-only">
            Search
          </label>
          <input id="f-q" name="q" type="search" enterKeyHint="search" defaultValue={values.q} placeholder="Search products" className={`${filterControl} h-12 rounded-full pl-10`} />
        </div>
        <label
          htmlFor="filters-toggle"
          className="relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-brand-900 text-white transition active:scale-95 md:hidden"
          aria-label="Filters"
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          {activeCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold-400 text-[11px] font-bold text-brand-950">{activeCount}</span>
          ) : null}
        </label>
      </div>

      <div className="mt-3 hidden space-y-3 peer-checked:block md:block">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {!lockedCategory ? (
            <div className="col-span-2 lg:col-span-1">
              <label htmlFor="f-cat" className={label}>Category</label>
              <select id="f-cat" name="category" defaultValue={values.category ?? ""} className={filterControl}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label htmlFor="f-min" className={label}>Min price (₦)</label>
            <input id="f-min" name="min" type="number" min={0} inputMode="numeric" defaultValue={values.min} className={filterControl} />
          </div>
          <div>
            <label htmlFor="f-max" className={label}>Max price (₦)</label>
            <input id="f-max" name="max" type="number" min={0} inputMode="numeric" defaultValue={values.max} className={filterControl} />
          </div>
          <div>
            <label htmlFor="f-cond" className={label}>Condition</label>
            <select id="f-cond" name="condition" defaultValue={values.condition ?? ""} className={filterControl}>
              <option value="">Any</option>
              {PRODUCT_CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-campus" className={label}>Campus area</label>
            <select id="f-campus" name="campus_area" defaultValue={values.campus_area ?? ""} className={filterControl}><option value="">All areas</option>{["Main Campus","Permanent Site","Annex","Off-Campus","Town"].map((v)=><option key={v}>{v}</option>)}</select>
          </div>
          <div><label htmlFor="f-hostel" className={label}>Hostel / lodge</label><input id="f-hostel" name="hostel_name" defaultValue={values.hostel_name} placeholder="e.g. Hostel B" className={filterControl}/></div>
          <div><label htmlFor="f-dept" className={label}>Department</label><input id="f-dept" name="academic_department" defaultValue={values.academic_department} placeholder="e.g. Mathematics" className={filterControl}/></div>
          <div><label htmlFor="f-level" className={label}>Level</label><select id="f-level" name="academic_level" defaultValue={values.academic_level ?? ""} className={filterControl}><option value="">All levels</option>{["100L","200L","300L","400L","500L"].map((v)=><option key={v}>{v}</option>)}</select></div>
          <div><label htmlFor="f-course" className={label}>Course code</label><input id="f-course" name="course_code" defaultValue={values.course_code} placeholder="e.g. MTH 101" className={filterControl}/></div>
          <div>
            <label htmlFor="f-sort" className={label}>Sort by</label>
            <select id="f-sort" name="sort" defaultValue={values.sort ?? "newest"} className={filterControl}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg" className="flex-1 sm:flex-none">Apply filters</Button>
          <a href={action} className="inline-flex h-12 items-center rounded-xl px-4 text-sm font-semibold text-stone-600 active:bg-stone-100 sm:hover:bg-stone-100">
            Clear
          </a>
        </div>
      </div>
    </form>
  );
}
