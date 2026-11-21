"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };

export function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
    } else if (ios) {
      setShowIosHelp(true);
    }
  }

  if (installed || (!promptEvent && !ios)) return null;
  return (
    <>
      <button type="button" onClick={install} className="fixed bottom-24 right-4 z-[70] inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e5c65e] bg-neutral-950 px-4 text-sm font-bold text-[#e5c65e] shadow-xl transition hover:bg-neutral-800 sm:bottom-6 sm:right-6">
        <Download className="size-4" /> Install app
      </button>
      {showIosHelp ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowIosHelp(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="ios-install-title" className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-950 p-5 text-white shadow-2xl">
            <h2 id="ios-install-title" className="text-lg font-bold">Install ABSU Marketplace</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-300">On your iPhone or iPad:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-200">
              <li>Tap the Share button in Safari.</li>
              <li>Scroll down and choose <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> to finish.</li>
            </ol>
            <p className="mt-3 flex items-center gap-2 text-xs text-neutral-400"><Share className="size-4" /> Open this site in Safari to install it.</p>
            <button type="button" onClick={() => setShowIosHelp(false)} className="mt-5 min-h-11 w-full rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-black">Got it</button>
          </section>
        </div>
      ) : null}
    </>
  );
}
