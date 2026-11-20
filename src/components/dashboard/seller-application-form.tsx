"use client";

import { useActionState } from "react";
import { submitSellerApplication } from "@/app/seller/actions";
import { initialState } from "@/lib/action-state";
import { TextAreaField, TextField, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function SellerApplicationForm({ defaultPhone, defaultFullName }: { defaultPhone?: string | null; defaultFullName?: string | null }) {
  const [state, action] = useActionState(submitSellerApplication, initialState);
  const fe = state.fieldErrors;

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data" noValidate>
      <div className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-3 text-sm leading-6 text-stone-700">
        <strong className="block text-stone-950">Student verification is required</strong>
        Submit your ABSU details and a clear student ID card or current school portal registration slip. An admin will review the evidence before seller access is granted.
      </div>
      <FormMessage state={state} />
      <TextField label="Full name as shown on your school record" name="full_name" required defaultValue={defaultFullName ?? ""} placeholder="Your registered name" />
      <TextField label="ABSU matriculation number" name="matric_number" required error={fe?.matric_number} placeholder="e.g. 2023/123456" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Faculty" name="faculty" required error={fe?.faculty} placeholder="Your faculty" />
        <TextField label="Department" name="department" required error={fe?.department} placeholder="Your department" />
      </div>
      <SelectField label="Current level" name="level" required error={fe?.level} defaultValue="">
        <option value="" disabled>Select level</option>
        {["100", "200", "300", "400", "500", "600", "Other"].map((level) => <option key={level} value={level}>{level === "Other" ? "Other" : `${level} Level`}</option>)}
      </SelectField>
      <TextField label="Shop or business name" name="business_name" required error={fe?.business_name} placeholder="e.g. Chioma's Thrift" />
      <TextAreaField label="What will you sell?" name="description" rows={4} required error={fe?.description} hint="Tell us what you plan to list and where students can meet you." />
      <TextField label="Main categories (optional)" name="categories_text" error={fe?.categories_text} placeholder="Fashion, Phones, Books" />
      <TextField label="Phone / WhatsApp" name="phone" type="tel" defaultValue={defaultPhone ?? ""} required error={fe?.phone} />
      <div className="space-y-1.5">
        <label htmlFor="student_id_document" className="block text-sm font-medium text-stone-800">Student ID card or current portal slip <span className="text-red-600">*</span></label>
        <input id="student_id_document" name="student_id_document" type="file" required accept="image/jpeg,image/png,application/pdf" className="block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-semibold" />
        <p className="text-xs text-stone-500">JPG, PNG or PDF. Maximum 5 MB. Upload a clear document showing your name and current ABSU student details. Your document is private and only visible to you and authorised marketplace admins.</p>
      </div>
      <label className="flex items-start gap-2 text-xs leading-5 text-stone-600">
        <input type="checkbox" name="verification_consent" value="on" required className="mt-1 size-4 accent-[#D4AF37]" />
        <span>I confirm these details are accurate and consent to ABSU Marketplace reviewing this document only for student/seller verification.</span>
      </label>
      <SubmitButton size="lg" pendingText="Submitting for verification...">Submit for verification</SubmitButton>
    </form>
  );
}
