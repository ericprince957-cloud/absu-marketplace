"use client";

import { useEffect, useState } from "react";
import { Globe, Mail, MessageCircle, X } from "lucide-react";

export function VectorCodesCredit() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <footer className="border-t border-neutral-800 bg-neutral-950 px-4 py-5 text-center text-sm text-neutral-300">
        <p className="flex flex-wrap items-center justify-center gap-1.5">
          <span>Built by</span>
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}
            className="rounded-md px-1 font-bold text-[#D4AF37] underline-offset-4 transition hover:text-[#F0D77A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]">
            Vector Codes
          </button>
        </p>
      </footer>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="vector-contact-title"
            className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-950 p-5 text-white shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">Built by</p>
                <h2 id="vector-contact-title" className="mt-1 text-2xl font-bold">Vector Codes</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">Want to work with us or learn more? Choose how to reach our team.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close contact options"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-2.5">
              <a href="mailto:vectorcodes15@gmail.com" className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-sm font-semibold transition hover:border-[#D4AF37]">
                <Mail className="size-5 text-[#D4AF37]" /> Email Vector Codes
              </a>
              <a href="https://wa.me/2347084547988" target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-sm font-semibold transition hover:border-[#D4AF37]">
                <MessageCircle className="size-5 text-[#D4AF37]" /> WhatsApp
              </a>
              <a href="https://vectorcodes.vercel.app/" target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-sm font-semibold transition hover:border-[#D4AF37]">
                <Globe className="size-5 text-[#D4AF37]" /> Official website
              </a>
            </div>
            <p className="mt-5 text-center text-xs text-neutral-500">Digital solutions by Vector Codes.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
