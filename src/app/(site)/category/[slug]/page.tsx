import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/product/listing";
import { PageHeader } from "@/components/ui/card";
import { getCategoryBySlug } from "@/lib/data/categories";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.name, description: category.description ?? undefined } : { title: "Category" };
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
