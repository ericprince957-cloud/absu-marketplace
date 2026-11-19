# Deployment and launch guide (Vercel + Supabase)

This repository's Supabase backend has already been rebuilt and deployed to the existing project. This is an operational guide for that existing project, not permission to reset it.

## 1. Confirm the existing Supabase project

Existing project details:

- Project ref: `inrwfjubwumvtbviuwek`
- Project URL: `https://inrwfjubwumvtbviuwek.supabase.co`
- Region: `eu-west-2`
- Database: PostgreSQL 17

The deployed backend contains the 15 tables specified in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md), RLS, marketplace RPCs, membership allocation and the `product-images` storage bucket. The deployed backend was smoke-tested.

**Do not reset this project or rerun a schema-reset script.** The SQL migration source files still need to be committed to this repository for reproducible fresh-project setup. See [BACKEND_SETUP.md](BACKEND_SETUP.md).

## 2. Configure Supabase Auth

In Supabase Dashboard > Authentication > URL Configuration:

1. Set Site URL to your final production URL, for example `https://your-domain.com`.
2. Add `https://your-domain.com/auth/callback` to Redirect URLs.
3. Add `http://localhost:3000/auth/callback` for local development.
4. If using Vercel Preview deployments, add the appropriate preview callback URLs/patterns.

In Authentication settings:

- Enable email confirmation.
- Set minimum password length to at least 8.
- Configure custom SMTP before inviting real students; the built-in email sender is heavily rate-limited.
- Configure the email templates to use the token-hash callback flow described in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md).

These are dashboard actions. Do not assume they are complete until checked in the dashboard and tested with a real inbox.

## 3. Configure Vercel

Import `ericprince957-cloud/absu-marketplace` into Vercel as a Next.js project. Use the repository root as the project root.

Add the following environment variables to the relevant Vercel environments:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your final HTTPS domain, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://inrwfjubwumvtbviuwek.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The project's anon/publishable key from Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | The project's service-role/secret key; mark Sensitive |
| `PAYSTACK_SECRET_KEY` | Start with Paystack test secret; mark Sensitive |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional support email |

Never put the service-role key or Paystack secret in a `NEXT_PUBLIC_*` variable. Never commit real credentials.

After setting variables, deploy or redeploy because Next.js public variables are embedded at build time.

## 4. Configure Paystack

The current implementation requires only the server-side `PAYSTACK_SECRET_KEY`. It does not need a Paystack public key because checkout initialization is performed by the server and the customer is redirected to Paystack's hosted authorization URL.

1. Start with the Paystack test secret key.
2. Set the webhook URL in Paystack to `https://YOUR-DOMAIN/api/paystack/webhook`.
3. Deploy after adding the secret.
4. Complete a test transaction and verify the webhook/callback idempotency.
5. Only after all checks pass, replace the test secret with the live secret and redeploy.

Detailed steps: [PAYSTACK.md](PAYSTACK.md).

## 5. Local checks

Run from the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Do not treat a deployment as launch-ready if any required command fails.

## 6. Student launch gate

Before sharing the link publicly, verify the complete journey with real test accounts:

- Student registers and receives confirmation email.
- Student confirms email and reaches the application.
- Database assigns the free slot correctly (or presents paid membership when the 50 slots are used).
- Student can complete the membership payment in Paystack test mode where applicable.
- Verified membership unlocks the expected seller/order features.
- Seller application and admin approval work.
- Seller creates a product and uploads images.
- Admin approves the product.
- Another eligible student can view the product and place an order.
- Buyer and seller can see the order and update allowed statuses.
- Seller contact details remain protected from non-members.
- Admin routes and operations reject non-admin accounts.

See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md). A successful build alone is not proof that these journeys work.
