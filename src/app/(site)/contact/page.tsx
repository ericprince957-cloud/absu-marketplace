import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Card, PageHeader } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Get help with your account, membership, payments or listings.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact and support" description="Questions about your account, membership, payments or a listing? Send us a message." />
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <ContactForm />
        </Card>
        <div className="space-y-4">
          <Card className="space-y-2">
            <h2 className="font-bold">Before you write</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-stone-600">
              <li>For payment issues, include your Paystack reference (it starts with ABSU-).</li>
              <li>For a listing problem, include the product link.</li>
              <li>We reply by email, so double-check your address.</li>
            </ul>
          </Card>
          {siteConfig.supportEmail ? (
            <Card>
              <p className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-brand-700" aria-hidden />
                <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-700 hover:underline">
                  {siteConfig.supportEmail}
                </a>
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
