import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { VectorCodesCredit } from "@/components/layout/vector-codes-credit";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} | Buy and sell at ABSU`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
};

const themeScript = "(() => { try { const saved = localStorage.getItem('absu-marketplace-theme'); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; if (saved === 'dark' || (!saved && prefersDark)) document.documentElement.classList.add('dark'); } catch {} })();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
          Skip to content
        </a>
        {children}
        <VectorCodesCredit />
      </body>
    </html>
  );
}
