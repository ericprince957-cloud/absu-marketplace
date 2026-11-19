"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: { id: string; url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        {current ? (
          <Image src={current.url} alt={title} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-stone-300">
            <ImageOff className="size-12" aria-hidden />
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-stone-100",
                  i === active ? "border-brand-700" : "border-transparent hover:border-stone-300",
                )}
              >
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
