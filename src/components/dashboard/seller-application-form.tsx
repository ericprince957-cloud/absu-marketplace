"use client";

import { useActionState } from "react";
import { submitSellerApplication } from "@/app/seller/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function SellerApplicationForm({ defaultPhone, defaultFullName }: { defaultPhone?: string | null; defaultFullName?: string | null }) {
  const [state, action] = useActionState(submitSellerApplication, initialState);
  const fe = state.fieldErrors;

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-700">
        <strong className="block text-stone-950">A few details before you start</strong>
        ABSU students and people living or doing business around Uturu can apply. We only ask for basic contact and pickup details so buyers and our team can identify a seller if there is a problem. No matric number or student ID is required.
      </div>
      <FormMessage state={state} />
      <TextField label="Your full name" name="full_name" defaultValue={defaultFullName ?? ""} required placeholder="Your real name" hint="Use a name buyers or our team can identify if there is a problem." />
      <TextField label="Shop or business name" name="business_name" required error={fe?.business_name} placeholder="e.g. Chioma's Thrift" />
      <TextAreaField label="What will you sell?" name="description" rows={3} required error={fe?.description} hint="Briefly describe your products or services." />
      <TextField label="Main category (optional)" name="categories_text" error={fe?.categories_text} placeholder="Fashion, food, gadgets, services..." />
      <TextField label="Phone / WhatsApp number" name="phone" type="tel" defaultValue={defaultPhone ?? ""} required error={fe?.phone} placeholder="08012345678" />
      <TextField label="Where can buyers find or meet you?" name="location" required error={fe?.location} placeholder="Hostel, lodge, street or area in Uturu" hint="Do not enter your private home address. A public pickup point or general area is enough." />
      <SubmitButton size="lg" pendingText="Submitting...">Submit seller application</SubmitButton>
    </form>
  );
}
