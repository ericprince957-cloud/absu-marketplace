-- Admin-only, free-slot-only grant. Never falls back to paid membership.
create or replace function public.admin_grant_free_slot(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare assigned_slot integer;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_user_id is null then raise exception 'invalid_user'; end if;
  if exists(select 1 from public.profiles where id=p_user_id and is_suspended) then
    raise exception 'account_suspended';
  end if;
  if not public.is_seller(p_user_id) then
    raise exception 'seller_application_must_be_approved_first';
  end if;
  if exists(select 1 from public.membership_entitlements where user_id=p_user_id and kind='free_lifetime' and status='active') then
    raise exception 'already_free';
  end if;
  if not public.claim_free_slot(p_user_id) then
    raise exception 'no_free_slots_or_user_not_eligible';
  end if;
  select free_slot_number into assigned_slot
  from public.membership_entitlements
  where user_id=p_user_id and kind='free_lifetime' and status='active';
  insert into public.notifications(user_id,title,body,link)
  values(p_user_id,'Lifetime-free seller access granted','An administrator granted you lifetime-free seller access. You can now list products.','/seller');
  return assigned_slot;
end
$function$;
revoke execute on function public.admin_grant_free_slot(uuid) from public, anon;
grant execute on function public.admin_grant_free_slot(uuid) to authenticated;
