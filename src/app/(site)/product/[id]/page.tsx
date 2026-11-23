import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, MapPin, ShieldCheck, Store } from "lucide-react";
import { OrderForm } from "@/components/product/order-form";
import { conditionLabel } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { SaveButton } from "@/components/product/save-button";
import { SellerContact } from "@/components/product/seller-contact";
import { ReportSeller } from "@/components/product/report-seller";
import { RecentlyViewed } from "@/components/layout/recently-viewed";
import { Card } from "@/components/ui/card";
import { Alert, Badge } from "@/components/ui/feedback";
import { LinkButton } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { getProduct, getSavedProductIds, getSellerPublic } from "@/lib/data/products";
import { formatDate, formatNaira, initials, publicImageUrl } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return { title: "Product not found" };
  const image = publicImageUrl(product.product_images?.[0]?.path);
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: { title: product.title, description: product.description.slice(0, 155), images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [user, seller] = await Promise.all([getUser(), getSellerPublic(product.seller_id)]);
  const saved = user ? (await getSavedProductIds(user.id, [product.id])).has(product.id) : false;

  // Count a genuine product detail visit; the database excludes the seller and fires milestones.
  if (product.status === "approved" && product.quantity > 0) {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { error: viewError } = await supabase.rpc("record_product_view", { p_product_id: product.id });
    if (viewError) console.error("[product] record view failed:", viewError.message);
  }

  const isOwner = user?.id === product.seller_id;
  const isLive = product.status === "approved" && product.quantity > 0;
  const images = (product.product_images ?? [])
    .map((i) => ({ id: i.id, url: publicImageUrl(i.path) }))
    .filter((i): i is { id: string; url: string } => Boolean(i.url));
  const cover = publicImageUrl(product.product_images?.[0]?.path);

  return (
    <div className="space-y-8 pb-24 lg:pb-6">
      <RecentlyViewed current={{ id: product.id, title: product.title, price: product.price, image: cover }} show={false} />
      <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium text-stone-500 sm:text-sm">
            <Link href="/marketplace" className="hover:text-brand-700">Marketplace</Link>
            {product.categories ? (
              <>
                {" / "}
                <Link href={`/category/${product.categories.slug}`} className="hover:text-brand-700">{product.categories.name}</Link>
              </>
            ) : null}
          </nav>
          <ProductGallery images={images} title={product.title} />

          <section className="mt-8 rounded-2xl bg-stone-50 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">About this listing</p>
            <h2 className="mt-2 text-xl font-bold text-stone-950">Product description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-700">{product.description}</p>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {product.status !== "approved" ? (
            <Alert tone="warning" title={`This listing is ${product.status}`}>
              Only you and administrators can see it. {product.moderation_note ? `Moderator note: ${product.moderation_note}` : ""}
            </Alert>
          ) : null}

          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Campus listing</p>
                <h1 className="mt-2 text-2xl font-extrabold leading-tight text-stone-950 sm:text-3xl">{product.title}</h1>
              </div>
              <SaveButton productId={product.id} saved={saved} signedIn={Boolean(user)} className="shrink-0 border border-stone-200" />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-950">{formatNaira(product.price)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="green">{conditionLabel(product.condition)}</Badge>
              <Badge tone={product.quantity > 0 ? "neutral" : "red"}>
                {product.quantity > 0 ? `${product.quantity} in stock` : "Sold out"}
              </Badge>
              {product.campus_area ? <Badge tone="neutral">{product.campus_area}</Badge> : null}
              {product.hostel_name ? <Badge tone="neutral">{product.hostel_name}</Badge> : null}
              {product.location ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
                  <MapPin className="size-3.5" aria-hidden /> {product.location}
                </span>
              ) : null}
            </div>
            {product.course_code ? <p className="mt-3 text-sm font-semibold text-brand-800">{product.course_code} · {product.academic_department} · {product.academic_level}</p> : null}
            <p className="mt-3 text-xs text-stone-500">Listed {formatDate(product.created_at)}</p>
          </div>

          <Card className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-stone-100 font-bold text-stone-800">
                {initials(seller?.display_name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-stone-950">{seller?.display_name ?? "ABSU student seller"}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-stone-500">
                  <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden />
                  Marketplace seller{seller ? ` · joined ${formatDate(seller.created_at)}` : ""}
                </p>
              </div>
              {seller ? <Link href={`/store/${seller.id}`} aria-label="View seller storefront" className="grid size-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-700 transition hover:bg-stone-200"><ArrowUpRight className="size-4" /></Link> : null}
            </div>
            {seller?.bio ? <p className="text-sm leading-6 text-stone-600">{seller.bio}</p> : null}
            {seller ? <Link href={`/store/${seller.id}`} className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-stone-800 hover:text-brand-700"><Store className="size-4" /> Visit seller storefront <ArrowUpRight className="size-3.5" /></Link> : null}
          </Card>

          <Card id="order" className="scroll-mt-20 space-y-4 p-4 sm:p-5">
            {isOwner ? (
              <>
                <p className="text-sm text-stone-700">This is your listing.</p>
                <LinkButton href={`/seller/products/${product.id}/edit`} variant="outline" className="w-full">Edit listing</LinkButton>
              </>
            ) : !isLive ? (
              <p className="text-sm text-stone-600">This product is not available to order right now.</p>
            ) : (
              <>
                <h2 className="font-semibold text-stone-950">Interested in this item?</h2>
                <p className="text-sm leading-6 text-stone-600">Buying is free. Contact the seller directly on WhatsApp to confirm availability, agree on pickup and pay the seller. No buyer subscription or account is required.</p>
                <SellerContact productId={product.id} productTitle={product.title} price={product.price} />
                {user ? (
                  <div className="border-t border-stone-100 pt-4">
                    <p className="mb-2 text-sm font-medium text-stone-700">Or send an order request from your account</p>
                    <OrderForm productId={product.id} maxQuantity={product.quantity} />
                  </div>
                ) : null}
              </>
            )}
          </Card>

          {!isOwner && user ? <ReportSeller sellerId={product.seller_id} productId={product.id} /> : null}

          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            Safety tip: meet in a public place on campus, inspect the item before paying, and never send money in advance.
          </p>
        </div>
      </div>
      {isLive && !isOwner ? (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3 pb-3">
            <div className="min-w-0">
              <p className="text-xs text-stone-500">Price</p>
              <p className="truncate font-sans text-xl font-bold leading-none text-brand-900">{formatNaira(product.price)}</p>
            </div>
            <a href="#order" className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand-900 px-6 font-semibold text-white transition active:scale-[0.98] active:bg-brand-950">
              Contact seller
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
