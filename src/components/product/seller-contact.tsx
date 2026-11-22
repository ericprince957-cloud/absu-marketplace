import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getSellerContact } from "@/lib/data/products";
import { toWhatsAppNumber } from "@/lib/utils";

/** Public WhatsApp contact for an approved, non-suspended seller listing. */
export async function SellerContact({ productId, productTitle, price }: { productId: string; productTitle: string; price: number }) {
  const contact = await getSellerContact(productId);
  const wa = toWhatsAppNumber(contact?.whatsapp);

  if (!wa) return <p className="text-sm text-stone-600">This seller has not added a WhatsApp contact yet.</p>;

  const message = encodeURIComponent(`Hello, I am interested in "${productTitle}" listed for ₦${price.toLocaleString("en-NG")} on ABSU Trade. Is it still available? https://absutrade.com.ng/product/${productId}`);
  return (
    <Link href={`https://wa.me/${wa}?text=${message}`} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary" })}>
      <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
    </Link>
  );
}
