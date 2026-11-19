import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-brand-700">404</p>
        <h1 className="mt-3 text-2xl font-bold">We could not find that page</h1>
        <p className="mt-2 text-stone-600">It may have been moved, removed, or you may not have access.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className={buttonStyles()}>Go home</Link>
          <Link href="/marketplace" className={buttonStyles({ variant: "outline" })}>Browse marketplace</Link>
        </div>
      </div>
    </main>
  );
}
