# ABSU Trade

ABSU Trade is an independent student marketplace for the Abia State University (ABSU) community in Uturu, Abia State, Nigeria. Anyone can browse and search publicly visible products for free. Buyers can contact sellers and arrange purchases directly on WhatsApp without an account. Email-verified sellers with active seller access can publish products immediately—there is no product-by-product approval queue. Admins can still remove listings that break marketplace rules.

**Seller access:** the first 50 approved sellers receive lifetime-free access. Every approved seller after that pays **NGN 1,500 for 30 days** through Paystack. Buyers never pay a subscription or platform fee.

**Live website:** https://absutrade.com.ng

ABSU Trade is an independent community platform and is not an official university service.

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

## Seller access rules

- The first 50 seller applications approved by an administrator receive lifetime-free seller access.
- Buyers and ordinary account registrations never consume seller launch slots.
- The allocation is atomic and capped at 50.
- Approved sellers after the first 50 pay NGN 1,500 for 30 days of seller access.
- Email verification, seller approval and active seller membership control creating and managing listings and uploading product photos.
- New and edited listings from eligible, email-verified sellers publish immediately; admins retain the ability to take down unsafe or misleading listings.
- Buyers can browse, search, contact sellers on WhatsApp and buy products for free. No buyer account or subscription is required for WhatsApp purchases.
- Signed-in buyers can optionally submit order requests; these do not require seller access. Item payments are arranged directly between buyer and seller.
- Returning from Paystack checkout does not grant seller access. The server verifies the transaction with Paystack first.

## Project structure

```
src/
  app/                 Public pages, auth, dashboards and API routes
  components/          UI and feature components
  config/site.ts       Frontend membership constants and canonical site identity
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
