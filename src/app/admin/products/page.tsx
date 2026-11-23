import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { moderateProduct } from "@/app/admin/actions";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { PRODUCT_STATUSES } from "@/config/site";
import { PRODUCT_SELECT } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import { cn, first, formatNaira, publicImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const statusRaw = first((await searchParams).status);
  const status = (PRODUCT_STATUSES as readonly string[]).includes(statusRaw ?? "") ? statusRaw! : "pending";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[admin] products failed:", error.message);
  const products = (data ?? []) as unknown as Product[];

  return (
    <>
      <PageHeader title="Listings & takedowns" description="Review older pending listings and take down listings that are unsafe, misleading or reported. New verified-seller listings publish automatically." />
      <nav aria-label="Status filter" className="mb-5 flex flex-wrap gap-2">
        {PRODUCT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/products?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium capitalize", s === status ? "bg-brand-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50")}
          >
            {s}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <EmptyState title={`No ${status} products`} />
      ) : (
        <ul className="space-y-4">
          {products.map((p) => {
            const cover = publicImageUrl(p.product_images?.sort((a, b) => a.position - b.position)[0]?.path);
            return (
              <li key={p.id}>
                <Card className="space-y-3 p-4 sm:p-5">
                  <div className="flex gap-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {cover ? <Image src={cover} alt="" fill sizes="96px" className="object-cover" /> : <ImageOff className="m-auto mt-8 size-6 text-stone-300" aria-hidden />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/product/${p.id}`} className="font-semibold hover:text-brand-700 hover:underline">{p.title}</Link>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-sm font-medium text-brand-800">{formatNaira(p.price)} · qty {p.quantity}</p>
                      <p className="line-clamp-3 text-sm text-stone-600">{p.description}</p>
                    </div>
                  </div>
                  <form action={moderateProduct} className="space-y-3 border-t border-stone-100 pt-3">
                    <input type="hidden" name="product_id" value={p.id} />
                    <label htmlFor={`n-${p.id}`} className="sr-only">Moderator note</label>
                    <input id={`n-${p.id}`} name="note" maxLength={300} placeholder="Note to seller (required reason when rejecting)" className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm" />
                    <div className="flex flex-wrap gap-2">
                      {p.status !== "approved" ? <SubmitButton name="status" value="approved" size="sm" pendingText="Saving...">Approve</SubmitButton> : null}
                      {p.status !== "rejected" ? <SubmitButton name="status" value="rejected" size="sm" variant="danger" pendingText="Saving...">Reject</SubmitButton> : null}
                      {p.status === "approved" ? <SubmitButton name="status" value="archived" size="sm" variant="outline" pendingText="Saving...">Take down</SubmitButton> : null}
                    </div>
                  </form>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
