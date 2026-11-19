"use client";

import Link from "next/link";
import { useActionState } from "react";
import { placeOrder } from "@/app/(site)/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function OrderForm({ productId, maxQuantity }: { productId: string; maxQuantity: number }) {
  const [state, action] = useActionState(placeOrder, initialState);

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="product_id" value={productId} />
      <FormMessage state={state} />
      {state.ok ? (
        <Link href="/dashboard/orders" className="inline-block text-sm font-semibold text-brand-700 hover:underline">
          View my orders
        </Link>
      ) : null}
      <TextField label="Quantity" name="quantity" type="number" min={1} max={maxQuantity} defaultValue={1} required error={state.fieldErrors?.quantity} />
      <TextAreaField label="Note to seller (optional)" name="note" rows={3} placeholder="Preferred meeting spot, time, questions..." error={state.fieldErrors?.note} className="min-h-20" />
      <SubmitButton size="lg" className="w-full" pendingText="Placing order...">
        Place order
      </SubmitButton>
      <p className="text-xs text-stone-500">
        You pay the seller directly when you meet. ABSU Marketplace does not take payment for items.
      </p>
    </form>
  );
}
