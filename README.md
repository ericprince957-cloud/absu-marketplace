# ABSU Marketplace

A student marketplace for Abia State University (ABSU), Uturu, Nigeria. Students register, browse and search products, become sellers, list items with photos, place orders and manage a membership.

**Membership:** the first 50 verified students are free for life; everyone after pays NGN 1,500 per month through Paystack.

## Status

| Part | State |
| --- | --- |
| Frontend (all public, auth, student, seller and admin pages) | Built, type-checked, linted, builds |
| Paystack flow (initialize, callback, webhook, idempotent processing) | Built and unit-tested; needs only `PAYSTACK_SECRET_KEY` |
| Supabase backend (schema, RLS, triggers, functions, storage) | **Specified, not built yet.** See `docs/BACKEND_CONTRACT.md` and hand `docs/BACKEND_AGENT_PROMPT.md` to the backend agent |

Until the backend exists the site runs with a visible "Backend not connected" banner and empty states. Nothing is mocked.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage) · Paystack · Vercel

## Run it
```bash
cp .env.example .env.local   # add Supabase values (and the Paystack secret key last)
npm install
npm run dev
```
Scripts: `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`

## Structure
```
src/
  app/
    (site)/        public pages: home, marketplace, search, category, product, pricing, about, contact
    (auth)/        login, register, verify-email, forgot/reset password + server actions
    auth/callback  email-link landing route
    dashboard/     student area: overview, profile, membership, orders, saved, notifications
    seller/        seller application + (manage)/ products, orders, sales
    admin/         users, seller applications, product moderation, categories, orders, payments, support inbox
    api/paystack/  initialize, callback, webhook
  components/      ui/ layout/ product/ membership/ dashboard/ auth/
  lib/             supabase clients, auth helpers, data queries, paystack, validation, utils
  config/site.ts   membership rules and constants (single source in the frontend)
docs/              contract, backend prompt, paystack, security, deployment
```

## Membership rules (how they work)
- Free spot is given by the database after **email verification**, in verification order, atomically (so two people can never take spot 50 together).
- Free members are never charged; the server refuses to start a payment for them.
- Paid access = 30 days per successful payment, extended from the current expiry when renewing early. Renewal is manual (no auto-debit in v1).
- Access is granted only after the server confirms the payment with Paystack. Returning from checkout proves nothing.
- Membership unlocks selling, ordering and seeing seller contacts. Browsing is free for everyone.

## Documentation
- [Backend contract](docs/BACKEND_CONTRACT.md) : exact database interface
- [Backend agent prompt](docs/BACKEND_AGENT_PROMPT.md) : hand this to the agent that builds Supabase
- [Paystack flow](docs/PAYSTACK.md) · [Security](docs/SECURITY.md) · [Deployment](docs/DEPLOYMENT.md)
- [Original build instructions](docs/MASTER_BUILD_INSTRUCTIONS.md)
