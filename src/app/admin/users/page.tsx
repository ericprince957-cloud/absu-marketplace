import type { Metadata } from "next";
import { Search } from "lucide-react";
import { extendMembership, setUserSuspended } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { filterControl } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/server";
import { first, formatDate, pageNumber, sanitizeSearch } from "@/lib/utils";
import type { MembershipEntitlement, Profile, Role } from "@/types";

export const metadata: Metadata = { title: "Users" };

const SIZE = 25;

type Row = Profile & {
  user_roles: { role: Role }[] | null;
  membership_entitlements: MembershipEntitlement | MembershipEntitlement[] | null;
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = sanitizeSearch(first(sp.q));
  const page = pageNumber(sp.page);

  const supabase = await createClient();
  let req = supabase
    .from("profiles")
    .select("*, user_roles(role), membership_entitlements(kind,status,paid_until,free_slot_number)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (q) req = req.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count, error } = await req.range((page - 1) * SIZE, page * SIZE - 1);
  if (error) console.error("[admin] users failed:", error.message);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <PageHeader title="Users" description="Search students, suspend accounts and grant membership time." />
      <form method="get" role="search" className="mb-5 flex max-w-md gap-2">
        <label htmlFor="uq" className="sr-only">Search users</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
          <input id="uq" name="q" defaultValue={q} placeholder="Name, email or phone" className={`${filterControl} pl-9`} />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Roles</Th>
                <Th>Membership</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const m = Array.isArray(u.membership_entitlements) ? u.membership_entitlements[0] : u.membership_entitlements;
                return (
                  <tr key={u.id}>
                    <Td>
                      <p className="font-medium">{u.full_name ?? "-"}</p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                      {u.is_suspended ? <Badge tone="red">suspended</Badge> : null}
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
                        <form action={setUserSuspended}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="suspended" value={u.is_suspended ? "false" : "true"} />
                          <ConfirmButton variant={u.is_suspended ? "outline" : "danger"} message={u.is_suspended ? "Reinstate this user?" : "Suspend this user? They will be unable to log in."}>
                            {u.is_suspended ? "Reinstate" : "Suspend"}
                          </ConfirmButton>
                        </form>
                        {m?.kind !== "free_lifetime" ? (
                          <form action={extendMembership}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="days" value="30" />
                            <ConfirmButton variant="outline" message="Grant 30 days of membership to this user?">+30 days</ConfirmButton>
                          </form>
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
