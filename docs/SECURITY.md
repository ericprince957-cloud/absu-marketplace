# Security notes

## Secrets
- `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` are server-only. They are read only in `src/lib/supabase/admin.ts` and `src/lib/paystack/*`, which import `server-only`, so the build fails if a client component ever imports them.
- Only `NEXT_PUBLIC_*` values reach the browser. The anon key is safe by design because Row Level Security limits it.
- `.env*` files are git-ignored; `.env.example` contains names only.

## Authorisation (defence in depth)
1. `src/proxy.ts` refreshes the session and redirects logged-out visitors from `/dashboard`, `/seller`, `/admin`. Convenience only.
2. Server components and actions call `requireUser()` / `requireAdmin()` (`src/lib/auth.ts`). Non-admins get a 404 on `/admin`.
3. **The database is the real gate**: RLS on every table and `is_admin()` / `has_active_membership()` inside every privileged function (`docs/BACKEND_CONTRACT.md`). A forged request from a browser is refused even if the UI checks were bypassed.
4. Admin access is a row in `user_roles`, never a password or a client flag.

## Membership and payments
- Free slots are assigned by a database trigger after email verification, atomically. The browser only displays the count.
- Access is granted only by `apply_membership_payment`, callable only with the service role, after Paystack's server confirms the transaction. See `docs/PAYSTACK.md`.

## Input and output
- All form input is validated with Zod on the server (`src/lib/validation.ts`).
- Search text is stripped of query-syntax characters before use in filters (`sanitizeSearch`, unit-tested).
- Redirect targets (`?next=`) must be same-site paths (`safeNextPath`, unit-tested).
- React escapes output; no `dangerouslySetInnerHTML` is used.
- Seller phone/WhatsApp are returned only by `get_seller_contact` to active members. `seller_public` exposes no contact fields.
- Photos: client-side resize, JPEG only, 5 MB cap, owner-folder storage policy, path prefix re-checked server-side before saving.
- Auth errors are generic (no account enumeration on login, sign-up or password reset).
- Contact form has a honeypot field; add Supabase/Vercel rate limiting before heavy traffic.

## Headers
`next.config.ts` sets `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.

## Known limits / follow-ups
- No rate limiting beyond Supabase Auth's built-ins; consider Vercel Firewall rules on `/api/paystack/initialize` and the contact form.
- Manual renewal only (no auto-debit).
- A payment that succeeded at Paystack but failed our amount/currency check needs manual review (logged as `PAYMENT NEEDS REVIEW`).
- Refunds are handled manually in Paystack; the `refunded` status exists but is not set automatically.
- Add a strict Content-Security-Policy once the final set of third-party origins is known.
