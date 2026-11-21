import { ProductCard } from "@/components/product/product-card";
import { getSavedProductIds } from "@/lib/data/products";
import { getUser } from "@/lib/auth";
import type { Product } from "@/types";

async function loadSavedState(products: Product[]) {
  const user = await getUser();
  const saved = user ? await getSavedProductIds(user.id, products.map((p) => p.id)) : new Set<string>();
  return { saved, signedIn: Boolean(user) };
}

/** Two columns on phones, more as the screen grows. */
export async function ProductGrid({ products }: { products: Product[] }) {
  const { saved, signedIn } = await loadSavedState(products);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} saved={saved.has(p.id)} signedIn={signedIn} />
        </li>
      ))}
    </ul>
  );
}

/** Swipeable single row (home page "Fresh on campus"). Bleeds to the screen edge on phones. */
export async function ProductRow({ products }: { products: Product[] }) {
  const { saved, signedIn } = await loadSavedState(products);

  return (
    <ul className="snap-row -mx-4 gap-3 px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-3">
      {products.map((p) => (
        <li key={p.id} className="w-[44vw] max-w-[210px] sm:w-52">
          <ProductCard product={p} saved={saved.has(p.id)} signedIn={signedIn} />
        </li>
      ))}
    </ul>
  );
}
