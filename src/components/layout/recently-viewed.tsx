"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, ImageOff } from "lucide-react";
import { formatNaira } from "@/lib/utils";

type ViewedProduct = {
  id: string;
  title: string;
  price: number;
  image: string | null;
};

const STORAGE_KEY = "absu-market-recently-viewed-v1";

export function RecentlyViewed({
  current,
  show = true,
}: {
  current?: ViewedProduct;
  show?: boolean;
}) {
  const [items, setItems] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ViewedProduct[];
      const valid = Array.isArray(stored)
        ? stored.filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
        : [];
      const next = current ? [current, ...valid.filter((item) => item.id !== current.id)].slice(0, 8) : valid.slice(0, 8);
      if (current) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setItems(next);
    } catch {
      setItems(current ? [current] : []);
    }
  }, [current]);

  if (!show || items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500"><Clock3 className="size-3.5" /> Pick up where you left off</p>
          <h2 id="recently-viewed-heading" className="mt-1 font-display text-xl font-bold text-stone-950 sm:text-2xl">Recently viewed</h2>
        </div>
        <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-stone-700 hover:text-brand-700">Browse all <ArrowRight className="size-4" /></Link>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {items.map((item) => (
          <li key={item.id} className="w-36 shrink-0 snap-start sm:w-44">
            <Link href={\`/product/\${item.id}\`} className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative aspect-[4/3] bg-stone-100">
                {item.image ? <Image src={item.image} alt={item.title} fill unoptimized sizes="176px" className="object-cover transition group-hover:scale-105" /> : <div className="grid h-full place-items-center text-stone-300"><ImageOff className="size-6" /></div>}
              </div>
              <div className="p-3">
                <p className="font-display text-sm font-extrabold text-stone-950">{formatNaira(item.price)}</p>
                <p className="mt-1 line-clamp-2 min-h-9 text-xs font-medium leading-snug text-stone-600">{item.title}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
