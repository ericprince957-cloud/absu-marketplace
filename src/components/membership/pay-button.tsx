"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { formatNaira } from "@/lib/utils";
import { membership } from "@/config/site";

/**
 * Starts checkout. The browser asks OUR server to create the Paystack payment;
 * the price is never sent from here, so it cannot be tampered with.
 */
export function PayButton({ label }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paystack/initialize", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = (await res.json().catch(() => ({}))) as { authorization_url?: string; error?: string };

      if (!res.ok || !data.authorization_url) {
        setError(data.error ?? "Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      // Only ever follow a Paystack checkout address.
      const url = new URL(data.authorization_url);
      if (url.protocol !== "https:" || !url.hostname.endsWith("paystack.com")) {
        setError("Received an unexpected payment address. Payment cancelled for your safety.");
        setLoading(false);
        return;
      }
      window.location.assign(url.toString());
    } catch {
      setError("Network problem. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <button type="button" onClick={startPayment} disabled={loading} className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
        {loading ? "Opening secure checkout..." : (label ?? `Pay ${formatNaira(membership.priceNaira)} with Paystack`)}
      </button>
      <p className="text-xs text-stone-500">Secure payment by Paystack. We never see or store your card details.</p>
    </div>
  );
}
