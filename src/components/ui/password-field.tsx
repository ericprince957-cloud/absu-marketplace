"use client";

import { useState, type ComponentProps } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  label: string;
  name: string;
  error?: string[] | string;
  hint?: string;
} & Omit<ComponentProps<"input">, "name" | "type">;

export function PasswordField({
  label,
  name,
  error,
  hint,
  className,
  required,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const message = Array.isArray(error) ? error[0] : error;

  async function copyPassword() {
    const input = document.getElementById(name) as HTMLInputElement | null;
    if (!input?.value) return;

    try {
      await navigator.clipboard.writeText(input.value);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2200);
    }
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-stone-800">
        {label}
        {required ? <span className="text-red-600" aria-hidden> *</span> : null}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={cn(
            "block h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 pr-24 text-base text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 disabled:bg-stone-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20",
            className,
          )}
          {...props}
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            aria-label={visible ? "Hide password" : "Show password"}
            title={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
          <button
            type="button"
            onClick={copyPassword}
            disabled={Boolean(props.disabled)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copied ? "Password copied" : "Copy password"}
            title={copyError ? "Clipboard access unavailable" : copied ? "Copied" : "Copy password"}
          >
            {copied ? <Check size={17} aria-hidden /> : <Copy size={16} aria-hidden />}
          </button>
        </div>
      </div>
      {hint && !message ? <p id={`${name}-hint`} className="text-xs text-stone-500">{hint}</p> : null}
      {message ? <p id={`${name}-error`} role="alert" className="text-xs font-medium text-red-600">{message}</p> : null}
      {copyError ? <p role="status" className="text-xs text-red-600">Could not copy. Check your browser clipboard permissions.</p> : null}
    </div>
  );
}
