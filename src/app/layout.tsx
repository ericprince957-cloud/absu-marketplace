import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { VectorCodesCredit } from "@/components/layout/vector-codes-credit";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PwaRegister } from "@/components/layout/pwa-register";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = new URL(siteConfig.url).origin;

export async function generateMetadata(): Promise<Metadata> {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const title = `${siteConfig.name} | ABSU Student Marketplace in Uturu`;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${siteConfig.name}` },
    description: siteConfig.description,
    keywords: [
      "ABSU Trade", "ABSU marketplace", "ABSU student marketplace",
      "Abia State University marketplace", "buy and sell at ABSU",
      "ABSU Uturu", "student marketplace Nigeria", "campus marketplace",
      "ABSU textbooks", "ABSU gadgets", "ABSU fashion", "ABSU food",
      "student sellers in Uturu",
    ],
    alternates: { canonical: pathname },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    manifest: "/manifest.webmanifest",
    applicationName: siteConfig.name,
    authors: [{ name: "ABSU Trade" }],
    creator: "ABSU Trade",
    publisher: "ABSU Trade",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: siteConfig.shortName },
    icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
    openGraph: {
      title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      url: siteUrl,
      type: "website",
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteConfig.description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f3427",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

const themeScript = "(() => { try { const saved = localStorage.getItem('absu-marketplace-theme'); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; if (saved === 'dark' || (!saved && prefersDark)) document.documentElement.classList.add('dark'); } catch {} })();";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    areaServed: {
      "@type": "Place",
      name: "Abia State University, Uturu, Abia State, Nigeria",
    },
    knowsAbout: [
      "Student marketplace",
      "Campus buying and selling",
      "Textbooks and study materials",
      "Student fashion and gadgets",
      "Food and student services",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: ["ABSU Marketplace", "ABSU Trade Nigeria"],
    url: siteUrl,
    description: siteConfig.description,
    inLanguage: "en-NG",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
          Skip to content
        </a>
        {children}
        <VectorCodesCredit />
        <CookieConsent />
        <PwaRegister />
        <PwaInstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
