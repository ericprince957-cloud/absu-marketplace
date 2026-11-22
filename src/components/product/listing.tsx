import { PackageSearch } from "lucide-react";
import { CategoryChips } from "@/components/product/category-nav";
import { ProductFilters, type FilterValues } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/feedback";
import { LinkButton } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PAGE_SIZE, PRODUCT_CONDITIONS } from "@/config/site";
import { listCategories } from "@/lib/data/categories";
import { listProducts, type ProductQuery, type ProductSort } from "@/lib/data/products";
import { first, pageNumber } from "@/lib/utils";
import type { ProductCondition } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

function parseNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseListingParams(sp: SearchParams): { query: ProductQuery; values: FilterValues } {
  const conditionRaw = first(sp.condition);
  const condition = PRODUCT_CONDITIONS.some((c) => c.value === conditionRaw) ? (conditionRaw as ProductCondition) : undefined;
  const sortRaw = first(sp.sort);
  const sort: ProductSort = sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : "newest";

  const values: FilterValues = {
    q: first(sp.q)?.slice(0, 80),
    category: first(sp.category),
    min: first(sp.min),
    max: first(sp.max),
    condition,
    campus_area: first(sp.campus_area),
    hostel_name: first(sp.hostel_name)?.slice(0,100),
    academic_department: first(sp.academic_department)?.slice(0,100),
    academic_level: first(sp.academic_level),
    course_code: first(sp.course_code)?.slice(0,30),
    sort: sort === "newest" ? undefined : sort,
  };

  return {
    values,
    query: {
      q: values.q,
      categoryId: values.category,
      minPrice: parseNumber(values.min),
      maxPrice: parseNumber(values.max),
      condition,
      campusArea: values.campus_area,
      hostelName: values.hostel_name,
      academicDepartment: values.academic_department,
      academicLevel: values.academic_level,
      courseCode: values.course_code,
      sort,
      page: pageNumber(sp.page),
    },
  };
}

/** Filter bar + results grid + pagination, shared by marketplace, search and category pages. */
export async function Listing({
  basePath,
  searchParams,
  lockedCategoryId,
}: {
  basePath: string;
  searchParams: SearchParams;
  lockedCategoryId?: string;
}) {
  const { query, values } = parseListingParams(searchParams);
  if (lockedCategoryId) query.categoryId = lockedCategoryId;

  const [categories, { products, total }] = await Promise.all([listCategories(), listProducts(query)]);
  const hasFilters = Boolean(values.q || values.category || values.min || values.max || values.condition || values.campus_area || values.hostel_name || values.academic_department || values.academic_level || values.course_code);

  return (
    <div className="space-y-4 sm:space-y-6">
      <CategoryChips categories={categories} activeId={lockedCategoryId ?? values.category} />
      <ProductFilters action={basePath} categories={categories} values={values} lockedCategory={Boolean(lockedCategoryId)} />

      <p className="text-sm text-stone-600" aria-live="polite">
        {total === 0 ? "No products found" : `${total} product${total === 1 ? "" : "s"}`}
        {values.q ? <> for <strong className="text-stone-900">&ldquo;{values.q}&rdquo;</strong></> : null}
      </p>

      {products.length > 0 ? (
        <>
          <ProductGrid products={products} />
          <Pagination
            page={query.page ?? 1}
            pageSize={PAGE_SIZE}
            total={total}
            basePath={basePath}
            params={{ q: values.q, category: values.category, min: values.min, max: values.max, condition: values.condition, campus_area: values.campus_area, hostel_name: values.hostel_name, academic_department: values.academic_department, academic_level: values.academic_level, course_code: values.course_code, sort: values.sort }}
          />
        </>
      ) : (
        <EmptyState
          icon={<PackageSearch className="size-10" aria-hidden />}
          title={hasFilters ? "Nothing matches your search" : "No products yet"}
          description={
            hasFilters
              ? "Try a different word, widen the price range or clear the filters."
              : "Be the first to list something. Verified ABSU students can become sellers in minutes."
          }
          action={
            hasFilters ? (
              <LinkButton href={basePath} variant="outline">Clear filters</LinkButton>
            ) : (
              <LinkButton href="/seller/apply">Become a seller</LinkButton>
            )
          }
        />
      )}
    </div>
  );
}
