import type { Metadata } from "next";
import { HeartHandshake, ShieldCheck, Zap } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About ABSU Trade",
  description:
    "Learn about ABSU Trade, an independent student marketplace helping the Abia State University community in Uturu discover products, connect with student sellers and trade more easily.",
};

const values = [
  { icon: HeartHandshake, title: "By students, for students", text: "Built around how ABSU students actually trade: on campus, in hostels, and between friends of friends." },
  { icon: ShieldCheck, title: "Trust first", text: "Verified emails, reviewed sellers and moderated listings help keep the marketplace safer and more genuine." },
  { icon: Zap, title: "Simple to use", text: "Made for phones, with clear steps so anyone can buy or sell without technical knowledge." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About ABSU Trade" description="A marketplace for the Abia State University community." />
      <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-stone-700 sm:text-base">
        <p>
          Students at ABSU buy and sell things every day, but it often happens in scattered WhatsApp groups where good deals get buried. ABSU Trade puts student listings in one place: searchable, organised and easier to discover.
        </p>
        <p>
          Anyone can browse for free. Approved sellers can list products with photos and receive enquiries. The first 50 approved sellers enjoy free membership for life, and every approved seller after that pays a small monthly fee.
        </p>
        <p>
          ABSU Trade is an independent community marketplace, not an official website or service of Abia State University. Item payments are arranged directly between buyer and seller when they meet; seller membership fees are separate.
        </p>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {values.map((v) => (
          <li key={v.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <v.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-bold">{v.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{v.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/register" size="lg">Create your account</LinkButton>
        <LinkButton href="/contact" variant="outline" size="lg">Contact us</LinkButton>
      </div>
    </>
  );
}
