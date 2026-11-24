"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MessageCircle } from "lucide-react";
import { placeOrder } from "@/app/(site)/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { buttonStyles } from "@/components/ui/button";

export function OrderForm({ productId, maxQuantity }: { productId: string; maxQuantity: number }) {
  const [state, action] = useActionState(placeOrder, initialState);

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="product_id" value={productId} />
      <FormMessage state={state} />
      <TextField label="Quantity" name="quantity" type="number" min={1} max={maxQuantity} defaultValue={1} required error={state.fieldErrors?.quantity} />
      <TextField label="Delivery / pickup address" name="delivery_address" placeholder="Hostel, room, street, landmark or campus pickup point" required error={state.fieldErrors?.delivery_address} />
      <TextAreaField label="Note to seller (optional)" name="note" rows={3} placeholder="Preferred meeting spot, time, questions..." error={state.fieldErrors?.note} className="min-h-20" />
      {state.ok ? (
        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-semibold text-emerald-900">Your order is now in ABSU Trade.</p>
          <Link href="/dashboard/orders" className="inline-block text-sm font-semibold text-brand-700 hover:underline">View and track my order</Link>
          {state.whatsappUrl ? (
            <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "primary", className: "w-full" })}>
              <MessageCircle className="size-4" aria-hidden /> Send order details on WhatsApp
            </a>
          ) : (
            <p className="text-xs text-emerald-800">The seller has been notified in ABSU Trade. This seller has no WhatsApp number listed, so continue in your orders inbox.</p>
          )}
        </div>
      ) : (
        <SubmitButton size="lg" className="w-full" pendingText="Sending order...">Send order</SubmitButton>
      )}
      <p className="text-xs text-stone-500">
        Your order is saved on ABSU Trade and appears in the seller&apos;s Orders page. WhatsApp is an optional way to follow up. Pay the seller directly when you meet.
      </p>
    </form>
  );
}
