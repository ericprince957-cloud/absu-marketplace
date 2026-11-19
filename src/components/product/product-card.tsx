import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin } from "lucide-react";
import { SaveButton } from "@/components/product/save-button";
import { Badge } from "@/components/ui/feedback";
import { PRODUCT_CONDITIONS } from "@/config/site";
import { formatNaira, publicImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

export function conditionLabel(value: string) {
  return PRODUCT_CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function ProductCard({ product, saved, signedIn }: { product: Product; saved: boolean; signedIn: boolean }) {
  const cover = publicImageUrl(product.product_images?.[0]?.path);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-stone-100">
          {cover ? (
            <Image
              src={cover}
              alt={product.title}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-stone-300">
              <ImageOff className="size-8" aria-hidden />
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3.5 sm:p-4">
          <p className="font-display text-lg font-bold text-brand-800">{formatNaira(product.price)}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-stone-900">{product.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
            <Badge>{conditionLabel(product.condition)}</Badge>
            {product.location ? (
              <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                <MapPin className="size-3" aria-hidden />
                {product.location}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5">
        <SaveButton productId={product.id} saved={saved} signedIn={signedIn} />
      </div>
    </article>
  );
}
