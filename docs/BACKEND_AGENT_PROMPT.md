# Prompt for the backend agent

> Copy everything below the line into the agent. It assumes the agent has access to this repository
> (`ericprince957-cloud/absu-marketplace`) and to the Supabase project (via the Supabase tools/CLI).

---

You are a senior backend engineer and Postgres/Supabase security specialist. Build the complete Supabase backend
for **ABSU Marketplace**, a real product for students of Abia State University (ABSU), Nigeria. Real students,
real payments, real data. No demo shortcuts, no mock production data, no placeholder security.

## 0. Situation

The **frontend and the Paystack payment flow are already finished** and live in this repository
(Next.js 16 App Router, TypeScript, Tailwind). They were written against a fixed database interface.
**Your job is to build the database, security, storage and auth configuration so that interface is satisfied
exactly, and then prove it by running the real app against it.**

Read these first, in this order, completely:

1. `docs/BACKEND_CONTRACT.md` : **authoritative.** Every table, column, constraint name, RPC signature, error token, RLS rule, storage rule and auth setting. Implement it name-for-name.
2. `docs/MASTER_BUILD_INSTRUCTIONS.md` : the product requirements.
3. `docs/PAYSTACK.md` : how the payment flow calls your database functions.
4. `src/lib/paystack/process.ts`, `src/app/api/paystack/initialize/route.ts` : the exact RPC calls and error tokens the payment code uses.
5. `src/lib/auth.ts`, `src/lib/data/*.ts`, `src/app/**/actions.ts` : every query and RPC the app makes (the contract section 9 is the index).

## 1. Hard rules

- **Do not modify frontend code** except to fix a genuine bug you can prove. If the contract and the frontend disagree, stop and report it; if you decide the frontend is right, fix the contract, and if the contract is right, make the smallest possible frontend fix and say exactly what you changed. Never silently drift.
- **Do not touch `PAYSTACK_SECRET_KEY` or anything Paystack.** It is added by the owner last. Everything you build must work without it (the payment endpoints return a clean "not switched on" error until then).
- **Never commit secrets.** No service-role key, no passwords in the repo. Use `.env.local` (git-ignored) for your local testing.
- Everything is created through **versioned migrations** in `supabase/migrations/` (timestamped `.sql` files, idempotent where reasonable, applied in order on a fresh project). No dashboard-only changes: anything configured by hand must be documented in `docs/BACKEND_SETUP.md`.
- **Row Level Security ON for every table in `public`**, with no table accidentally readable. Default deny.
- Every `SECURITY DEFINER` function: `SET search_path = ''`, fully schema-qualified references, `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` first, then grant only to the roles stated in the contract. Remember Postgres grants EXECUTE to PUBLIC by default; forgetting this is the most common hole.
- Error tokens (`membership_required`, `already_free`, `unknown_reference`, ...) must be **exactly** the strings in the contract, because the frontend matches on them.
- Money: payments in integer kobo; product prices `numeric(12,2)` naira. Never floats.
- Work in a **Supabase branch or a throwaway project first** if the tools allow, then apply to the real project.

## 2. Deliverables

1. `supabase/migrations/*.sql` : schema, constraints, indexes, triggers, functions, RLS policies, storage bucket and storage policies, in dependency order. Split into sensible files (extensions, settings, tables, helpers, membership, payments, orders, moderation/admin, RLS, storage).
2. `supabase/seed.sql` : the `app_settings` rows and a starter set of **categories** only (Textbooks and Notes, Electronics, Phones and Accessories, Fashion, Food and Snacks, Hostel Essentials, Services). No fake users, products, orders or payments.
3. `supabase/tests/*.sql` : repeatable SQL tests (pgTAP if available, otherwise plain `DO` blocks that `RAISE EXCEPTION` on failure) covering section 4 below.
4. `docs/BACKEND_SETUP.md` : step-by-step for the owner: creating the project, running migrations, auth settings, SMTP, redirect URLs, email templates, how to create the first admin, env var values to copy (names only, never real values).
5. `.env.example` : verify it still lists every variable (do not add real values).
6. Optionally `src/types/database.ts` generated with the Supabase CLI. Only add it; do not rewire the app to use it.
7. A final **report** (section 6).

## 3. What to build (summary; the contract has the detail)

**Schema:** `profiles`, `user_roles`, `app_settings`, `membership_entitlements`, `payments`, `subscriptions`, `categories`, `products`, `product_images`, `orders`, `order_items`, `saved_products`, `seller_applications`, `notifications`, `support_messages`, view `seller_public`. UUID keys, FKs with explicit `ON DELETE`, CHECK constraints, `updated_at` triggers, the indexes listed (including `pg_trgm` GIN on product title/description). Foreign-key constraint names must be the defaults `<table>_<column>_fkey`; the frontend uses `orders_buyer_id_fkey`, `orders_seller_id_fkey`, `seller_applications_user_id_fkey`, `payments_user_id_fkey` in PostgREST embeds.

**Triggers:** new `auth.users` row -> create `profiles` + `user_roles(student)`; email change -> sync `profiles.email`; `email_confirmed_at` NULL -> not NULL (or inserted already confirmed) -> `claim_free_slot()`; `updated_at`; product guard (non-admins cannot approve/reject or change `seller_id`); max 5 images per product.

**Free-50 allocation (the most important correctness requirement):** `claim_free_slot` must be atomic under concurrency: take a transaction-level advisory lock, count, insert with the next `free_slot_number`, with `UNIQUE` + `CHECK (1..50)` as a second line of defence. Slots are assigned **only after admin approval of a seller application**, in approval order, never to buyers, and never revoked. Document this in `docs/BACKEND_SETUP.md`.

**Payments:** `create_pending_payment` (called as the user), `apply_membership_payment` and `mark_payment_status` (called ONLY by the service role from the Next.js server), idempotent per reference, with the amount/currency/user checks in the contract. A browser must never be able to grant itself membership, insert a payment, or alter an entitlement.

**Marketplace logic:** `place_order` (locks the product row, checks account status/stock/ownership but never seller membership, snapshots price and title, decrements stock, notifies the seller), `update_order_status` (transition rules, restores stock on cancel), `get_seller_contact` (public WhatsApp contact for approved listings only; no email or private profile fields), `review_seller_application` (approving grants the `seller` role), `moderate_product`, `admin_set_suspended`, `admin_extend_membership`, `admin_stats`, `get_free_slots_remaining`.

**RLS:** exactly the matrix in contract section 5. Admin checks use `is_admin()`, never a client-supplied value. Counterparties in an order can read each other's `profiles` row (needed so names show in orders); nobody else can read other people's profiles. `seller_public` must expose no private fields.

**Storage:** public bucket `product-images`, 5 MB limit, jpeg/png/webp only, upload/delete restricted to the owner's own folder `{auth.uid()}/...` for active sellers with paid or lifetime-free seller access, admins can delete.

**Auth (dashboard/CLI config, documented):** email confirmation ON, Site URL, redirect allow-list, the two `token_hash` email templates from contract section 7, custom SMTP, password min length 8.

## 4. Tests you must write AND run (all must pass)

Run them against a real database, not by reading the SQL.

**Free slots / concurrency**
- Create 60 confirmed users concurrently (parallel connections, not one loop) -> exactly 50 `free_lifetime` rows, `free_slot_number` is exactly 1..50 with no gaps or duplicates, 10 users have no entitlement.
- A user who has not verified their email gets no slot. A user verified later than the 50th gets none. Running the trigger twice for one user changes nothing.
- `get_free_slots_remaining()` returns 50 minus the count and never goes negative.

**Payments**
- `create_pending_payment` rejects: anon, wrong amount, malformed reference, unverified email, a free lifetime member (`already_free`).
- `apply_membership_payment` as service role: first call extends `paid_until` by exactly 30 days from now; the **same reference again returns `duplicate:true` and changes nothing** (assert `paid_until`, `subscriptions` count and notifications are unchanged); second payment while active extends from the existing `paid_until`, not from now.
- Wrong amount -> `amount_mismatch`; wrong currency -> `amount_mismatch`; unknown reference -> `unknown_reference`; wrong `p_metadata_user_id` -> `user_mismatch`.
- A payment first marked `abandoned` can later become `success`. `mark_payment_status` never downgrades `success`.
- **As `authenticated` or `anon`, calling `apply_membership_payment` or `mark_payment_status` must fail with a permission error.** Same for direct `INSERT/UPDATE` on `payments`, `membership_entitlements`, `subscriptions`, `user_roles`.
- A free lifetime member can never be charged and never ends up with a `paid` entitlement.

**RLS / privilege escalation (try to break it)**
- A user cannot: grant themselves `seller`/`admin`; set `is_suspended`; change `profiles.email`; read another user's payments, orders, notifications, entitlements, saved items or contact details; update another user's product; set a product `approved`; insert a product without the seller role or active membership.
- Anon can read only approved products and active categories; cannot read pending products, profiles, anything else.
- `seller_public` exposes no email/phone/WhatsApp.
- `get_seller_contact` returns no rows for anon and for non-members, one row for an active member.
- Admin functions raise `forbidden` for non-admins.

**Marketplace**
- `place_order`: each error token (`membership_required`, `not_available`, `own_product`, `out_of_stock`); success decrements stock; two concurrent orders for the last unit -> exactly one succeeds. Cancelling restores stock once only. Illegal status transitions are refused.
- Moderation, seller application approval/rejection, notifications created, `admin_stats()` returns all twelve keys with correct numbers.

**Storage**
- A seller can upload to their own folder; cannot upload to another user's folder; non-member seller and anon cannot upload; wrong mime type and >5 MB rejected; public read works.

## 5. Prove it works with the real app (do not skip)

1. Put the Supabase URL, anon key and service-role key in `.env.local`. Leave `PAYSTACK_SECRET_KEY` empty.
2. `npm install && npm run dev`. Create a real account, confirm the email, and verify it lands as **free member #1** on `/dashboard/membership`.
3. Promote a test account to admin with SQL; apply as a seller with a second account, approve it in `/admin/sellers`, create categories if needed, list a product with photos, approve it in `/admin/products`, see it on `/marketplace`, order it from a third account, confirm/complete the order, check `/seller/sales` and `/admin`.
4. Confirm that clicking the pay button on a non-free account returns the clean "Payments are not switched on yet" message (Paystack key intentionally absent) and that **free members never see a pay button**.
5. Simulate the Paystack step **without Paystack** to prove the database path: as service role, call `create_pending_payment` for a test user and then `apply_membership_payment`; confirm `/dashboard/membership` shows the active membership and history.
6. Run `npm run typecheck && npm run lint && npm test && npm run build`. All must still pass.
7. Run the Supabase advisors (security and performance) and fix every finding that is not a deliberate, documented decision.

## 6. Final report format

Reply with: (a) what you built, (b) the migration list, (c) test results with pass/fail counts and the concurrency result for the 60-user test, (d) every deviation from the contract and why, (e) every frontend change (should be none), (f) manual setup steps the owner must still do (SMTP, templates, first admin), (g) anything unfinished or risky, stated plainly. Do not claim something works unless you ran it.

## 7. Definition of done

The owner can: register, verify, be given a free slot (if among the first 50), browse, apply as a seller, list products, order, and use the admin dashboard, **all against the real Supabase project**, with the only missing piece being the Paystack secret key. Adding `PAYSTACK_SECRET_KEY` to the environment and registering the webhook URL must be the *only* remaining step to take real payments.
