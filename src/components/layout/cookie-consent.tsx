"use client";

import { useEffect, useState } from "react";
import { Cookie, Settings2, X } from "lucide-react";

type Consent = { essential: true; analytics: boolean; updatedAt: string };
const COOKIE_NAME = "absu_cookie_preferences";
const MAX_AGE = 60 * 60 * 24 * 180;

function readConsent(): Consent | null {
  const match = document.cookie.split("; ").find((item) => item.startsWith(COOKIE_NAME + "="));
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match.slice(COOKIE_NAME.length + 1))) as Consent; }
  catch { return null; }
}

function saveConsent(analytics: boolean) {
  const value: Consent = { essential: true, analytics, updatedAt: new Date().toISOString() };
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax; Secure`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) { setAnalytics(existing.analytics); return; }
    setVisible(true);
  }, []);

  function choose(value: boolean) {
    saveConsent(value);
    setAnalytics(value);
    setVisible(false);
    setSettings(false);
  }

  if (!visible) return null;
  return (
    <aside className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl border border-neutral-700 bg-neutral-950 p-4 text-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:p-5" aria-label="Cookie preferences">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"><Cookie className="size-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Your privacy matters</h2>
          <p className="mt-1 text-sm leading-5 text-neutral-300">We use essential cookies to keep sign-in and security features working. Optional analytics are currently off.</p>
        </div>
        <button type="button" onClick={() => setVisible(false)} aria-label="Close cookie notice" className="grid size-8 shrink-0 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-800"><X className="size-4" /></button>
      </div>
      {settings ? (
        <div className="mt-4 rounded-xl border border-neutral-800 p-3">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-medium">Essential cookies</p><p className="text-xs text-neutral-400">Always active for account and security.</p></div>
            <span className="text-xs font-semibold text-[#D4AF37]">Always on</span>
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 border-t border-neutral-800 pt-3">
            <span><span className="block text-sm font-medium">Optional analytics</span><span className="block text-xs text-neutral-400">No analytics provider is currently enabled.</span></span>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="size-5 accent-[#D4AF37]" />
          </label>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose(false)} className="min-h-10 flex-1 rounded-xl border border-neutral-700 px-3 text-sm font-semibold hover:bg-neutral-800">Reject optional</button>
        {settings ? (
          <button type="button" onClick={() => choose(analytics)} className="min-h-10 flex-1 rounded-xl bg-[#D4AF37] px-3 text-sm font-bold text-black hover:bg-[#e5c65e]">Save choices</button>
        ) : (
          <button type="button" onClick={() => setSettings(true)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-700 px-3 text-sm font-semibold hover:bg-neutral-800"><Settings2 className="size-4" /> Settings</button>
        )}
        <button type="button" onClick={() => choose(true)} className="min-h-10 flex-1 rounded-xl bg-[#D4AF37] px-3 text-sm font-bold text-black hover:bg-[#e5c65e]">Accept all</button>
      </div>
      <p className="mt-3 text-[11px] text-neutral-500">Your choice is saved on this device. You can change it by clearing this site’s cookies.</p>
    </aside>
  );
}
