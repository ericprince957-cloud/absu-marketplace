import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { MembershipRequired } from "@/components/membership/membership-required";
import { Card, PageHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { getMembership, requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/data/categories";
import { getProduct } from "@/lib/data/products";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/seller/products/${id}/edit`);

  const product = await getProduct(id);
  if (!product || product.seller_id !== user.id) notFound();

  const [membership, categories] = await Promise.all([getMembership(user.id), listCategories()]);

  return (
    <>
      <PageHeader title="Edit product" description="Saving sends the listing back for a quick review before it shows publicly again." />
      {product.status === "rejected" ? (
        <Alert tone="error" title="This listing was rejected" className="mb-5">
          {product.moderation_note ?? "Please review the details and resubmit."}
        </Alert>
      ) : null}
      {!membership.hasAccess ? (
        <MembershipRequired action="edit products" />
      ) : (
        <Card>
          <ProductForm userId={user.id} categories={categories} product={product} />
        </Card>
      )}
    </>
  );
}
