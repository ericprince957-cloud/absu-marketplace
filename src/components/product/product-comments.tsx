"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { addProductComment, deleteProductComment } from "@/app/(site)/actions";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextAreaField } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { initialState } from "@/lib/action-state";
import { formatDate } from "@/lib/utils";
import type { ProductComment } from "@/types";

type Props = {
  productId: string;
  comments: ProductComment[];
  currentUserId: string | null;
  canComment: boolean;
  isAdmin: boolean;
  loginHref: string;
};

export function ProductComments({
  productId,
  comments,
  currentUserId,
  canComment,
  isAdmin,
  loginHref,
}: Props) {
  const router = useRouter();
  const [state, action] = useActionState(async (previous: typeof initialState, formData: FormData) => {
    const result = await addProductComment(previous, formData);
    if (result.ok) router.refresh();
    return result;
  }, initialState);

  return (
    <section id="comments" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Campus conversation</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-stone-950">
            <MessageSquare className="size-5 text-brand-700" aria-hidden />
            Comments <span className="text-sm font-semibold text-stone-500">({comments.length})</span>
          </h2>
        </div>
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        {comments.length ? (
          <ul className="divide-y divide-stone-100">
            {comments.map((comment) => (
              <li key={comment.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{comment.author_name}</p>
                    <time className="mt-0.5 block text-[11px] text-stone-500" dateTime={comment.created_at}>
                      {formatDate(comment.created_at)}
                    </time>
                  </div>
                  {currentUserId && (currentUserId === comment.author_id || isAdmin) ? (
                    <form action={async (formData: FormData) => {
                      await deleteProductComment(formData);
                      router.refresh();
                    }}>
                      <input type="hidden" name="comment_id" value={comment.id} />
                      <input type="hidden" name="product_id" value={productId} />
                      <button
                        type="submit"
                        aria-label="Delete comment"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </form>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{comment.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl bg-stone-50 px-4 py-6 text-center">
            <MessageSquare className="mx-auto size-6 text-stone-400" aria-hidden />
            <p className="mt-2 text-sm font-medium text-stone-800">No comments yet</p>
            <p className="mt-1 text-xs text-stone-500">Start the conversation with a question or helpful detail.</p>
          </div>
        )}

        <div className="border-t border-stone-100 pt-4">
          {currentUserId && canComment ? (
            <form action={action} className="space-y-3">
              <input type="hidden" name="product_id" value={productId} />
              <TextAreaField
                label="Leave a comment"
                name="body"
                rows={3}
                maxLength={1000}
                placeholder="Ask a question or share useful information..."
                hint="Keep it respectful. Maximum 1,000 characters."
                required
              />
              <FormMessage state={state} />
              <div className="flex justify-end">
                <SubmitButton size="md" pendingText="Posting comment...">Post comment</SubmitButton>
              </div>
            </form>
          ) : currentUserId ? (
            <p className="text-sm text-stone-600">
              Please verify your email before commenting.{" "}
              <Link href="/verify-email" className="font-semibold text-brand-700 underline underline-offset-2">Verify email</Link>
            </p>
          ) : (
            <p className="text-sm text-stone-600">
              <Link href={loginHref} className="font-semibold text-brand-700 underline underline-offset-2">Log in</Link> to leave a comment.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
