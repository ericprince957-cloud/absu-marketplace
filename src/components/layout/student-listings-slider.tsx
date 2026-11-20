import Link from "next/link";
import { ArrowRight, ImageOff, MapPin, Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { listProducts, getSavedProductIds } from "@/lib/data/products";
import { formatNaira, publicImageUrl } from "@/lib/utils";
import Image from "next/image";
import { SaveButton } from "@/components/product/save-button";

export async function StudentListingsSlider() {
  const [{ products }, user] = await Promise.all([listProducts({ pageSize: 24 }), getUser()]);
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picks = shuffled.slice(0, 12);
  const saved = user ? await getSavedProductIds(user.id, picks.map((item) => item.id)) : new Set<string>();

  return (
    <section aria-labelledby="student-listings-heading" className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700"><Sparkles className="size-3.5" /> The campus discovery feed</p>
          <h2 id="student-listings-heading" className="mt-1 font-display text-2xl font-bold text-stone-950 sm:text-3xl">Trending on campus</h2>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">A rotating mix of approved listings from ABSU sellers.</p>
        </div>
        <Link href="/marketplace" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-stone-800 hover:underline">See all <ArrowRight className="size-4" /></Link>
      </div>
      {picks.length ? (
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:mx-0 sm:gap-4 sm:px-0">
          {picks.map((product) => {
            const cover = publicImageUrl(product.product_images?.[0]?.path);
            return (
              <li key={product.id} className="w-[72%] max-w-[16rem] shrink-0 snap-start sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]">
                <article className="group h-full overflow-hidden rounded-[1.35rem] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-xl">
                  <Link href={\`/product/\${product.id}\`} className="block">
                    <div className="relative aspect-[5/4] overflow-hidden bg-stone-100">
                      {cover ? <Image src={cover} alt={product.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 72vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-stone-300"><ImageOff className="size-8" /></div>}
                      <div className="absolute right-2 top-2 z-10"><SaveButton productId={product.id} saved={saved.has(product.id)} signedIn={Boolean(user)} /></div>
                      <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold text-white">Campus find</span>
                    </div>
                    <div className="p-3.5">
                      <p className="font-display text-lg font-extrabold text-stone-950">{formatNaira(product.price)}</p>
                      <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-stone-800">{product.title}</h3>
                      {product.location ? <p className="mt-2 flex items-center gap-1 text-xs text-stone-500"><MapPin className="size-3" />{product.location}</p> : null}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between border-t border-stone-100 px-3.5 py-2.5 text-xs text-stone-500">
                    <span>Listed by an ABSU seller</span>
                    <Link href={\`/product/\${product.id}\`} className="font-bold text-stone-900 underline-offset-4 hover:underline">View item</Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-7 text-center">
          <p className="font-semibold text-stone-900">The campus feed is getting ready.</p>
          <p className="mt-1 text-sm text-stone-500">Approved student listings will appear here as sellers add products.</p>
          <Link href="/seller/apply" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-black">Become a seller</Link>
        </div>
      )}
    </section>
  );
}
