import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff, MapPin } from "lucide-react";
import { SaveButton } from "@/components/product/save-button";
import { PRODUCT_CONDITIONS } from "@/config/site";
import { formatNaira, publicImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

export function conditionLabel(value: string) {
  return PRODUCT_CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function ProductCard({ product, saved, signedIn }: { product: Product; saved: boolean; signedIn: boolean }) {
  const cover = publicImageUrl(product.product_images?.[0]?.path);

  return (
    <article className="relative h-full">
      <Link
        href={`/product/${product.id}`}
        className="group flex h-full flex-col rounded-2xl bg-white p-2 shadow-sm ring-1 ring-stone-200 transition active:scale-[0.985] sm:hover:shadow-md"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
          {cover ? (
            <Image
              src={cover}
              alt={product.title}
              fill
              sizes="(min-width:1024px) 22vw, (min-width:640px) 30vw, 46vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-stone-300">
              <ImageOff className="size-8" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
          <h3 className="line-clamp-2 min-h-[2.5rem] font-sans text-[13.5px] font-medium leading-snug text-stone-900">{product.title}</h3>
          {product.campus_area || product.hostel_name ? <p className="mt-1 truncate text-[10px] font-medium text-brand-700">{[product.campus_area,product.hostel_name].filter(Boolean).join(" · ")}</p> : null}
          {product.location ? (
            <p className="mt-1 inline-flex items-center gap-1 truncate text-[11px] text-stone-500">
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{product.location}</span>
            </p>
          ) : null}
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <p className="font-sans text-[17px] font-bold leading-none text-brand-900">{formatNaira(product.price)}</p>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-900 text-white transition group-hover:bg-brand-700">
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>

      {/* Condition pill, like the discount tag in the reference */}
      <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-md bg-white/95 px-2 py-1 text-[10.5px] font-semibold text-brand-900 shadow-sm ring-1 ring-stone-200">
        {conditionLabel(product.condition)}
      </span>
      <div className="absolute right-3.5 top-3.5">
        <SaveButton productId={product.id} saved={saved} signedIn={signedIn} />
      </div>
    </article>
  );
}
