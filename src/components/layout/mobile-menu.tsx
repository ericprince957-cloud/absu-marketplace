"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Logo } from "@/components/layout/logo";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  links: { href: string; label: string }[];
  categories: { href: string; label: string }[];
  signedIn: boolean;
}

/** Slide-in drawer for phones: categories, pages and account actions. */
export function MobileMenu({ links, categories, signedIn }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close the drawer whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label="Open menu"
        className="grid size-11 place-items-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm transition active:scale-95"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <div className={cn("fixed inset-0 z-[70] transition", open ? "visible" : "invisible delay-200")} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-brand-950/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-stone-200 px-4">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-xl text-stone-700 active:bg-stone-200">
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <div className="grid gap-2">
              {signedIn ? (
                <Link href="/dashboard" className={buttonStyles({ size: "lg" })}>
                  My dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className={buttonStyles({ size: "lg" })}>
                    Create free account
                  </Link>
                  <Link href="/login" className={buttonStyles({ variant: "outline", size: "lg" })}>
                    Log in
                  </Link>
                </>
              )}
            </div>

            {categories.length > 0 ? (
              <section className="mt-7" aria-label="Categories">
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-stone-500">Categories</h2>
                <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {categories.map((c) => (
                    <li key={c.href} className="border-b border-stone-100 last:border-0">
                      <Link href={c.href} className="flex min-h-12 items-center justify-between px-4 text-[15px] font-medium text-stone-800 active:bg-brand-50">
                        {c.label}
                        <ChevronRight className="size-4 text-stone-400" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-7" aria-label="Pages">
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-stone-500">Explore</h2>
              <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {links.map((l) => (
                  <li key={l.href} className="border-b border-stone-100 last:border-0">
                    <Link href={l.href} className="flex min-h-12 items-center justify-between px-4 text-[15px] font-medium text-stone-800 active:bg-brand-50">
                      {l.label}
                      <ChevronRight className="size-4 text-stone-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {signedIn ? (
            <form action={logout} className="shrink-0 border-t border-stone-200 p-4 pb-safe">
              <button type="submit" className={buttonStyles({ variant: "outline", size: "lg", className: "w-full" })}>
                <LogOut className="size-4" aria-hidden /> Log out
              </button>
            </form>
          ) : null}
        </aside>
      </div>
    </>
  );
}
