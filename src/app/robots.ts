import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const privatePaths = ["/dashboard", "/seller", "/admin", "/api", "/auth"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketplace", "/product/", "/store/", "/category/", "/about", "/pricing", "/contact"],
        disallow: privatePaths,
      },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
