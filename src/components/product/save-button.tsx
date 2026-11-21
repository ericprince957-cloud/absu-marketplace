"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSaved } from "@/app/(site)/actions";
import { cn } from "@/lib/utils";

export function SaveButton({
  productId,
  saved,
  signedIn,
  className,
}: {
  productId: string;
  saved: boolean;
  signedIn: boolean;
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  const base = cn(
    "grid size-8 place-items-center rounded-full bg-white/95 shadow ring-1 ring-stone-200 transition hover:scale-105",
    className,
  );

  if (!signedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(`/product/${productId}`)}`} aria-label="Log in to save this product" className={base}>
        <Heart className="size-4 text-stone-600" aria-hidden />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from saved" : "Save product"}
      className={base}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleSaved(productId);
        })
      }
    >
      <Heart className={cn("size-4", optimistic ? "fill-red-500 text-red-500" : "text-stone-600")} aria-hidden />
    </button>
  );
}
