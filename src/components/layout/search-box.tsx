import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rounded search field with the dark circular button from the reference design. Plain GET form, no JavaScript needed. */
export function SearchBox({ id, className, defaultValue }: { id: string; className?: string; defaultValue?: string }) {
  return (
    <form action="/search" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        enterKeyHint="search"
        defaultValue={defaultValue}
        placeholder="Search products, books, phones..."
        className="h-12 w-full rounded-full border border-stone-200 bg-white pl-5 pr-14 text-base text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-brand-900 text-white transition active:scale-95"
      >
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}
