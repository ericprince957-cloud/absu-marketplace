import { Alert } from "@/components/ui/feedback";
import type { ActionState } from "@/lib/action-state";

/** Shows the result of a server action: an error banner or a success message. */
export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) return <Alert tone="error">{state.error}</Alert>;
  if (state.ok && state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}
