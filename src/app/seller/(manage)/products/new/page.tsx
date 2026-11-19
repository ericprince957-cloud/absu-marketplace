import type { Metadata } from "next";
import { ProductForm } from "@/components/dashboard/product-form";
import { MembershipRequired } from "@/components/membership/membership-required";
import { Card, PageHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { getMembership, requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const user = await requireUser("/seller/products/new");
  const [membership, categories] = await Promise.all([getMembership(user.id), listCategories()]);

  return (
    <>
      <PageHeader title="Add a product" description="Good photos and an honest description sell faster." />
      {!membership.hasAccess ? (
        <MembershipRequired action="list products" />
      ) : categories.length === 0 ? (
        <Alert tone="warning" title="No categories yet">An administrator needs to create categories before products can be listed.</Alert>
      ) : (
        <Card>
          <ProductForm userId={user.id} categories={categories} />
        </Card>
      )}
    </>
  );
}
