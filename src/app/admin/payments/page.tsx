import type { Metadata } from "next";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatNaira, koboToNaira, pageNumber } from "@/lib/utils";
import type { Payment } from "@/types";

export const metadata: Metadata = { title: "Payments" };
const SIZE = 25;

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = pageNumber((await searchParams).page);
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("payments")
    .select("id,user_id,reference,amount_kobo,currency,status,paid_at,created_at, profiles:profiles!payments_user_id_fkey(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (error) console.error("[admin] payments failed:", error.message);
  const payments = (data ?? []) as unknown as Payment[];

  return (
    <>
      <PageHeader title="Payments" description="Membership payments recorded from Paystack. Payments that fail verification show as failed and need manual review." />
      {payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Payments appear here as soon as a member starts checkout." />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Member</Th>
                <Th>Reference</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <Td>{formatDateTime(p.paid_at ?? p.created_at)}</Td>
                  <Td>{p.profiles?.full_name ?? "-"}</Td>
                  <Td className="font-mono text-xs">{p.reference}</Td>
                  <Td>{formatNaira(koboToNaira(p.amount_kobo))}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination page={page} pageSize={SIZE} total={count ?? 0} basePath="/admin/payments" />
        </>
      )}
    </>
  );
}
