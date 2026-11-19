import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card, PageHeader } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");
  const profile = await getProfile(user.id);

  return (
    <>
      <PageHeader title="Profile" description="Keep your details up to date so buyers and sellers can reach you." />
      <Card>
        <ProfileForm profile={profile} email={user.email ?? ""} />
      </Card>
    </>
  );
}
