import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

/** Server-rendered pagination. Keeps all existing query-string filters. */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonStyles({ variant: "outline", size: "sm" })}>
          <ChevronLeft className="size-4" aria-hidden /> Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-stone-600">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={buttonStyles({ variant: "outline", size: "sm" })}>
          Next <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
