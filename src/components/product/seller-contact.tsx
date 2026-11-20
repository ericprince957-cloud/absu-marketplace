import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getSellerContact } from "@/lib/data/products";
import { toWhatsAppNumber } from "@/lib/utils";

/** Public WhatsApp contact for an approved, non-suspended seller listing. */
export async function SellerContact({ productId, productTitle }: { productId: string; productTitle: string }) {
  const contact = await getSellerContact(productId);
  const wa = toWhatsAppNumber(contact?.whatsapp);

  if (!wa) return <p className="text-sm text-stone-600">This seller has not added a WhatsApp contact yet.</p>;

  const message = encodeURIComponent(`Hi, I saw "${productTitle}" on ABSU Marketplace. Is it still available?`);
  return (
    <Link href={`https://wa.me/${wa}?text=${message}`} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary" })}>
      <MessageCircle className="size-4" aria-hidden /> WhatsApp seller
    </Link>
  );
}
