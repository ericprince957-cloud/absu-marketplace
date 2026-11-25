# Supabase migration reconciliation

**Project:** `absu-marketplace` (`inrwfjubwumvtbviuwek`)  
**Checked:** 2026-11-25  
**Scope:** Documentation only. No production migration was applied by this reconciliation.

## Findings

- Production records **30 applied migrations** in `supabase_migrations.schema_migrations`.
- The repository has **14 older migration files plus** `20261125110000_phase0_fix_notifications_requests_and_exposure.sql`; the repository timestamps do not consistently match production.
- Production includes bootstrap, `option_b_*`, and item-request migration entries that are not present as matching timestamped files in the repository.
- `20261124101500_order_delivery_address_and_whatsapp_followup.sql` is present in the repository but is not in the production migration history. The live database already has `orders.delivery_address` and the four-argument `place_order(uuid, integer, text, text)`; this is consistent with a change applied outside the migration tracker, but the exact execution source is not proven.
- Phase 0 migration is present on `main` and is **not** in the production migration history. It must only be applied after a current backup is confirmed and the complete SQL has been reviewed.

## Production migration history

The following entries were read from the production migration ledger. "Ledger only" means no same-version repository file was confirmed in the repository inventory available during this review; it does not prove that no older differently named equivalent exists.

| Production version | Recorded name | Repository comparison | Status |
|---|---|---|---|
| 20261117160556 | absu_marketplace_backend_bootstrap | No same-version file confirmed | Ledger only |
| 20261117160620 | secure_membership_and_payment_finalization | No same-version file confirmed | Ledger only |
| 20261117160639 | membership_active_consistency | No same-version file confirmed | Ledger only |
| 20261117160720 | marketplace_foreign_key_indexes | No same-version file confirmed | Ledger only |
| 20261119130548 | absu_option_b_schema_reset | No same-version file confirmed | Ledger only |
| 20261119130656 | absu_option_b_security_and_marketplace_functions | No same-version file confirmed | Ledger only |
| 20261119130748 | absu_option_b_privilege_and_index_hardening | No same-version file confirmed | Ledger only |
| 20261119130828 | absu_option_b_remove_legacy_objects | No same-version file confirmed | Ledger only |
| 20261119130857 | absu_option_b_function_grants_final | No same-version file confirmed | Ledger only |
| 20261119130914 | absu_option_b_split_anon_authenticated_policies | No same-version file confirmed | Ledger only |
| 20261120112817 | seller_verification_requirements | No same-version file confirmed | Ledger only |
| 20261120112934 | seller_verification_approval_guard | No same-version file confirmed | Ledger only |
| 20261120113329 | lightweight_seller_onboarding_and_reports | No same-version file confirmed | Ledger only |
| 20261120124753 | buyer_free_seller_paid_access | No same-version file confirmed | Ledger only |
| 20261120125309 | seller_contact_application_fallback | No same-version file confirmed | Ledger only |
| 20261121181229 | enforce_first_50_approved_sellers_free | Repo has differently timestamped equivalent: `20261121192000_enforce_first_50_approved_sellers_free.sql` | Applied under different version |
| 20261121181314 | fix_free_slot_number_selection_and_active_count | No same-version file confirmed | Ledger only |
| 20261121181352 | prevent_checkout_before_free_slots_without_rollback | No same-version file confirmed | Ledger only |
| 20261121200310 | grant_profile_self_update_columns | No same-version file confirmed | Ledger only |
| 20261122141502 | campus_discovery_academic_tags_and_item_requests | Item-request changes reported absent from matching repo history | Ledger only / reconcile source |
| 20261122141635 | secure_item_request_response_contact | No same-version file confirmed | Ledger only |
| 20261122141719 | notify_sellers_about_item_requests | No same-version file confirmed | Ledger only |
| 20261122141817 | require_academic_details_for_study_materials | No same-version file confirmed | Ledger only |
| 20261122141902 | include_lab_coats_in_academic_metadata | No same-version file confirmed | Ledger only |
| 20261122141944 | match_item_requests_to_seller_categories | No same-version file confirmed | Ledger only |
| 20261123182349 | verified_seller_auto_publish_products | No same-version file confirmed | Ledger only |
| 20261123184832 | notifications_and_product_view_milestones | No same-version file confirmed | Ledger only |
| 20261123184905 | lock_notification_helper_functions | No same-version file confirmed | Ledger only |
| 20261123192925 | product_comments | No same-version file confirmed | Ledger only |
| 20261123193128 | product_comments_email_verification_guard | No same-version file confirmed | Ledger only |

## Repository files needing special handling

| Repository file | Production ledger / live schema evidence | Status |
|---|---|---|
| `20261121192000_enforce_first_50_approved_sellers_free.sql` | Production ledger has `20261121181229_enforce_first_50_approved_sellers_free` | Do not re-run; map as an already-applied equivalent after SQL equivalence review |
| `20261124101500_order_delivery_address_and_whatsapp_followup.sql` | No matching ledger entry; `orders.delivery_address` and four-argument `place_order` already exist | Likely manually applied; do not re-run until its exact SQL is compared with live definitions |
| `20261125110000_phase0_fix_notifications_requests_and_exposure.sql` | No matching ledger entry | Pending review, backup confirmation, application and verification |

## Safe reconciliation plan

1. **Do not re-run historical migrations.** Production already contains their effects and data must be preserved.
2. Compare every repository migration's SQL with the live object definitions before assigning any historical migration version as applied.
3. For a file whose exact effects are already present, use `supabase migration repair` only after confirming the correct version and equivalence. Repair updates migration bookkeeping; it does not apply the SQL.
4. For the delivery-address migration, compare the file against `pg_get_functiondef`, `information_schema.columns`, and constraints before deciding whether its version should be marked applied.
5. Apply Phase 0 as a new additive migration only after backup confirmation. Its migration version must be `20261125110000`, matching the file name, and the production ledger must be checked immediately afterwards.
6. Restore a canonical, complete migration history in the repository in a separate reviewed PR. Reconstruct missing historical files from audited production definitions or retain clearly labelled archival SQL; never invent SQL from migration names.
7. Keep the first-50-free-sellers rule and NGN 1,500 / 30-day price unchanged.

## Operational caution

A matching object in the live schema is not sufficient proof that an entire migration ran. A migration may contain multiple statements, triggers, grants, policies, or data changes. Mark a version as applied only after comparing the full migration contents and all resulting objects.
