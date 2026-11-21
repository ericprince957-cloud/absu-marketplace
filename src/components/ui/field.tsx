import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlStyles =
  "block w-full rounded-xl border border-stone-300 bg-white px-3.5 text-base text-stone-900 shadow-sm " +
  "placeholder:text-stone-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 " +
  "disabled:bg-stone-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20";

interface FieldShellProps {
  label: string;
  name: string;
  error?: string[] | string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ label, name, error, hint, required, children }: FieldShellProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-stone-800">
        {label}
        {required ? <span className="text-red-600" aria-hidden> *</span> : null}
      </label>
      {children}
      {hint && !message ? (
        <p id={`${name}-hint`} className="text-xs text-stone-500">
          {hint}
        </p>
      ) : null}
      {message ? (
        <p id={`${name}-error`} role="alert" className="text-xs font-medium text-red-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

type CommonProps = { label: string; name: string; error?: string[] | string; hint?: string };

export function TextField({
  label,
  name,
  error,
  hint,
  className,
  required,
  ...props
}: CommonProps & Omit<ComponentProps<"input">, "name">) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={cn(controlStyles, "h-11", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  hint,
  className,
  required,
  ...props
}: CommonProps & Omit<ComponentProps<"textarea">, "name">) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required}>
      <textarea
        id={name}
        name={name}
        required={required}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={cn(controlStyles, "min-h-28 py-2.5", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  className,
  required,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<"select">, "name">) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={cn(controlStyles, "h-11 pr-8", className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** Compact inputs for filter bars (no label wrapper). */
export const filterControl = cn(controlStyles, "h-11");
