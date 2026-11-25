"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { addProductComment, addProductCommentReply, deleteProductComment } from "@/app/(site)/actions";
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
  isSeller: boolean;
  loginHref: string;
};

export function ProductComments({
  productId,
  comments,
  currentUserId,
  canComment,
  isAdmin,
  isSeller,
  loginHref,
}: Props) {
  const router = useRouter();
  const [state, action] = useActionState(async (previous: typeof initialState, formData: FormData) => {
    const result = await addProductComment(previous, formData);
    if (result.ok) router.refresh();
    return result;
  }, initialState);
  const [replyState, replyAction] = useActionState(async (previous: typeof initialState, formData: FormData) => {
    const result = await addProductCommentReply(previous, formData);
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
                {comment.replies?.[0] ? (
                  <div className="ml-3 mt-3 rounded-xl border-l-2 border-brand-600 bg-brand-50/70 px-3 py-3 sm:ml-5">
                    <p className="text-xs font-bold text-brand-900">
                      {comment.replies[0].seller_name}
                      <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">Seller</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{comment.replies[0].body}</p>
                    <time className="mt-1 block text-[10px] text-stone-500" dateTime={comment.replies[0].created_at}>
                      {formatDate(comment.replies[0].created_at)}
                    </time>
                  </div>
                ) : isSeller ? (
                  <form action={replyAction} className="ml-3 mt-3 space-y-2 border-l-2 border-stone-200 pl-3 sm:ml-5">
                    <input type="hidden" name="comment_id" value={comment.id} />
                    <input type="hidden" name="product_id" value={productId} />
                    <label htmlFor={`reply-${comment.id}`} className="block text-xs font-semibold text-brand-900">Reply as the seller</label>
                    <textarea
                      id={`reply-${comment.id}`}
                      name="body"
                      rows={2}
                      maxLength={1000}
                      required
                      placeholder="Answer the buyer's question..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    />
                    <FormMessage state={replyState} />
                    <div className="flex justify-end">
                      <SubmitButton size="sm" pendingText="Sending...">Reply</SubmitButton>
                    </div>
                  </form>
                ) : null}
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
