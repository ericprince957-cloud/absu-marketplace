import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Store } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { getSellerPublic, listProducts } from "@/lib/data/products";
import { initials } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const seller = await getSellerPublic((await params).id);
  if (!seller) return { title: "Seller storefront", robots: { index: false, follow: true } };
  const title = `${seller.display_name ?? "Student seller"} on ABSU Trade`;
  const description = seller.bio?.trim()
    ? `${seller.bio.trim().slice(0, 105)} Browse this seller's available listings on ABSU Trade in Uturu.`.slice(0, 160)
    : `Browse products and services listed by ${seller.display_name ?? "an ABSU student seller"} at Abia State University, Uturu.`;
  return {
    title,
    description,
    alternates: { canonical: `/store/${seller.id}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function StorefrontPage({ params }: { params: Params }) {
  const { id } = await params;
  const seller = await getSellerPublic(id);
  if (!seller) notFound();

  const { products, total } = await listProducts({ sellerId: id, pageSize: 24 });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950">
        <ArrowLeft className="size-4" /> Back to marketplace
      </Link>
      <section className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white">
        <div className="h-24 bg-[#171717] sm:h-32" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
            <div className="grid size-20 shrink-0 place-items-center rounded-[1.5rem] border-4 border-white bg-stone-100 font-display text-2xl font-extrabold text-stone-800 shadow-sm sm:size-24">
              {initials(seller.display_name)}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700"><BadgeCheck className="size-3.5" /> ABSU Marketplace seller</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-stone-950 sm:text-3xl">{seller.display_name ?? "Student seller"}</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-600">
              <Store className="size-4" /> {total} public listing{total === 1 ? "" : "s"}
            </div>
          </div>
          {seller.bio ? <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-600">{seller.bio}</p> : null}
        </div>
      </section>

      <section aria-labelledby="store-listings-heading" className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500">Shop this seller</p>
          <h2 id="store-listings-heading" className="mt-1 font-display text-2xl font-bold text-stone-950">Available listings</h2>
        </div>
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <Store className="mx-auto size-8 text-stone-400" />
            <p className="mt-3 font-semibold text-stone-900">No public listings yet</p>
            <p className="mt-1 text-sm text-stone-500">This seller has no approved products available right now.</p>
          </div>
        )}
      </section>
    </div>
  );
}
