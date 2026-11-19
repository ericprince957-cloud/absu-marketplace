"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

interface Props { links: { href: string; label: string }[]; signedIn: boolean; }

export function MobileMenu({ links, signedIn }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close the menu whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-11 place-items-center rounded-xl border border-stone-200 bg-white text-stone-800 transition hover:bg-stone-100">
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 top-[4.25rem] z-40 max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-stone-200 bg-white p-4 shadow-xl">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-4 py-3.5 text-base font-medium text-stone-800 transition hover:bg-stone-100">{l.label}</Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 border-t border-stone-100 pt-4">
            {signedIn ? (
              <>
                <Link href="/dashboard" className={buttonStyles({ variant: "primary" })}>My dashboard</Link>
                <form action={logout}><button type="submit" className={buttonStyles({ variant: "outline", className: "w-full" })}>Log out</button></form>
              </>
            ) : (
              <>
                <Link href="/register" className={buttonStyles({ variant: "primary" })}>Create free account</Link>
                <Link href="/login" className={buttonStyles({ variant: "outline" })}>Log in</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
