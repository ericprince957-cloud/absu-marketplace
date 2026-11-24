import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { grantFreeSlot, setUserSuspended, verifyUserAndNotify } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { Alert, Badge, EmptyState } from "@/components/ui/feedback";
import { filterControl } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { first, formatDate, pageNumber, sanitizeSearch } from "@/lib/utils";
import type { MembershipEntitlement, Profile, Role } from "@/types";

export const metadata: Metadata = { title: "Users" };

const SIZE = 25;

type Row = Profile & {
  user_roles: { role: Role }[] | null;
  membership_entitlements: MembershipEntitlement | MembershipEntitlement[] | null;
  seller_applications: { status: string }[] | null;
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = sanitizeSearch(first(sp.q));
  const page = pageNumber(sp.page);

  const supabase = await createClient();
  let req = supabase
    .from("profiles")
    .select("*, user_roles(role), membership_entitlements(kind,status,paid_until,free_slot_number), seller_applications!seller_applications_user_id_fkey(status)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (q) req = req.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count, error } = await req.range((page - 1) * SIZE, page * SIZE - 1);
  if (error) console.error("[admin] users failed:", error.message);
  const rows = (data ?? []) as unknown as Row[];
  const adminClient = createAdminClient();
  const authResults = await Promise.all(rows.map((u) => adminClient.auth.admin.getUserById(u.id)));
  const emailVerifiedById = new Map(rows.map((u, i) => [u.id, authResults[i].error ? null : Boolean(authResults[i].data.user?.email_confirmed_at)]));

  return (
    <>
      <PageHeader title="Users" description="Search users, review seller eligibility and manage free seller access." />
      <form method="get" role="search" className="mb-5 flex max-w-md gap-2">
        <label htmlFor="uq" className="sr-only">Search users</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
          <input id="uq" name="q" defaultValue={q} placeholder="Name, email or phone" className={`${filterControl} pl-9`} />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>

      {error ? (
        <Alert tone="error" title="Could not load users">The users query failed. Please refresh; if this continues, check the server logs. ({error.code})</Alert>
      ) : rows.length === 0 ? (
        <EmptyState title={q ? "No users match your search" : "No registered users found"} />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Email status</Th>
                <Th>Roles</Th>
                <Th>Membership</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const m = Array.isArray(u.membership_entitlements) ? u.membership_entitlements[0] : u.membership_entitlements;
                const isSeller = (u.user_roles ?? []).some((r) => r.role === "seller");
                const hasPendingApplication = (u.seller_applications ?? []).some((a) => a.status === "pending");
                return (
                  <tr key={u.id}>
                    <Td>
                      {isSeller ? <Link href={`/store/${u.id}`} className="font-medium text-brand-800 underline-offset-4 hover:underline">{u.full_name ?? "Seller profile"}</Link> : <p className="font-medium">{u.full_name ?? "-"}</p>}
                      <p className="text-xs text-stone-500">{u.email}</p>
                      {u.is_suspended ? <Badge tone="red">suspended</Badge> : null}
                    </Td>
                    <Td>
                      {emailVerifiedById.get(u.id) === true ? <Badge tone="green">verified</Badge> : emailVerifiedById.get(u.id) === false ? <Badge tone="amber">unverified</Badge> : <Badge tone="neutral">unknown</Badge>}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {(u.user_roles ?? []).map((r) => <Badge key={r.role} tone={r.role === "admin" ? "blue" : "neutral"}>{r.role}</Badge>)}
                      </div>
                    </Td>
                    <Td>
                      {!m ? <span className="text-stone-400">none</span> : m.kind === "free_lifetime" ? (
                        <Badge tone="green">free #{m.free_slot_number}</Badge>
                      ) : (
                        <span className="text-xs">{m.status} · until {formatDate(m.paid_until)}</span>
                      )}
                    </Td>
                    <Td>{formatDate(u.created_at)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        {emailVerifiedById.get(u.id) !== null ? (
                          <form action={verifyUserAndNotify}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <ConfirmButton variant="outline" message={emailVerifiedById.get(u.id) ? "Send this user another account verification confirmation email?" : "Mark this user's email as verified and send the confirmation email?"}>
                              {emailVerifiedById.get(u.id) ? "Resend verified email" : "Verify & email"}
                            </ConfirmButton>
                          </form>
                        ) : null}
                        <form action={setUserSuspended}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="suspended" value={u.is_suspended ? "false" : "true"} />
                          <ConfirmButton variant={u.is_suspended ? "outline" : "danger"} message={u.is_suspended ? "Reinstate this user?" : "Suspend this user? They will be unable to log in."}>
                            {u.is_suspended ? "Reinstate" : "Suspend"}
                          </ConfirmButton>
                        </form>
                        {!m && isSeller ? (
                          <form action={grantFreeSlot}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <ConfirmButton variant="outline" message="Grant this approved seller one of the remaining lifetime-free slots?">Give free slot</ConfirmButton>
                          </form>
                        ) : null}
                        {hasPendingApplication ? (
                          <Link href="/admin/sellers" className="inline-flex items-center rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium hover:bg-stone-50">Review application</Link>
                        ) : null}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
          <Pagination page={page} pageSize={SIZE} total={count ?? 0} basePath="/admin/users" params={{ q: q || undefined }} />
        </>
      )}
    </>
  );
}
