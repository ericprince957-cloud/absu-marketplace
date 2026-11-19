import type { Metadata } from "next";
import { Listing } from "@/components/product/listing";
import { PageHeader } from "@/components/ui/card";
import { first } from "@/lib/utils";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = first(sp.q)?.slice(0, 80);
  return (
    <>
      <PageHeader title={q ? `Search: ${q}` : "Search"} description="Find what you need from students on campus." />
      <Listing basePath="/search" searchParams={sp} />
    </>
  );
}
