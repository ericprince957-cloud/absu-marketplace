"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, login, register, resetPassword } from "@/app/(auth)/actions";
import { initialState } from "@/lib/action-state";
import { TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, initialState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <div className="text-right">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
          Forgot password?
        </Link>
      </div>
      <SubmitButton size="lg" className="w-full" pendingText="Logging in...">
        Log in
      </SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, initialState);
  const fe = state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <TextField label="Full name" name="full_name" autoComplete="name" required error={fe?.full_name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={fe?.email} hint="We will send an email confirmation link here." />
      <TextField label="Phone / WhatsApp (optional)" name="phone" type="tel" autoComplete="tel" placeholder="08012345678" error={fe?.phone} />
      <TextField label="Password" name="password" type="password" autoComplete="new-password" required error={fe?.password} hint="At least 8 characters with a letter and a number." />
      <TextField label="Confirm password" name="confirm_password" type="password" autoComplete="new-password" required error={fe?.confirm_password} />
      <SubmitButton size="lg" className="w-full" pendingText="Creating account...">
        Create account
      </SubmitButton>
      <p className="text-center text-xs text-stone-500">
        By creating an account you agree to use the marketplace honestly and respect other students.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, initialState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <SubmitButton size="lg" className="w-full" pendingText="Sending...">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, initialState);
  const fe = state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <TextField label="New password" name="password" type="password" autoComplete="new-password" required error={fe?.password} hint="At least 8 characters with a letter and a number." />
      <TextField label="Confirm new password" name="confirm_password" type="password" autoComplete="new-password" required error={fe?.confirm_password} />
      <SubmitButton size="lg" className="w-full" pendingText="Saving...">
        Update password
      </SubmitButton>
    </form>
  );
}
