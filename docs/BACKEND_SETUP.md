# Supabase backend setup and handover

## Existing deployed project

The ABSU Marketplace backend was rebuilt directly in the Supabase project below and smoke-tested. This section records the deployed state so a future operator does not mistake the project for an empty database.

| Setting | Value |
| --- | --- |
| Project ref | `inrwfjubwumvtbviuwek` |
| Project URL | `https://inrwfjubwumvtbviuwek.supabase.co` |
| Region | `eu-west-2` |
| Database | PostgreSQL 17 |

The live backend has these 15 public tables:

1. `profiles`
2. `user_roles`
3. `app_settings`
4. `membership_entitlements`
5. `payments`
6. `subscriptions`
7. `categories`
8. `products`
9. `product_images`
10. `orders`
11. `order_items`
12. `saved_products`
13. `seller_applications`
14. `notifications`
15. `support_messages`

RLS is enabled on all 15 tables. The project also has the `product-images` storage bucket, the `seller_public` view, membership/payment/order/seller/admin RPCs, and auth triggers. The configured membership is NGN 1,500 (150,000 kobo) for 30 days, with 50 lifetime free allocations assigned after email verification.

Seven active categories were seeded: Textbooks and Notes, Electronics, Phones and Accessories, Fashion, Food and Snacks, Hostel Essentials, and Services. The app settings contain the free-slot limit, membership price, duration and currency. No fake users, products, orders or payments were seeded.

## Deployed migration history

The following migration records were applied to the live project during the rebuild:

- `20261119130548_absu_option_b_schema_reset`
- `20261119130656_absu_option_b_security_and_marketplace_functions`
- `20261119130748_absu_option_b_privilege_and_index_hardening`
- `20261119130828_absu_option_b_remove_legacy_objects`
- `20261119130857_absu_option_b_function_grants_final`
- `20261119130914_absu_option_b_split_anon_authenticated_policies`

The deployed smoke checks confirmed the 15 tables, RLS coverage, seven active categories, 50 free slots, membership price/duration, critical service-role-only payment grants, and removal of legacy public tables. Anonymous read checks returned only public-safe marketplace data.

## Important repository limitation

The SQL migration source files were not committed to this GitHub repository during the live rebuild. The migration identifiers above are the recorded live history, **not SQL source files**. Do not create pretend migrations from memory and claim they are byte-for-byte identical to production.

The repository now includes an idempotent reference seed at `supabase/seed.sql` and a read-only assertion script at `supabase/tests/backend_contract_smoke.sql`. These files are useful after the reviewed schema exists, but they do not replace the missing schema/function/policy migrations. The smoke script has been committed but has not been executed against the live database in this GitHub-only work.

Before using this repository to provision a brand-new Supabase project:

1. Have an operator with access to the live Supabase project retrieve the actual migration SQL or reconstruct it from the live schema and function definitions.
2. Compare every table, constraint, index, trigger, function, grant, RLS policy, view and storage policy against [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md).
3. Commit reviewed migration SQL under `supabase/migrations/` in timestamp order.
4. Add idempotent category/settings seed SQL and a smoke-test SQL file.
5. Test the migration sequence against a separate disposable Supabase project before using it anywhere important.

**Never run a schema-reset migration against the existing live project as part of routine deployment.** The existing project already contains the deployed backend.

## First administrator

Admin access is granted through the database role table, not through a frontend password or registration field.

1. Register the founder's real account through the application.
2. Confirm the email and sign in.
3. Obtain that account's actual UUID from Supabase Authentication > Users.
4. As the database owner, grant the admin role using the actual UUID:

```sql
insert into public.user_roles (user_id, role)
values ('REPLACE_WITH_THE_REAL_AUTH_USER_UUID', 'admin')
on conflict (user_id, role) do nothing;
```

5. Sign out and back in, then verify that the admin dashboard opens.
6. Verify a normal student account cannot access admin pages or admin RPCs.

Do not guess, hardcode, or publish a user's UUID. Do not grant admin to an unverified or unknown account.

## Auth dashboard configuration still needs owner verification

The database rebuild does not prove that all Supabase dashboard settings are complete. Check these directly:

- Email confirmation is enabled.
- Site URL is the production HTTPS URL.
- Redirect allow-list includes the production `/auth/callback` and local `http://localhost:3000/auth/callback`.
- Signup and password-recovery templates use the supported token-hash callback URLs in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md).
- Custom SMTP is configured and tested with an actual inbox.
- Password minimum is at least 8 characters.

## Backend contract

The exact expected schema and frontend interface is documented in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md). If the live database and contract differ, stop and reconcile the discrepancy before launch. Do not silently change only the database or only the frontend.
