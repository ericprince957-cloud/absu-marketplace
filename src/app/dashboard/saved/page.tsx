import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { requireUser } from "@/lib/auth";
import { listSavedProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Saved products" };

export default async function SavedPage() {
  const user = await requireUser("/dashboard/saved");
  const products = await listSavedProducts(user.id);

  return (
    <>
      <PageHeader title="Saved products" description="Items you bookmarked to look at later." />
      {products.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-10" aria-hidden />}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here."
          action={<LinkButton href="/marketplace">Browse marketplace</LinkButton>}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
