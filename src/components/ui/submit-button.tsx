"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { buttonStyles } from "@/components/ui/button";

type Props = Omit<ComponentProps<"button">, "type"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  pendingText?: string;
};

/** Submit button that disables itself and shows a spinner while its form action runs. */
export function SubmitButton({ children, variant, size, className, pendingText, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-disabled={pending}
      className={buttonStyles({ variant, size, className })}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
