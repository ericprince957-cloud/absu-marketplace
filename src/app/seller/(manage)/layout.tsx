import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getRoles, requireUser } from "@/lib/auth";

/** Everything inside (manage) needs the seller role. Applicants are sent to the application page. */
export default async function ManageLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/seller");
  const roles = await getRoles(user.id);
  if (!roles.includes("seller")) redirect("/seller/apply");
  return <>{children}</>;
}
