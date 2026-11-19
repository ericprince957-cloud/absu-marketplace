import type { Metadata } from "next";
import { updateCategory } from "@/app/admin/actions";
import { CategoryForm } from "@/components/dashboard/category-form";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { filterControl } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
  if (error) console.error("[admin] categories failed:", error.message);
  const categories = (data ?? []) as Category[];

  return (
    <>
      <PageHeader title="Categories" description="Organise the marketplace. Deactivate a category instead of deleting it to keep old listings intact." />
      <div className="space-y-8">
        <Card>
          <h2 className="mb-4 text-lg font-bold">Add a category</h2>
          <CategoryForm />
        </Card>

        <section aria-labelledby="all-cats">
          <h2 id="all-cats" className="mb-3 text-lg font-bold">All categories ({categories.length})</h2>
          {categories.length === 0 ? (
            <EmptyState title="No categories yet" description="Add the first one above. Sellers cannot list products until at least one exists." />
          ) : (
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Card className="p-4">
                    <form action={updateCategory} className="grid items-end gap-3 sm:grid-cols-[1.2fr_1.2fr_1.5fr_90px_auto_auto]">
                      <input type="hidden" name="id" value={c.id} />
                      <div>
                        <label htmlFor={`name-${c.id}`} className="mb-1 block text-xs font-medium text-stone-600">Name</label>
                        <input id={`name-${c.id}`} name="name" defaultValue={c.name} required className={filterControl} />
                      </div>
                      <div>
                        <label htmlFor={`slug-${c.id}`} className="mb-1 block text-xs font-medium text-stone-600">Slug</label>
                        <input id={`slug-${c.id}`} name="slug" defaultValue={c.slug} required className={filterControl} />
                      </div>
                      <div>
                        <label htmlFor={`desc-${c.id}`} className="mb-1 block text-xs font-medium text-stone-600">Description</label>
                        <input id={`desc-${c.id}`} name="description" defaultValue={c.description ?? ""} className={filterControl} />
                      </div>
                      <div>
                        <label htmlFor={`ord-${c.id}`} className="mb-1 block text-xs font-medium text-stone-600">Order</label>
                        <input id={`ord-${c.id}`} name="sort_order" type="number" min={0} defaultValue={c.sort_order} className={filterControl} />
                      </div>
                      <label className="flex h-10 items-center gap-2 text-sm font-medium">
                        <input type="checkbox" name="is_active" defaultChecked={c.is_active} className="size-4 accent-brand-700" /> Active
                      </label>
                      <SubmitButton size="sm" variant="outline" pendingText="Saving...">Save</SubmitButton>
                    </form>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
