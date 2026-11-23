-- Verified seller accounts publish listings immediately; admins retain takedown controls.
alter table public.products alter column status set default 'approved';

create or replace function public.guard_product_write()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.seller_id <> (select auth.uid())
         or not public.is_seller()
         or not public.has_active_membership()
      then
        raise exception 'membership_required';
      end if;

      if not exists (
        select 1 from auth.users u
        where u.id = (select auth.uid())
          and u.email_confirmed_at is not null
      ) then
        raise exception 'email_not_verified';
      end if;

      new.status := 'approved';
      new.moderation_note := null;
    else
      if new.seller_id <> old.seller_id then
        raise exception 'forbidden';
      end if;

      if not public.is_seller(old.seller_id)
         or not public.has_active_membership(old.seller_id)
      then
        raise exception 'membership_required';
      end if;

      if not exists (
        select 1 from auth.users u
        where u.id = old.seller_id
          and u.email_confirmed_at is not null
      ) then
        raise exception 'email_not_verified';
      end if;

      if new.status not in ('approved', 'sold', 'archived') then
        raise exception 'forbidden';
      end if;

      new.moderation_note := null;
    end if;
  end if;

  return new;
end
$function$;

update public.products
set status = 'approved', moderation_note = null
where status = 'pending';
