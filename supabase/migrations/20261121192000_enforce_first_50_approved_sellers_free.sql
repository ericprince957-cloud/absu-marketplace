-- First 50 approved sellers receive lifetime-free access.
-- No payment record is created while a free slot remains.
create or replace function public.claim_free_slot(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare lim integer; next_slot integer;
begin
  perform pg_advisory_xact_lock(812202650);
  if p_user_id is null
     or not public.is_seller(p_user_id)
     or exists(select 1 from public.profiles where id=p_user_id and is_suspended)
  then return false; end if;

  if exists(select 1 from public.membership_entitlements
            where user_id=p_user_id and kind='free_lifetime' and status='active')
  then return true; end if;

  if exists(select 1 from public.payments
            where user_id=p_user_id and purpose='membership' and status='success')
  then return false; end if;

  -- Remove stale admin/test membership grants that have no successful payment.
  delete from public.subscriptions
  where user_id=p_user_id and source='admin' and payment_id is null;
  delete from public.membership_entitlements
  where user_id=p_user_id and kind='paid';

  select coalesce((select (value#>>'{}')::integer from public.app_settings
                   where key='free_slot_limit'),50) into lim;
  select slot_no into next_slot
  from generate_series(1,lim) as slot_no
  where not exists (
    select 1 from public.membership_entitlements e
    where e.kind='free_lifetime' and e.free_slot_number=slot_no and e.status='active'
  )
  order by slot_no limit 1;

  if next_slot is null then return false; end if;
  insert into public.membership_entitlements(user_id,kind,status,free_slot_number,paid_until)
  values(p_user_id,'free_lifetime','active',next_slot,null)
  on conflict(user_id) do update set
    kind='free_lifetime',status='active',free_slot_number=excluded.free_slot_number,
    paid_until=null,updated_at=now();
  return true;
end
$function$;

create or replace function public.create_pending_payment(p_reference text, p_amount_kobo integer)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare uid uuid; confirmed timestamptz; expected integer; result_id uuid;
begin
  uid := (select auth.uid());
  if uid is null then raise exception 'not_authenticated'; end if;
  if not public.is_seller(uid) then raise exception 'seller_only'; end if;
  if exists(select 1 from public.profiles where id=uid and is_suspended) then raise exception 'account_suspended'; end if;
  if p_reference !~ '^ABSU-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'invalid_reference'; end if;
  select email_confirmed_at into confirmed from auth.users where id=uid;
  if confirmed is null then raise exception 'email_not_verified'; end if;

  -- Award any remaining free place first; never create a checkout while one remains.
  if public.claim_free_slot(uid) then raise exception 'free_access_awarded'; end if;

  select (value#>>'{}')::integer into expected from public.app_settings where key='membership_price_kobo';
  if p_amount_kobo is distinct from expected then raise exception 'invalid_amount'; end if;
  insert into public.payments(user_id,reference,amount_kobo,status,purpose)
  values(uid,p_reference,p_amount_kobo,'pending','membership') returning id into result_id;
  return result_id;
end
$function$;

create or replace function public.admin_extend_membership(p_user_id uuid, p_days integer, p_reason text)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare start_at timestamptz; finish_at timestamptz; remaining integer;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_days<1 or p_days>366 then raise exception 'invalid_days'; end if;
  if exists(select 1 from public.membership_entitlements where user_id=p_user_id and kind='free_lifetime') then raise exception 'already_free'; end if;
  select public.get_free_slots_remaining() into remaining;
  if remaining>0 then
    if public.is_seller(p_user_id) and public.claim_free_slot(p_user_id) then return; end if;
    raise exception 'free_slots_must_be_used_before_paid_admin_grants';
  end if;
  select greatest(now(),coalesce(paid_until,now())) into start_at
  from public.membership_entitlements where user_id=p_user_id and kind='paid';
  if start_at is null then start_at:=now(); end if;
  finish_at:=start_at+make_interval(days=>p_days);
  insert into public.membership_entitlements(user_id,kind,status,paid_until)
  values(p_user_id,'paid','active',finish_at)
  on conflict(user_id) do update set kind='paid',status='active',
    free_slot_number=null,paid_until=finish_at,updated_at=now();
  insert into public.subscriptions(user_id,source,period_start,period_end)
  values(p_user_id,'admin',start_at,finish_at);
  insert into public.notifications(user_id,title,body,link)
  values(p_user_id,'Membership extended',coalesce(p_reason,'Your membership was extended.'),'/dashboard/membership');
end
$function$;
