-- Do not create a Paystack checkout while lifetime-free seller spots remain.
-- The slot is awarded only by review_seller_application; this function only guards checkout.
create or replace function public.create_pending_payment(p_reference text, p_amount_kobo integer)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare uid uuid; confirmed timestamptz; expected integer; result_id uuid; remaining integer;
begin
  uid := (select auth.uid());
  if uid is null then raise exception 'not_authenticated'; end if;
  if not public.is_seller(uid) then raise exception 'seller_only'; end if;
  if exists(select 1 from public.profiles where id=uid and is_suspended) then raise exception 'account_suspended'; end if;
  if p_reference !~ '^ABSU-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'invalid_reference'; end if;
  select email_confirmed_at into confirmed from auth.users where id=uid;
  if confirmed is null then raise exception 'email_not_verified'; end if;

  if exists(select 1 from public.membership_entitlements
            where user_id=uid and kind='free_lifetime' and status='active')
  then raise exception 'already_free'; end if;

  select public.get_free_slots_remaining() into remaining;
  if remaining > 0 and not exists(
    select 1 from public.payments where user_id=uid and purpose='membership' and status='success'
  ) then
    raise exception 'free_slots_available';
  end if;

  select (value#>>'{}')::integer into expected from public.app_settings where key='membership_price_kobo';
  if p_amount_kobo is distinct from expected then raise exception 'invalid_amount'; end if;
  insert into public.payments(user_id,reference,amount_kobo,status,purpose)
  values(uid,p_reference,p_amount_kobo,'pending','membership') returning id into result_id;
  return result_id;
end
$function$;
