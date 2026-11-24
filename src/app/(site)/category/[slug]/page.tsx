import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/product/listing";
import { PageHeader } from "@/components/ui/card";
import { getCategoryBySlug } from "@/lib/data/categories";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: "Category", robots: { index: false, follow: true } };
  const categoryDescription = category.description?.trim();
  const description = categoryDescription && categoryDescription.length >= 70
    ? categoryDescription.slice(0, 160)
    : `Browse ${category.name.toLowerCase()} listed by students at Abia State University, Uturu. Compare available items and contact sellers on ABSU Trade.`;
  return {
    title: `${category.name} for sale at ABSU`,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title: `${category.name} at ABSU Trade`, description, type: "website" },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <PageHeader title={category.name} description={category.description ?? undefined} />
      <Listing basePath={`/category/${category.slug}`} searchParams={await searchParams} lockedCategoryId={category.id} />
    </>
  );
}
