"use client";

import { useActionState } from "react";
import { submitSellerApplication } from "@/app/seller/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function SellerApplicationForm({ defaultPhone }: { defaultPhone?: string | null }) {
  const [state, action] = useActionState(submitSellerApplication, initialState);
  const fe = state.fieldErrors;

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <TextField label="Shop or business name" name="business_name" required error={fe?.business_name} placeholder="e.g. Chioma's Thrift" />
      <TextAreaField label="What will you sell?" name="description" rows={5} required error={fe?.description} hint="Tell us what you plan to list and where students can meet you." />
      <TextField label="Main categories (optional)" name="categories_text" error={fe?.categories_text} placeholder="Fashion, Phones, Books" />
      <TextField label="Phone / WhatsApp" name="phone" type="tel" defaultValue={defaultPhone ?? ""} required error={fe?.phone} />
      <SubmitButton size="lg" pendingText="Submitting...">Submit application</SubmitButton>
    </form>
  );
}
