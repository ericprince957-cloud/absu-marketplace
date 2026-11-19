# Deployment (Vercel + Supabase)

## 1. Supabase
Follow `docs/BACKEND_SETUP.md` (written by the backend step): run the migrations, configure Auth (email confirmation, redirect URLs, email templates, **custom SMTP**), create the first admin.

## 2. Vercel
1. Import the GitHub repo as a Next.js project (defaults are correct: `npm run build`).
2. Add environment variables (Production, and Preview if you use it):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (no trailing slash) |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase > Project Settings > API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key (mark as Sensitive) |
   | `PAYSTACK_SECRET_KEY` | `sk_test_...` first, `sk_live_...` at launch (mark as Sensitive) |
   | `NEXT_PUBLIC_SUPPORT_EMAIL` | optional |

3. Deploy. Add your domain in Vercel and set the same URL as Supabase **Site URL** and add `https://your-domain.com/auth/callback` to the redirect allow-list.
4. In Paystack: set the webhook URL to `https://your-domain.com/api/paystack/webhook`.

Redeploy after changing any environment variable. `NEXT_PUBLIC_*` values are baked in at build time.

## 3. Go-live checklist
- [ ] Migrations applied; `supabase/tests` pass
- [ ] Email confirmation ON, custom SMTP working (sign up with a real inbox)
- [ ] Verified account becomes free member #1; 51st verified account sees the pay button
- [ ] First admin created; categories exist
- [ ] Test-mode Paystack payment succeeds, webhook resend is idempotent
- [ ] Live Paystack key set, webhook URL set, one real NGN 1,500 payment verified end to end
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` green
- [ ] Supabase security advisor shows no unexplained warnings

## 4. Local development
```bash
cp .env.example .env.local      # fill in the Supabase values
npm install
npm run dev                     # http://localhost:3000
```
Without Supabase variables the site still runs and shows a "Backend not connected" banner with empty states.
