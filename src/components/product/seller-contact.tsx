import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getSellerContact } from "@/lib/data/products";
import { toWhatsAppNumber } from "@/lib/utils";

/** Seller phone/WhatsApp. The database only returns these to logged-in members with active access. */
export async function SellerContact({ productId, productTitle }: { productId: string; productTitle: string }) {
  const contact = await getSellerContact(productId);
  const wa = toWhatsAppNumber(contact?.whatsapp ?? contact?.phone);

  if (!contact || (!wa && !contact.phone)) {
    return <p className="text-sm text-stone-600">This seller has not added a contact number yet. Place an order to reach them.</p>;
  }

  const message = encodeURIComponent(`Hi, I saw "${productTitle}" on ABSU Marketplace. Is it still available?`);
  return (
    <div className="flex flex-wrap gap-2">
      {wa ? (
        <Link href={`https://wa.me/${wa}?text=${message}`} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary" })}>
          <MessageCircle className="size-4" aria-hidden /> WhatsApp seller
        </Link>
      ) : null}
      {contact.phone ? (
        <Link href={`tel:${contact.phone.replace(/\s/g, "")}`} className={buttonStyles({ variant: "outline" })}>
          <Phone className="size-4" aria-hidden /> Call
        </Link>
      ) : null}
    </div>
  );
}
