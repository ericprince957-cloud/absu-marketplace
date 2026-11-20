import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

function buildContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://checkout.paystack.com https://paystack.com",
    `script-src 'self' 'nonce-${nonce}' https://js.paystack.co${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co" + (isDev ? " ws://localhost:* http://localhost:*" : ""),
    "frame-src https://checkout.paystack.com https://paystack.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  // Next.js reads this request header and applies the nonce to its framework
  // scripts and inline scripts rendered by Server Components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const nonceRequest = new NextRequest(request, { headers: requestHeaders });
  const response = await updateSession(nonceRequest);
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    // Skip static files, images and the Paystack webhook (no cookies, raw body).
    "/((?!_next/static|_next/image|favicon.ico|api/paystack/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
