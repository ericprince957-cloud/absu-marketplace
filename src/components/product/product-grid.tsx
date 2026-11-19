import { ProductCard } from "@/components/product/product-card";
import { getSavedProductIds } from "@/lib/data/products";
import { getUser } from "@/lib/auth";
import type { Product } from "@/types";

export async function ProductGrid({ products }: { products: Product[] }) {
  const user = await getUser();
  const saved = user ? await getSavedProductIds(user.id, products.map((p) => p.id)) : new Set<string>();

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} saved={saved.has(p.id)} signedIn={Boolean(user)} />
        </li>
      ))}
    </ul>
  );
}
