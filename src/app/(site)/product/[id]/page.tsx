import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Package, ShieldCheck } from "lucide-react";
import { OrderForm } from "@/components/product/order-form";
import { conditionLabel } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { SaveButton } from "@/components/product/save-button";
import { SellerContact } from "@/components/product/seller-contact";
import { Card } from "@/components/ui/card";
import { Alert, Badge } from "@/components/ui/feedback";
import { LinkButton } from "@/components/ui/button";
import { getMembership, getUser } from "@/lib/auth";
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
  const membership = user ? await getMembership(user.id) : null;
  const saved = user ? (await getSavedProductIds(user.id, [product.id])).has(product.id) : false;

  const isOwner = user?.id === product.seller_id;
  const isLive = product.status === "approved" && product.quantity > 0;
  const images = (product.product_images ?? [])
    .map((i) => ({ id: i.id, url: publicImageUrl(i.path) }))
    .filter((i): i is { id: string; url: string } => Boolean(i.url));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
          <Link href="/marketplace" className="hover:text-brand-700">Marketplace</Link>
          {product.categories ? (
            <>
              {" / "}
              <Link href={`/category/${product.categories.slug}`} className="hover:text-brand-700">{product.categories.name}</Link>
            </>
          ) : null}
        </nav>
        <ProductGallery images={images} title={product.title} />

        <section className="mt-8">
          <h2 className="text-lg font-bold">Description</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-stone-700">{product.description}</p>
        </section>
      </div>

      <div className="space-y-5">
        {product.status !== "approved" ? (
          <Alert tone="warning" title={`This listing is ${product.status}`}>
            Only you and administrators can see it. {product.moderation_note ? `Moderator note: ${product.moderation_note}` : ""}
          </Alert>
        ) : null}

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.title}</h1>
            <SaveButton productId={product.id} saved={saved} signedIn={Boolean(user)} className="shrink-0 border border-stone-200" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-brand-800">{formatNaira(product.price)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="green">{conditionLabel(product.condition)}</Badge>
            <Badge tone={product.quantity > 0 ? "neutral" : "red"}>
              {product.quantity > 0 ? `${product.quantity} in stock` : "Sold out"}
            </Badge>
            {product.location ? (
              <span className="inline-flex items-center gap-1 text-sm text-stone-600">
                <MapPin className="size-4" aria-hidden /> {product.location}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-stone-500">Listed {formatDate(product.created_at)}</p>
        </div>

        <Card className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-brand-100 font-semibold text-brand-800">
              {initials(seller?.display_name)}
            </span>
            <div>
              <p className="font-semibold text-stone-900">{seller?.display_name ?? "ABSU student"}</p>
              <p className="inline-flex items-center gap-1 text-xs text-stone-500">
                <ShieldCheck className="size-3.5 text-brand-600" aria-hidden />
                Verified ABSU seller{seller ? ` · joined ${formatDate(seller.created_at)}` : ""}
              </p>
            </div>
          </div>
          {seller?.bio ? <p className="text-sm text-stone-600">{seller.bio}</p> : null}
        </Card>

        <Card className="space-y-4 p-4 sm:p-5">
          {isOwner ? (
            <>
              <p className="text-sm text-stone-700">This is your listing.</p>
              <LinkButton href={`/seller/products/${product.id}/edit`} variant="outline" className="w-full">Edit listing</LinkButton>
            </>
          ) : !isLive ? (
            <p className="text-sm text-stone-600">This product is not available to order right now.</p>
          ) : !user ? (
            <>
              <h2 className="font-semibold">Interested?</h2>
              <p className="text-sm text-stone-600">Log in to order or contact the seller.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <LinkButton href={`/login?next=${encodeURIComponent(`/product/${product.id}`)}`}>Log in</LinkButton>
                <LinkButton href="/register" variant="outline">Create account</LinkButton>
              </div>
            </>
          ) : !membership?.hasAccess ? (
            <>
              <h2 className="font-semibold">Membership needed</h2>
              <p className="text-sm text-stone-600">
                {membership?.state === "none"
                  ? "Your membership is being set up. If you just verified your email, open the membership page."
                  : "Your membership is not active. Renew to order and contact sellers."}
              </p>
              <LinkButton href="/dashboard/membership" className="w-full">
                <Package className="size-4" aria-hidden /> Manage membership
              </LinkButton>
            </>
          ) : (
            <>
              <h2 className="font-semibold">Order this item</h2>
              <OrderForm productId={product.id} maxQuantity={product.quantity} />
              <div className="border-t border-stone-100 pt-4">
                <p className="mb-2 text-sm font-medium text-stone-700">Or contact the seller directly</p>
                <SellerContact productId={product.id} productTitle={product.title} />
              </div>
            </>
          )}
        </Card>

        <p className="text-xs leading-relaxed text-stone-500">
          Safety tip: meet in a public place on campus, inspect the item before paying, and never send money in advance.
        </p>
      </div>
    </div>
  );
}
