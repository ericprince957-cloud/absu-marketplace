# ABSU Marketplace

A student marketplace for Abia State University (ABSU), Uturu, Nigeria. Anyone can browse and search products for free. Buyers can contact sellers and arrange purchases directly on WhatsApp without an account. Approved sellers can list items with photos and manage their storefront.

**Seller access:** the first 50 approved sellers receive lifetime-free access. Every approved seller after that pays **NGN 1,500 for 30 days** through Paystack. Buyers never pay a subscription or platform fee.

## Current project status

| Area | Status |
| --- | --- |
| Next.js frontend | Implemented in the repository; final production build and end-to-end launch checks still required |
| Paystack integration | Server-side initialize, verify, callback, webhook and idempotent processing implemented; requires credentials and test transactions |
| Supabase backend | Rebuilt and deployed to the configured Supabase project; backend smoke checks were run during deployment |
| Repository migration source | Not yet committed as reproducible SQL migrations; see [Backend setup](docs/BACKEND_SETUP.md) |
| Launch configuration | Requires owner setup and verification; see [Launch checklist](docs/LAUNCH_CHECKLIST.md) |

The live Supabase project is **not** a blank or unbuilt backend. Do not reset it or rerun destructive setup SQL. The setup guide distinguishes the existing live deployment from the repository files still needed for reproducible fresh environments.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · Supabase Auth/Postgres/Storage · Paystack · Vercel

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Scripts: `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`

## Membership rules

- Free lifetime slots are assigned by the database after email verification, in verification order.
- The allocation is atomic and capped at 50.
- Free members are never charged.
- Paid membership lasts 30 days per successful payment. Early renewals extend from the existing expiry.
- Membership unlocks selling, placing orders and viewing seller contact details. Browsing is public.
- Item purchases are arranged directly between buyer and seller; the platform does not process item-sale payments.
- Returning from Paystack checkout does not grant access. The server verifies the transaction with Paystack first.

## Project structure

```
src/
  app/                 Public pages, auth, dashboards and API routes
  components/          UI and feature components
  config/site.ts       Frontend membership constants
  lib/                 Supabase, auth, validation and Paystack logic
docs/                  Backend contract, security, payment and launch guides
supabase/seed.sql       Idempotent category and app-setting reference seed
supabase/tests/        Read-only backend contract smoke assertions
```

## Documentation

- [Backend contract](docs/BACKEND_CONTRACT.md)
- [Backend setup and live deployment notes](docs/BACKEND_SETUP.md)
- [Paystack integration and testing](docs/PAYSTACK.md)
- [Security notes](docs/SECURITY.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Launch checklist](docs/LAUNCH_CHECKLIST.md)

## Important

Never commit `.env.local`, Supabase service-role credentials, or Paystack secret keys. The only Paystack credential this implementation requires is the server-side `PAYSTACK_SECRET_KEY`; it must never be exposed as a `NEXT_PUBLIC_*` variable.
