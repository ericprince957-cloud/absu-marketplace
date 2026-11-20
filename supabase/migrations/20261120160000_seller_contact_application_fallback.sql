-- Use the contact number the seller supplied in their approved seller application
-- when the legacy profile has no WhatsApp or phone value.
create or replace function public.get_seller_contact(p_product_id uuid)
returns table(whatsapp text,phone text,full_name text)
language sql stable security definer set search_path=''
as $function$
  select coalesce(
    nullif(trim(p.whatsapp),''),
    nullif(trim(p.phone),''),
    nullif(trim(sa.phone),'')
  ), null::text, p.full_name
  from public.products pr
  join public.profiles p on p.id=pr.seller_id
  join public.user_roles r on r.user_id=p.id and r.role='seller'
  left join lateral (
    select a.phone
    from public.seller_applications a
    where a.user_id=p.id and a.status='approved'
    order by a.reviewed_at desc nulls last, a.created_at desc
    limit 1
  ) sa on true
  where pr.id=p_product_id
    and pr.status='approved'
    and not p.is_suspended
$function$;

revoke execute on function public.get_seller_contact(uuid) from public;
grant execute on function public.get_seller_contact(uuid) to anon, authenticated;
