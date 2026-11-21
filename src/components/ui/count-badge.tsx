import { cn } from "@/lib/utils";

/** Small counter bubble for nav icons. Renders nothing for 0. Caps at 9+ (99+ for inline use). */
export function CountBadge({
  count,
  tone = "alert",
  inline = false,
  className,
}: {
  count: number;
  tone?: "alert" | "neutral";
  /** Inline pill (menu rows) instead of a bubble pinned to an icon corner. */
  inline?: boolean;
  className?: string;
}) {
  if (!count || count < 1) return null;
  const text = count > (inline ? 99 : 9) ? (inline ? "99+" : "9+") : String(count);
  return (
    <span
      aria-label={`${count} ${tone === "alert" ? "new" : "items"}`}
      className={cn(
        "pointer-events-none grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold leading-none ring-[1.5px] ring-white",
        tone === "alert" ? "bg-red-600 text-white" : "bg-gold-400 text-brand-950",
        !inline && "absolute -right-2.5 -top-2",
        inline && "ml-auto ring-0",
        className,
      )}
    >
      {text}
    </span>
  );
}
