import type { Metadata } from "next";
import { Listing } from "@/components/product/listing";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse products listed by ABSU students: textbooks, gadgets, fashion, food and more.",
};

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <PageHeader title="Marketplace" description="Everything students at ABSU are selling right now." />
      <Listing basePath="/marketplace" searchParams={await searchParams} />
    </>
  );
}
