"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/(site)/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialState);
  const fe = state.fieldErrors;

  if (state.ok) return <FormMessage state={state} />;

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" required error={fe?.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" required error={fe?.email} />
      </div>
      <TextField label="Subject" name="subject" required error={fe?.subject} />
      <TextAreaField label="Message" name="message" rows={6} required error={fe?.message} />
      <SubmitButton size="lg" pendingText="Sending...">Send message</SubmitButton>
    </form>
  );
}
