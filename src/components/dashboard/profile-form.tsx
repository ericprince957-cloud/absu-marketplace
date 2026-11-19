"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/dashboard/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [state, action] = useActionState(updateProfile, initialState);
  const fe = state.fieldErrors;

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="full_name" defaultValue={profile?.full_name ?? ""} required error={fe?.full_name} />
        <TextField label="Username (optional)" name="username" defaultValue={profile?.username ?? ""} error={fe?.username} hint="Letters, numbers and underscore." />
        <div className="space-y-1.5">
          <label htmlFor="email-ro" className="block text-sm font-medium text-stone-800">Email</label>
          <input id="email-ro" value={email} readOnly className="h-11 w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 text-[15px] text-stone-600" />
          <p className="text-xs text-stone-500">Your login email cannot be changed here.</p>
        </div>
        <TextField label="Phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} placeholder="08012345678" error={fe?.phone} />
        <TextField label="WhatsApp number" name="whatsapp" type="tel" defaultValue={profile?.whatsapp ?? ""} placeholder="08012345678" error={fe?.whatsapp} hint="Shown only to active members who view your listings." />
        <TextField label="Faculty" name="faculty" defaultValue={profile?.faculty ?? ""} error={fe?.faculty} />
        <TextField label="Department" name="department" defaultValue={profile?.department ?? ""} error={fe?.department} />
        <TextField label="Level" name="level" defaultValue={profile?.level ?? ""} placeholder="e.g. 200" error={fe?.level} />
        <TextField label="Hostel / location" name="hostel" defaultValue={profile?.hostel ?? ""} error={fe?.hostel} />
      </div>
      <TextAreaField label="About you (optional)" name="bio" defaultValue={profile?.bio ?? ""} rows={3} error={fe?.bio} hint="Up to 300 characters. Shown on your listings." />
      <SubmitButton size="lg" pendingText="Saving...">Save profile</SubmitButton>
    </form>
  );
}
