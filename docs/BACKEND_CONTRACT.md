# Backend contract (Supabase)

This is the **exact interface the frontend was built against**. The Supabase backend must match it
name-for-name. If something here is impossible or wrong, change it deliberately: update this file AND
the frontend call site together, never just one side.

Source of truth for business rules: `src/config/site.ts` (frontend) and `app_settings` (database, see 2).

---

## 1. Decisions that are already made

| Topic | Decision |
| --- | --- |
| Free lifetime slots | First **50 approved sellers**, in approval order. Buyers and ordinary registrations never consume slots. Never charged, never expires. |
| When assigned | Atomically inside `review_seller_application` immediately after an admin approves the seller. Never on registration or email verification. |
| Atomicity | Assignment runs under a transaction-level advisory lock; `free_slot_number` is UNIQUE with CHECK 1..50. 60 simultaneous seller approvals must still yield exactly 50 free rows. |
| Paid membership | **NGN 1,500 (150000 kobo) = 30 days.** Each successful payment extends `paid_until` by 30 days from `max(now, current paid_until)`. |
| Renewal model | **Manual renewal.** The member pays again (allowed in the last 7 days before expiry, or after expiry). There is no card-on-file auto-debit in v1. |
| What seller access unlocks | Creating/editing product listings and uploading photos. Buyers browse, search, contact sellers and buy for free, including guest WhatsApp checkout. |
| Item payments | Not handled by the platform. Buyer pays seller in person. Orders are requests. |
| Admin creation | Never from the UI. First admin: after they register, run `insert into user_roles (user_id, role) values ('<uuid>', 'admin');` as the database owner. |
| Seller approval | Admin approves `seller_applications`; approval inserts `user_roles(seller)`. |
| Product moderation | New and edited products are `pending`. Only admins can set `approved` / `rejected`. |

---

## 2. Settings (single source of truth in the DB)

Table `app_settings(key text primary key, value jsonb not null)` seeded with:

| key | value |
| --- | --- |
| `free_slot_limit` | `50` |
| `membership_price_kobo` | `150000` |
| `membership_period_days` | `30` |
| `currency` | `"NGN"` |

All SQL functions read these. They must match `membership` in `src/config/site.ts`.
RLS: readable by `authenticated`, writable by nobody via the API.

---

## 3. Tables

Use `uuid` primary keys (`gen_random_uuid()`), `timestamptz` timestamps (`created_at default now()`,
`updated_at` maintained by trigger where listed), foreign keys with explicit `on delete` behaviour.
**Foreign-key constraint names matter** (the frontend uses them in PostgREST embeds). Defining the FK
inline as `column uuid references table(id)` gives the required default names `<table>_<column>_fkey`.

### profiles
`id uuid pk references auth.users(id) on delete cascade`, `email text`, `full_name text`, `username text unique`,
`phone text`, `whatsapp text`, `faculty text`, `department text`, `level text`, `hostel text`, `bio text`,
`avatar_url text`, `is_suspended boolean not null default false`, `created_at`, `updated_at`.

- Trigger on `auth.users` insert: create the profile (`full_name` and `phone` from `raw_user_meta_data`, `email` from the user) and insert `user_roles(student)`. It does **not** allocate a seller slot.
- Trigger on `auth.users` email change: keep `profiles.email` in sync.
- Users can UPDATE only their own row and only these columns: `full_name, username, phone, whatsapp, faculty, department, level, hostel, bio, avatar_url` (use column-level `GRANT UPDATE (...)` and `REVOKE` the rest). `is_suspended`, `email`, `id` are never user-writable.
- Constraints: `username ~ '^[a-z0-9_]{3,30}$'`.

### user_roles
`user_id uuid not null references profiles(id) on delete cascade`, `role text check (role in ('student','seller','admin'))`, `created_at`, `primary key (user_id, role)`.
No client writes at all. Roles are changed only by `review_seller_application` and by the database owner.

### app_settings
See section 2.

### membership_entitlements
`user_id uuid primary key references profiles(id) on delete cascade` (one row per user, so PostgREST embeds it as an object),
`kind text check (kind in ('free_lifetime','paid'))`, `status text check (status in ('active','expired','revoked')) default 'active'`,
`free_slot_number int unique check (free_slot_number between 1 and 50)`, `paid_until timestamptz`, `created_at`, `updated_at`.

- `kind='free_lifetime'` requires `free_slot_number is not null and paid_until is null` (CHECK).
- `kind='paid'` requires `free_slot_number is null`.
- Entitlements apply only to approved sellers. `has_active_membership()` also requires the `seller` role and a non-suspended profile. Free: `status='active'`; paid: `status='active' AND paid_until > now()`. Buyers never need an entitlement.
- No client writes.

### payments
`id`, `user_id uuid not null references profiles(id)`, `reference text not null unique`, `amount_kobo int not null check (amount_kobo > 0)`,
`currency text not null default 'NGN'`, `status text not null default 'pending' check (status in ('pending','success','failed','abandoned','refunded'))`,
`purpose text not null default 'membership'`, `paystack_transaction_id text unique`, `paid_at timestamptz`, `raw jsonb`, `created_at`, `updated_at`.
Indexes: `(user_id, created_at desc)`, `(status)`. No client inserts or updates.

### subscriptions  (membership history)
`id`, `user_id references profiles(id)`, `payment_id uuid unique references payments(id)` (nullable for admin grants),
`source text check (source in ('paystack','admin'))`, `period_start timestamptz`, `period_end timestamptz`, `created_at`.
One row per granted period. Users can SELECT their own; no client writes.

### categories
`id`, `name text unique not null`, `slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`, `description text`, `icon text`,
`sort_order int not null default 0`, `is_active boolean not null default true`, `created_at`.
Seed a starter set in `supabase/seed.sql` (e.g. Textbooks and Notes, Electronics, Phones and Accessories, Fashion, Food and Snacks, Hostel Essentials, Services). Categories are configuration, not fake data.

### products
`id`, `seller_id uuid not null references profiles(id) on delete cascade`, `category_id uuid references categories(id) on delete restrict`,
`title text not null check (char_length(title) between 3 and 120)`, `description text not null check (char_length(description) between 10 and 2000)`,
`price numeric(12,2) not null check (price > 0)`, `condition text not null check (condition in ('new','like_new','used'))`,
`quantity int not null default 1 check (quantity >= 0)`, `location text`, `status text not null default 'pending' check (status in ('pending','approved','rejected','sold','archived'))`,
`moderation_note text`, `created_at`, `updated_at`.
Indexes: `(status, created_at desc)`, `(seller_id)`, `(category_id)`, `(price)`, and `pg_trgm` GIN indexes on `title` and `description` (search uses `ILIKE '%term%'`).

Guard trigger `BEFORE INSERT OR UPDATE` for non-admins:
- cannot change `seller_id`;
- can only set `status` to `pending`, `sold` or `archived` (never `approved` / `rejected`);
- can only set `moderation_note` to NULL (the frontend clears it on resubmission).

### product_images
`id`, `product_id uuid not null references products(id) on delete cascade`, `path text not null` (storage object path, **not** a URL), `position int not null default 0`, `created_at`. Index `(product_id, position)`.
Max 5 images per product (enforce in a trigger; the frontend also checks).

### orders
`id`, `buyer_id uuid not null references profiles(id)`, `seller_id uuid not null references profiles(id)`,
`status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled'))`,
`total numeric(12,2) not null`, `note text`, `created_at`, `updated_at`. Check `buyer_id <> seller_id`.
Constraint names must be `orders_buyer_id_fkey` and `orders_seller_id_fkey`. Indexes on `buyer_id`, `seller_id`, `(status)`.
No direct client writes (use `place_order` / `update_order_status`).

### order_items
`id`, `order_id uuid not null references orders(id) on delete cascade`, `product_id uuid references products(id) on delete set null`,
`title text not null` (snapshot), `unit_price numeric(12,2) not null` (snapshot), `quantity int not null check (quantity > 0)`.

### saved_products
`user_id uuid references profiles(id) on delete cascade`, `product_id uuid references products(id) on delete cascade`, `created_at`, `primary key (user_id, product_id)`.
Users manage only their own rows. Creating a saved row requires the product to be visible to them.

### seller_applications
`id`, `user_id uuid not null references profiles(id) on delete cascade` (constraint `seller_applications_user_id_fkey`), `business_name text`, `description text`,
`categories_text text`, `phone text`, `status text not null default 'pending' check (status in ('pending','approved','rejected'))`,
`admin_note text`, `reviewed_by uuid references profiles(id)`, `reviewed_at timestamptz`, `created_at`.
Partial unique index: one `pending` application per user. Users can INSERT (with `user_id = auth.uid()` and `status = 'pending'` only) and SELECT their own.

### notifications
`id`, `user_id uuid not null references profiles(id) on delete cascade`, `title text not null`, `body text`, `link text` (internal path starting with `/`), `is_read boolean not null default false`, `created_at`.
Index `(user_id, is_read, created_at desc)`. Users SELECT their own and UPDATE only `is_read` on their own rows (`GRANT UPDATE (is_read)`). Rows are created by the SQL functions in section 4 (security definer), never by clients.

### support_messages
`id`, `name text`, `email text`, `subject text`, `message text`, `created_at`. Length CHECKs (name <= 80, email <= 254, subject <= 120, message <= 2000).
`anon` and `authenticated` can INSERT only; admins can SELECT. Nobody can UPDATE or DELETE via the API.

### Views
**`seller_public`** (`id, display_name, avatar_url, bio, created_at`): rows from `profiles` that have the `seller` role, `display_name = full_name`. Readable by `anon` and `authenticated`.
It must never expose email, phone, WhatsApp, hostel or any other private field. Create it so it runs with the owner's rights (not `security_invoker`) and grant SELECT explicitly.

---

## 4. Functions (RPC)

All `SECURITY DEFINER`, `SET search_path = ''`, every object schema-qualified. Because Postgres grants EXECUTE to `PUBLIC` by default,
every function must start with `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated;` and then grant only to the roles listed.
Errors are raised with `RAISE EXCEPTION '<token>'`; the frontend matches on these **exact tokens** in `error.message`.

### Helpers
| Function | Callers | Notes |
| --- | --- | --- |
| `is_admin(uid uuid default auth.uid()) returns boolean` | authenticated | role lookup |
| `is_seller(uid uuid default auth.uid()) returns boolean` | authenticated | role lookup |
| `has_active_membership(uid uuid default auth.uid()) returns boolean` | authenticated | exact rule in `membership_entitlements`; also false when `profiles.is_suspended` |
| `get_free_slots_remaining() returns int` | anon, authenticated | `free_slot_limit - count(free_lifetime)`, never below 0 |

### Membership allocation
`claim_free_slot(p_user_id uuid) returns boolean` is internal and called only by `review_seller_application` after the seller role is inserted. It requires an approved seller, a non-suspended profile and no existing entitlement. Under a fixed advisory transaction lock it counts seller `free_lifetime` rows, stops at `free_slot_limit`, then inserts the next slot. Auth signup and email-confirmation triggers never allocate slots.

### Payments  (the Paystack flow depends on these)

**`create_pending_payment(p_reference text, p_amount_kobo int) returns uuid`**  : callers: `authenticated`
- `auth.uid()` required, else `not_authenticated`.
- `p_reference` must match `^ABSU-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, else `invalid_reference`.
- `p_amount_kobo` must equal `membership_price_kobo`, else `invalid_amount`.
- Caller must have a verified email (`email_confirmed_at is not null`), else `email_not_verified`.
- If the caller has an active `free_lifetime` entitlement: raise `already_free`.
- Insert `payments(user_id = auth.uid(), reference, amount_kobo, status='pending', purpose='membership')`. Return its id.

**`apply_membership_payment(p_reference text, p_amount_kobo int, p_currency text, p_paystack_transaction_id text, p_paid_at timestamptz, p_metadata_user_id uuid, p_raw jsonb) returns jsonb`**  : callers: **`service_role` ONLY**
Idempotent per reference. In ONE transaction:
1. `SELECT ... FROM payments WHERE reference = p_reference FOR UPDATE`. Not found: raise `unknown_reference`.
2. If `p_metadata_user_id` is not null and differs from `payments.user_id`: raise `user_mismatch`.
3. If `p_amount_kobo <> payments.amount_kobo`, or `<> membership_price_kobo`, or `p_currency <> 'NGN'`: raise `amount_mismatch`.
4. If `payments.status = 'success'`: return `{"applied": false, "duplicate": true, "user_id": ..., "paid_until": ...}` and change nothing.
5. If `payments.status = 'refunded'`: raise `payment_refunded`.
6. If the user is an active free lifetime member (race: got a slot after starting checkout): mark the payment `success`, store `raw`, do NOT touch the entitlement, return `{"applied": false, "duplicate": false, "reason": "already_free", ...}`. (The admin refunds manually.)
7. Otherwise: upsert `membership_entitlements` as `kind='paid', status='active'`, `paid_until = greatest(now(), coalesce(paid_until, now())) + membership_period_days days`. Set payment `status='success'`, `paid_at`, `paystack_transaction_id`, `raw`. Insert a `subscriptions` row (`source='paystack'`, `period_start = greatest(now(), old paid_until)`, `period_end = new paid_until`). Insert a notification ("Membership active until ..."). Return `{"applied": true, "duplicate": false, "user_id": ..., "paid_until": ...}`.
Payments in `pending`, `failed` or `abandoned` may all become `success` (a customer can re-open an old checkout and pay).

**`mark_payment_status(p_reference text, p_status text, p_raw jsonb) returns void`**  : callers: **`service_role` ONLY**
Only allowed targets: `failed`, `abandoned`. Only changes rows currently `pending` (never touches `success`/`refunded`; may move `abandoned`->`failed`). Stores `raw`. Unknown reference: no-op.

**`admin_extend_membership(p_user_id uuid, p_days int, p_reason text) returns void`**  : callers: `authenticated`, then `is_admin()` check inside else `forbidden`
`p_days` between 1 and 366. Not allowed for `free_lifetime` users (raise `already_free`). Extends `paid_until` like a payment and inserts a `subscriptions` row with `source='admin'`, `payment_id = null`.

### Orders
**`place_order(p_product_id uuid, p_quantity int, p_note text) returns uuid`**  : `authenticated`. Lock the product row `FOR UPDATE`. Raise, in this order:
`not_authenticated`, `account_suspended`, `not_available` (product missing or not `approved`), `own_product`, `out_of_stock` (`quantity > products.quantity` or `p_quantity < 1`). Buyer order requests never require seller membership.
On success: decrement `products.quantity` by `p_quantity`; insert `orders` (`total = price * qty`) and one `order_items` snapshot (`title`, `unit_price`); notify the seller (link `/seller/orders`); return the order id.

**`update_order_status(p_order_id uuid, p_status text) returns void`**  : `authenticated`.
Allowed transitions: buyer: `pending -> cancelled`. Seller: `pending -> confirmed | cancelled`, `confirmed -> completed | cancelled`. Anything else: `forbidden` or `invalid_transition`.
Moving to `cancelled` restores the item quantities to the product (only if the order was not already cancelled). Notify the other party.

### Seller, moderation, admin
**`get_seller_contact(p_product_id uuid) returns table(whatsapp text, phone text, full_name text)`** : `anon`, `authenticated`. Returns only the seller's WhatsApp number (phone output is NULL) and display name for an approved product whose seller is not suspended. This is intentionally public so buyers can contact sellers without accounts or fees. Never exposes email.

**`review_seller_application(p_application_id uuid, p_approve boolean, p_note text) returns void`**  : `is_admin()` else `forbidden`. Only `pending` applications. Updates status, `admin_note`, `reviewed_by/at`. On approve: insert the `seller` role and call `claim_free_slot` in the same transaction. The first 50 approved sellers get lifetime-free access; later sellers pay NGN 1,500 per 30 days. Notify the applicant with the correct seller-access status.

**`moderate_product(p_product_id uuid, p_status text, p_note text) returns void`**  : `is_admin()`. `p_status` in `approved | rejected | archived`. Rejecting requires a non-empty note (`note_required`). Stores `moderation_note`. Notifies the seller (link `/seller/products`).

**`admin_set_suspended(p_user_id uuid, p_suspended boolean) returns void`**  : `is_admin()`; cannot target yourself (`forbidden`). Sets `profiles.is_suspended`. Recommended: also set `auth.users.banned_until` (`'infinity'` / null) so existing sessions cannot refresh.

**`admin_stats() returns jsonb`**  : `is_admin()`. Object with EXACTLY these numeric keys:
`users, verified_users, sellers, free_members, paid_members, free_slots_remaining, products_total, products_pending, orders_total, orders_completed, revenue_kobo, pending_applications`.
(`paid_members` = paid kind with `paid_until > now()`; `revenue_kobo` = sum of `payments.amount_kobo` where `status='success'`.)

---

## 5. Row Level Security matrix

RLS is enabled on **every** table in `public`. No table is readable by `anon` unless stated.

| Table | anon | authenticated (own) | admin |
| --- | --- | --- | --- |
| profiles | none | select/update own (column grants); select counterparties in shared orders | select all |
| user_roles | none | select own | select all |
| membership_entitlements | none | select own | select all |
| payments | none | select own | select all |
| subscriptions | none | select own | select all |
| categories | select `is_active` | same | all (insert/update/delete) |
| products | select `status='approved'` | + own rows (any status); insert/update/delete own if seller AND active member | select all; changes via `moderate_product` |
| product_images | select where parent visible | insert/delete for own products | select all; delete any |
| orders / order_items | none | select where buyer or seller; buyer order requests do not require membership | select all |
| saved_products | none | all on own rows | none |
| seller_applications | none | insert own pending, select own | select all |
| notifications | none | select own, update `is_read` | none |
| support_messages | insert only | insert only | select |
| app_settings | none | select | none |

Also: a suspended user (`is_suspended`) loses all write access (fold this into `has_active_membership` and the write policies).

---

## 6. Storage

Bucket **`product-images`**: public read, `file_size_limit` 5 MB, `allowed_mime_types` `image/jpeg, image/png, image/webp`.
Object path convention (the frontend relies on it): `{user_id}/{product_id}/{random-uuid}.jpg`.
Policies on `storage.objects` for this bucket:
- INSERT: `auth.uid()::text = (storage.foldername(name))[1]` AND `is_seller()` AND `has_active_membership()` (seller access required).
- UPDATE/DELETE: same folder rule (owner), or `is_admin()`.
- SELECT: public bucket (anyone can read by URL).
The frontend stores only `path` in `product_images.path` and builds `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`.

---

## 7. Auth configuration (Supabase dashboard)

- **Email confirmations: ON** (required, so only verified users can log in and claim slots).
- **Site URL**: the production URL. **Redirect URLs**: `https://<domain>/auth/callback`, `http://localhost:3000/auth/callback`, and the Vercel preview pattern if used.
- **Email templates** (recommended, so verification works even when the link opens in another browser or the Gmail in-app browser). Use the `token_hash` form, which the frontend's `/auth/callback` supports:
  - Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=%2Fdashboard%3Fverified%3D1`
  - Reset password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=%2Freset-password`
- **Custom SMTP** before launch. Supabase's built-in email is rate limited to a handful of emails per hour and will break signup for real users.
- Password minimum length 8. Leave "secure password change" on.

---

## 8. Environment variables the frontend reads

| Variable | Where | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | no (protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (Paystack callback + webhook) | **yes** |
| `NEXT_PUBLIC_SITE_URL` | browser + server | no |
| `PAYSTACK_SECRET_KEY` | server only | **yes** (the only thing added last) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | optional | no |

---

## 9. Inventory of queries the frontend makes (for verification)

Direct table access as the logged-in user (RLS must allow exactly this):
`user_roles` (select own) · `profiles` (select own, update own, insert never) · `membership_entitlements` (select own) ·
`payments` (select own, admin select all) · `categories` (select, admin insert/update) · `products` (select incl. embeds
`categories(id,name,slug)` and `product_images(id,product_id,path,position)`; owner insert/update/delete) ·
`product_images` (owner insert/delete) · `saved_products` (own select/insert/delete; embed `products(...)`) ·
`orders` (select with embeds `order_items(...)`, `buyer:profiles!orders_buyer_id_fkey(full_name)`, `seller:profiles!orders_seller_id_fkey(full_name)`) ·
`seller_applications` (own select/insert; admin select with embed `profiles:profiles!seller_applications_user_id_fkey(full_name)`) ·
`notifications` (own select, update `is_read`) · `support_messages` (insert; admin select) ·
`profiles` for admin with embeds `user_roles(role)` and `membership_entitlements(kind,status,paid_until,free_slot_number)` and filter on `full_name`, `email`, `phone` ·
`payments` for admin with embed `profiles:profiles!payments_user_id_fkey(full_name)` ·
view `seller_public` · storage bucket `product-images`.

RPC calls: `get_free_slots_remaining`, `create_pending_payment` (user), `apply_membership_payment` and `mark_payment_status` (service role),
`place_order`, `update_order_status`, `get_seller_contact`, `review_seller_application`, `moderate_product`, `admin_set_suspended`, `admin_extend_membership`, `admin_stats`.
