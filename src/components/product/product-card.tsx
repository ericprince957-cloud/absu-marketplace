import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageOff, MapPin, ShieldCheck } from "lucide-react";
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
    <article className="market-product-card group relative min-w-0 overflow-hidden rounded-[1.35rem] bg-white transition duration-300">
      <div className="relative">
        <Link href={\`/product/\${product.id}\`} aria-label={\`View \${product.title}\`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
            {cover ? (
              <Image
                src={cover}
                alt={product.title}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="grid h-full place-items-center text-stone-300">
                <ImageOff className="size-8" aria-hidden />
              </div>
            )}
          </div>
        </Link>
        <div className="absolute right-2.5 top-2.5 z-10">
          <SaveButton productId={product.id} saved={saved} signedIn={signedIn} />
        </div>
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-stone-700 shadow-sm backdrop-blur">
          <ShieldCheck className="size-3 text-emerald-600" aria-hidden /> ABSU seller
        </span>
      </div>

      <div className="space-y-2.5 px-3 pt-3.5 pb-3 sm:px-4 sm:pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-lg font-extrabold tracking-tight text-stone-950 sm:text-xl">{formatNaira(product.price)}</p>
          <Badge>{conditionLabel(product.condition)}</Badge>
        </div>
        <Link href={\`/product/\${product.id}\`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-snug text-stone-800 transition group-hover:text-brand-700 sm:text-sm">{product.title}</h3>
        </Link>
        <div className="flex min-h-5 items-center gap-1 text-[11px] text-stone-500">
          {product.location ? <><MapPin className="size-3 shrink-0" aria-hidden /><span className="truncate">{product.location}</span></> : <span>ABSU · Uturu</span>}
        </div>
        <Link href={\`/product/\${product.id}\`} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-3 text-xs font-bold text-white transition hover:bg-brand-700 focus-visible:outline-offset-2">
          View item <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
