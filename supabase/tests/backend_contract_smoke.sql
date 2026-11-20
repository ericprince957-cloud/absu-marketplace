-- ABSU Marketplace backend contract smoke test.
-- Run in Supabase SQL Editor after applying the reviewed migrations and seed.sql.
-- This is a read-only assertion script: it raises an exception if a contract check fails.

do $$
declare
  required_tables text[] := array[
    'profiles',
    'user_roles',
    'app_settings',
    'membership_entitlements',
    'payments',
    'subscriptions',
    'categories',
    'products',
    'product_images',
    'orders',
    'order_items',
    'saved_products',
    'seller_applications',
    'seller_reports',
    'notifications',
    'support_messages'
  ];
  table_name text;
  missing_tables text[] := '{}';
  rls_disabled text[] := '{}';
  active_categories integer;
  free_limit integer;
  price_kobo integer;
  period_days integer;
begin
  foreach table_name in array required_tables loop
    if to_regclass(format('public.%I', table_name)) is null then
      missing_tables := array_append(missing_tables, table_name);
    elsif not (
      select c.relrowsecurity
      from pg_class c
      where c.oid = to_regclass(format('public.%I', table_name))
    ) then
      rls_disabled := array_append(rls_disabled, table_name);
    end if;
  end loop;

  if cardinality(missing_tables) > 0 then
    raise exception 'Missing contract tables: %', array_to_string(missing_tables, ', ');
  end if;
  if cardinality(rls_disabled) > 0 then
    raise exception 'RLS is disabled on: %', array_to_string(rls_disabled, ', ');
  end if;

  select count(*) into active_categories
  from public.categories
  where is_active = true;
  if active_categories < 7 then
    raise exception 'Expected at least 7 active starter categories; found %', active_categories;
  end if;

  select (value #>> '{}')::integer into free_limit
  from public.app_settings where key = 'free_slot_limit';
  select (value #>> '{}')::integer into price_kobo
  from public.app_settings where key = 'membership_price_kobo';
  select (value #>> '{}')::integer into period_days
  from public.app_settings where key = 'membership_period_days';

  if free_limit is distinct from 50 then
    raise exception 'free_slot_limit expected 50, found %', free_limit;
  end if;
  if price_kobo is distinct from 150000 then
    raise exception 'membership_price_kobo expected 150000, found %', price_kobo;
  end if;
  if period_days is distinct from 30 then
    raise exception 'membership_period_days expected 30, found %', period_days;
  end if;
  if (select value from public.app_settings where key = 'currency') is distinct from '"NGN"'::jsonb then
    raise exception 'currency setting must be NGN';
  end if;

  if to_regprocedure('public.get_free_slots_remaining()') is null
     or to_regprocedure('public.create_pending_payment(text,integer)') is null
     or to_regprocedure('public.apply_membership_payment(text,integer,text,text,timestamp with time zone,uuid,jsonb)') is null
     or to_regprocedure('public.mark_payment_status(text,text,jsonb)') is null
     or to_regprocedure('public.place_order(uuid,integer,text)') is null
     or to_regprocedure('public.update_order_status(uuid,text)') is null
     or to_regprocedure('public.get_seller_contact(uuid)') is null
     or to_regprocedure('public.review_seller_application(uuid,boolean,text)') is null
     or to_regprocedure('public.moderate_product(uuid,text,text)') is null
     or to_regprocedure('public.admin_set_suspended(uuid,boolean)') is null
     or to_regprocedure('public.admin_extend_membership(uuid,integer,text)') is null
     or to_regprocedure('public.admin_stats()') is null then
    raise exception 'One or more required backend RPC functions are missing';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.apply_membership_payment(text,integer,text,text,timestamp with time zone,uuid,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated must not execute apply_membership_payment';
  end if;
  if has_function_privilege(
    'anon',
    'public.mark_payment_status(text,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'anon must not execute mark_payment_status';
  end if;
  if not has_function_privilege('anon', 'public.get_free_slots_remaining()', 'EXECUTE') then
    raise exception 'anon must be able to execute get_free_slots_remaining';
  end if;
  if not has_function_privilege('anon', 'public.get_seller_contact(uuid)', 'EXECUTE') then
    raise exception 'anon buyers must be able to contact sellers without signing in';
  end if;
  if has_function_privilege('anon', 'public.claim_free_slot(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.claim_free_slot(uuid)', 'EXECUTE') then
    raise exception 'only seller approval may allocate free seller slots';
  end if;
  if position('claim_free_slot' in pg_get_functiondef('public.handle_auth_user_created()'::regprocedure)) > 0
     or position('claim_free_slot' in pg_get_functiondef('public.handle_auth_user_updated()'::regprocedure)) > 0 then
    raise exception 'signup and email verification must never allocate seller slots';
  end if;
  if position('claim_free_slot' in pg_get_functiondef('public.review_seller_application(uuid,boolean,text)'::regprocedure)) = 0 then
    raise exception 'seller approval must allocate lifetime-free seller slots';
  end if;
  if position('membership_required' in pg_get_functiondef('public.place_order(uuid,integer,text)'::regprocedure)) > 0 then
    raise exception 'buyer order requests must not require seller membership';
  end if;

  raise notice 'ABSU Marketplace backend contract smoke test passed';
end;
$$;
