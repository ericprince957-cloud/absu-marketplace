import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Package } from "lucide-react";
import { deleteProduct, setMyProductStatus } from "@/app/seller/actions";
import { LinkButton } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { requireUser } from "@/lib/auth";
import { listSellerProducts } from "@/lib/data/products";
import { formatNaira, publicImageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "My products" };

export default async function SellerProductsPage() {
  const user = await requireUser("/seller/products");
  const products = await listSellerProducts(user.id);

  return (
    <>
      <PageHeader title="My products" description="Your listings are published immediately. Keep them accurate and up to date." actions={<LinkButton href="/seller/products/new">Add product</LinkButton>} />
      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-10" aria-hidden />}
          title="You have no listings yet"
          description="Add your first product with a few photos. It goes live as soon as you publish it."
          action={<LinkButton href="/seller/products/new">Add product</LinkButton>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cover = publicImageUrl(p.product_images?.[0]?.path);
              return (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {cover ? <Image src={cover} alt="" fill sizes="48px" className="object-cover" /> : <ImageOff className="m-auto mt-3.5 size-5 text-stone-300" aria-hidden />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/product/${p.id}`} className="line-clamp-1 font-medium hover:text-brand-700 hover:underline">{p.title}</Link>
                        {p.status === "rejected" && p.moderation_note ? <p className="text-xs text-red-600">Note: {p.moderation_note}</p> : null}
                      </div>
                    </div>
                  </Td>
                  <Td>{formatNaira(p.price)}</Td>
                  <Td>{p.quantity}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <LinkButton href={`/seller/products/${p.id}/edit`} variant="outline" size="sm">Edit</LinkButton>
                      {p.status === "approved" ? (
                        <form action={setMyProductStatus}>
                          <input type="hidden" name="product_id" value={p.id} />
                          <input type="hidden" name="status" value="sold" />
                          <ConfirmButton variant="outline" message="Mark this item as sold? It will leave the marketplace.">Mark sold</ConfirmButton>
                        </form>
                      ) : null}
                      <form action={deleteProduct}>
                        <input type="hidden" name="product_id" value={p.id} />
                        <ConfirmButton message="Delete this listing and its photos? This cannot be undone.">Delete</ConfirmButton>
                      </form>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
