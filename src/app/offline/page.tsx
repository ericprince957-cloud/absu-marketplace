import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-12">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"><WifiOff className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-bold">You’re offline</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">ABSU Marketplace needs an internet connection to load live listings and account information. Reconnect and try again.</p>
        <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-black">Try again</Link>
      </div>
    </main>
  );
}
