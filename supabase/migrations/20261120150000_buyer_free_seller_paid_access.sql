-- Buyer access is always free. Membership entitlements are seller-only.
-- Free launch slots are allocated atomically when an admin approves a seller.

create or replace function public.handle_auth_user_created()
returns trigger language plpgsql security definer set search_path=''
as $function$
begin
  insert into public.profiles(id,email,full_name,phone)
  values(new.id,new.email,nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'phone',''))
  on conflict(id) do update set email=excluded.email;
  insert into public.user_roles(user_id,role) values(new.id,'student') on conflict do nothing;
  return new;
end
$function$;

create or replace function public.handle_auth_user_updated()
returns trigger language plpgsql security definer set search_path=''
as $function$
begin
  if new.email is distinct from old.email then
    update public.profiles set email=new.email where id=new.id;
  end if;
  return new;
end
$function$;

create or replace function public.claim_free_slot(p_user_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $function$
declare lim int; used int;
begin
  perform pg_advisory_xact_lock(812202650);
  if p_user_id is null
     or not public.is_seller(p_user_id)
     or exists(select 1 from public.profiles where id=p_user_id and is_suspended)
     or exists(select 1 from public.membership_entitlements where user_id=p_user_id)
  then return false; end if;

  select coalesce((select (value#>>'{}')::int from public.app_settings where key='free_slot_limit'),50) into lim;
  select count(*)::int into used
  from public.membership_entitlements e
  join public.user_roles r on r.user_id=e.user_id and r.role='seller'
  where e.kind='free_lifetime';
  if used>=lim then return false; end if;

  insert into public.membership_entitlements(user_id,kind,status,free_slot_number)
  values(p_user_id,'free_lifetime','active',used+1)
  on conflict(user_id) do nothing;
  return found;
end
$function$;
revoke execute on function public.claim_free_slot(uuid) from public, anon, authenticated;

create or replace function public.get_free_slots_remaining()
returns integer language sql stable security definer set search_path=''
as $function$
  select greatest(
    0,
    coalesce((select (value#>>'{}')::int from public.app_settings where key='free_slot_limit'),50)
    - (select count(*)::int
       from public.membership_entitlements e
       join public.user_roles r on r.user_id=e.user_id and r.role='seller'
       where e.kind='free_lifetime')
  )
$function$;
revoke execute on function public.get_free_slots_remaining() from public;
grant execute on function public.get_free_slots_remaining() to anon, authenticated;

create or replace function public.has_active_membership(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=''
as $function$
  select coalesce((
    select not p.is_suspended
      and public.is_seller(p.id)
      and exists(
        select 1 from public.membership_entitlements e
        where e.user_id=p.id and e.status='active'
          and (e.kind='free_lifetime' or (e.kind='paid' and e.paid_until>now()))
      )
    from public.profiles p where p.id=uid
  ),false)
$function$;

create or replace function public.review_seller_application(p_application_id uuid,p_approve boolean,p_note text)
returns void language plpgsql security definer set search_path=''
as $function$
declare app public.seller_applications%rowtype;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select * into app from public.seller_applications where id=p_application_id for update;
  if not found or app.status<>'pending' then raise exception 'invalid_application'; end if;
  if p_approve and (
    app.business_name is null or length(trim(app.business_name))<2
    or app.description is null or length(trim(app.description))<10
    or app.phone is null or length(trim(app.phone))<10
    or app.location is null or length(trim(app.location))<2
    or not exists(select 1 from public.profiles p where p.id=app.user_id and p.full_name is not null and length(trim(p.full_name))>=2)
    or not exists(select 1 from auth.users u where u.id=app.user_id and u.email_confirmed_at is not null)
  ) then raise exception 'seller_details_required'; end if;

  update public.seller_applications
  set status=case when p_approve then 'approved' else 'rejected' end,
      admin_note=p_note, reviewed_by=(select auth.uid()), reviewed_at=now()
  where id=app.id;

  if p_approve then
    insert into public.user_roles(user_id,role) values(app.user_id,'seller') on conflict do nothing;
    -- The first 50 approved sellers receive a lifetime entitlement.
    perform public.claim_free_slot(app.user_id);
  end if;

  insert into public.notifications(user_id,title,body,link)
  values(app.user_id,'Seller application reviewed',
    case when p_approve then
      case when exists(select 1 from public.membership_entitlements e where e.user_id=app.user_id and e.kind='free_lifetime' and e.status='active')
        then 'Your seller application was approved. You have lifetime-free seller access.'
        else 'Your seller application was approved. Activate seller access for NGN 1,500 per 30 days to start listing.'
      end
    else coalesce(p_note,'Your seller application was rejected.') end,
    '/seller');
end
$function$;

create or replace function public.create_pending_payment(p_reference text,p_amount_kobo integer)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare uid uuid; confirmed timestamptz; expected int; result_id uuid;
begin
  uid:=(select auth.uid());
  if uid is null then raise exception 'not_authenticated'; end if;
  if not public.is_seller(uid) then raise exception 'seller_only'; end if;
  if exists(select 1 from public.profiles where id=uid and is_suspended) then raise exception 'account_suspended'; end if;
  if p_reference !~ '^ABSU-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'invalid_reference'; end if;
  select email_confirmed_at into confirmed from auth.users where id=uid;
  if confirmed is null then raise exception 'email_not_verified'; end if;
  select (value#>>'{}')::int into expected from public.app_settings where key='membership_price_kobo';
  if p_amount_kobo is distinct from expected then raise exception 'invalid_amount'; end if;
  if exists(select 1 from public.membership_entitlements where user_id=uid and kind='free_lifetime' and status='active') then raise exception 'already_free'; end if;
  insert into public.payments(user_id,reference,amount_kobo,status,purpose)
  values(uid,p_reference,p_amount_kobo,'pending','membership') returning id into result_id;
  return result_id;
end
$function$;

create or replace function public.apply_membership_payment(
  p_reference text,p_amount_kobo integer,p_currency text,p_paystack_transaction_id text,
  p_paid_at timestamptz,p_metadata_user_id uuid,p_raw jsonb
) returns jsonb language plpgsql security definer set search_path=''
as $function$
declare pay public.payments%rowtype; price int; until_at timestamptz; start_at timestamptz; days int;
begin
  select * into pay from public.payments where reference=p_reference for update;
  if not found then raise exception 'unknown_reference'; end if;
  if p_metadata_user_id is not null and p_metadata_user_id<>pay.user_id then raise exception 'user_mismatch'; end if;
  select (value#>>'{}')::int into price from public.app_settings where key='membership_price_kobo';
  if p_amount_kobo is distinct from pay.amount_kobo or p_amount_kobo is distinct from price or p_currency is distinct from 'NGN' then raise exception 'amount_mismatch'; end if;
  if pay.status='success' then
    select paid_until into until_at from public.membership_entitlements where user_id=pay.user_id;
    return jsonb_build_object('applied',false,'duplicate',true,'user_id',pay.user_id,'paid_until',until_at);
  end if;
  if pay.status='refunded' then raise exception 'payment_refunded'; end if;
  if not public.is_seller(pay.user_id) or exists(select 1 from public.profiles where id=pay.user_id and is_suspended) then
    raise exception 'seller_only';
  end if;
  if exists(select 1 from public.membership_entitlements where user_id=pay.user_id and kind='free_lifetime' and status='active') then
    update public.payments set status='success',paid_at=coalesce(p_paid_at,now()),paystack_transaction_id=p_paystack_transaction_id,raw=p_raw where id=pay.id;
    return jsonb_build_object('applied',false,'duplicate',false,'reason','already_free','user_id',pay.user_id);
  end if;
  select (value#>>'{}')::int into days from public.app_settings where key='membership_period_days';
  select greatest(now(),coalesce(paid_until,now())) into start_at
    from public.membership_entitlements where user_id=pay.user_id and kind='paid';
  if start_at is null then start_at:=now(); end if;
  until_at:=start_at + make_interval(days=>days);
  insert into public.membership_entitlements(user_id,kind,status,free_slot_number,paid_until)
  values(pay.user_id,'paid','active',null,until_at)
  on conflict(user_id) do update set kind='paid',status='active',free_slot_number=null,paid_until=until_at;
  update public.payments set status='success',paid_at=coalesce(p_paid_at,now()),paystack_transaction_id=p_paystack_transaction_id,raw=p_raw where id=pay.id;
  insert into public.subscriptions(user_id,payment_id,source,period_start,period_end)
  values(pay.user_id,pay.id,'paystack',start_at,until_at);
  insert into public.notifications(user_id,title,body,link)
  values(pay.user_id,'Seller access active','Your seller access is active until '||until_at::text,'/dashboard/membership');
  return jsonb_build_object('applied',true,'duplicate',false,'user_id',pay.user_id,'paid_until',until_at);
end
$function$;

create or replace function public.place_order(p_product_id uuid,p_quantity integer,p_note text)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare uid uuid; prod public.products%rowtype; oid uuid;
begin
  uid:=(select auth.uid());
  if uid is null then raise exception 'not_authenticated'; end if;
  if exists(select 1 from public.profiles where id=uid and is_suspended) then raise exception 'account_suspended'; end if;
  select * into prod from public.products where id=p_product_id for update;
  if not found or prod.status<>'approved' then raise exception 'not_available'; end if;
  if prod.seller_id=uid then raise exception 'own_product'; end if;
  if p_quantity<1 or p_quantity>prod.quantity then raise exception 'out_of_stock'; end if;
  update public.products set quantity=quantity-p_quantity where id=prod.id;
  insert into public.orders(buyer_id,seller_id,total,note)
  values(uid,prod.seller_id,prod.price*p_quantity,p_note) returning id into oid;
  insert into public.order_items(order_id,product_id,title,unit_price,quantity)
  values(oid,prod.id,prod.title,prod.price,p_quantity);
  insert into public.notifications(user_id,title,body,link)
  values(prod.seller_id,'New order','You received an order for '||prod.title,'/seller/orders');
  return oid;
end
$function$;

create or replace function public.get_seller_contact(p_product_id uuid)
returns table(whatsapp text,phone text,full_name text)
language sql stable security definer set search_path=''
as $function$
  select coalesce(p.whatsapp,p.phone), null::text, p.full_name
  from public.products pr
  join public.profiles p on p.id=pr.seller_id
  join public.user_roles r on r.user_id=p.id and r.role='seller'
  where pr.id=p_product_id and pr.status='approved' and not p.is_suspended
$function$;
revoke execute on function public.get_seller_contact(uuid) from public;
grant execute on function public.get_seller_contact(uuid) to anon, authenticated;

create or replace function public.guard_product_write()
returns trigger language plpgsql security definer set search_path=''
as $function$
begin
  if not public.is_admin() then
    if tg_op='INSERT' then
      if new.seller_id<>(select auth.uid()) or not public.is_seller() or not public.has_active_membership() then
        raise exception 'membership_required';
      end if;
      new.status:='pending'; new.moderation_note:=null;
    else
      if new.seller_id<>old.seller_id then raise exception 'forbidden'; end if;
      if not public.is_seller(old.seller_id) or not public.has_active_membership(old.seller_id) then
        raise exception 'membership_required';
      end if;
      if new.status not in ('pending','sold','archived') then raise exception 'forbidden'; end if;
      new.moderation_note:=null;
    end if;
  end if;
  return new;
end
$function$;

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path=''
as $function$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'users',(select count(*) from public.profiles),
    'verified_users',(select count(*) from auth.users where email_confirmed_at is not null),
    'sellers',(select count(distinct user_id) from public.user_roles where role='seller'),
    'free_members',(select count(*) from public.membership_entitlements e join public.user_roles r on r.user_id=e.user_id and r.role='seller' where e.kind='free_lifetime' and e.status='active'),
    'paid_members',(select count(*) from public.membership_entitlements e join public.user_roles r on r.user_id=e.user_id and r.role='seller' where e.kind='paid' and e.status='active' and e.paid_until>now()),
    'free_slots_remaining',public.get_free_slots_remaining(),
    'products_total',(select count(*) from public.products),
    'products_pending',(select count(*) from public.products where status='pending'),
    'orders_total',(select count(*) from public.orders),
    'orders_completed',(select count(*) from public.orders where status='completed'),
    'revenue_kobo',(select coalesce(sum(amount_kobo),0) from public.payments where status='success'),
    'pending_applications',(select count(*) from public.seller_applications where status='pending')
  );
end
$function$;

-- Legacy free entitlements belonging to buyers do not consume seller launch slots.
delete from public.membership_entitlements e
where e.kind='free_lifetime'
  and not exists(select 1 from public.user_roles r where r.user_id=e.user_id and r.role='seller');
