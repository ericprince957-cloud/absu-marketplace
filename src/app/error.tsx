"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-stone-600">We hit an unexpected problem. Please try again.</p>
        {error.digest ? <p className="mt-1 text-xs text-stone-400">Reference: {error.digest}</p> : null}
        <Button onClick={reset} className="mt-6">Try again</Button>
      </div>
    </main>
  );
}
