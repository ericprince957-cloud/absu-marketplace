"use client";

import { useFormStatus } from "react-dom";
import { buttonStyles } from "@/components/ui/button";

/** Submit button that asks "Are you sure?" first. Use inside a <form action={...}>. */
export function ConfirmButton({
  message,
  children,
  variant = "danger",
}: {
  message: string;
  children: React.ReactNode;
  variant?: "danger" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={buttonStyles({ variant, size: "sm" })}
    >
      {pending ? "Working..." : children}
    </button>
  );
}
