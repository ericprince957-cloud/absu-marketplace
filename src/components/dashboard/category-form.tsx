"use client";

import { useActionState } from "react";
import { createCategory } from "@/app/admin/actions";
import { initialState } from "@/lib/action-state";
import { TextField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function CategoryForm() {
  const [state, action] = useActionState(createCategory, initialState);
  const fe = state.fieldErrors;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <TextField label="Name" name="name" required error={fe?.name} placeholder="Textbooks" />
      <TextField label="Slug" name="slug" required error={fe?.slug} placeholder="textbooks" hint="Used in the URL: /category/textbooks" />
      <TextField label="Description (optional)" name="description" error={fe?.description} />
      <TextField label="Sort order" name="sort_order" type="number" min={0} defaultValue={0} error={fe?.sort_order} />
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Creating...">Add category</SubmitButton>
      </div>
    </form>
  );
}
