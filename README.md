# ABSU Marketplace

A student marketplace for Abia State University (ABSU), Nigeria. Students can register, browse and list products, become sellers, and manage a membership.

## Status

Repository initialised. No application code yet. Work follows the phased plan in [`docs/MASTER_BUILD_INSTRUCTIONS.md`](docs/MASTER_BUILD_INSTRUCTIONS.md).

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Project foundation and design system | Not started |
| 2 | Homepage, marketplace and product pages | Not started |
| 3 | Authentication and user profiles | Not started |
| 4 | Database schema, security and storage | Not started |
| 5 | Membership allocation and Paystack payments | Not started |
| 6 | Seller dashboard | Not started |
| 7 | Admin dashboard | Not started |
| 8 | Testing, security review and deployment | Not started |

## Planned stack

- Next.js (App Router) with TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Paystack for membership payments
- Vercel for deployment

## Membership model

- First 50 eligible registered users: free permanently.
- After that: ₦1,500 per month via Paystack.
- Free slots must be allocated atomically in the database, and payments verified server-side.

## Setup

Setup, deployment and security documentation will be added as each phase is completed.

1. Copy `.env.example` to `.env.local` and fill in your own values.
2. Never commit `.env.local` or any real secret.

## Security notes

- The Supabase service-role key and the Paystack secret key must only ever be used in server-side code.
- Admin access is enforced by server-side role checks and Row Level Security, never by a frontend password.
