import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";

export function MembershipRequired({ action = "do this" }: { action?: string }) {
  return (
    <Alert tone="warning" title="Active membership needed">
      <p>Your membership is not active, so you cannot {action}. Renew it to continue.</p>
      <LinkButton href="/dashboard/membership" size="sm" className="mt-3">Go to membership</LinkButton>
    </Alert>
  );
}
