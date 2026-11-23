-- Verify email ownership inside the trusted trigger instead of relying on optional JWT claims.
drop policy if exists product_comments_verified_insert on public.product_comments;
create policy product_comments_verified_insert
  on public.product_comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.is_suspended = false
    )
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'approved'
    )
  );

create or replace function public.set_product_comment_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from auth.users u
    where u.id = new.author_id
      and u.email_confirmed_at is not null
  ) then
    raise exception 'email_verification_required';
  end if;

  select coalesce(
    nullif(btrim(p.full_name), ''),
    nullif(btrim(p.username), ''),
    'ABSU student'
  )
  into new.author_name
  from public.profiles p
  where p.id = new.author_id;

  if new.author_name is null then
    new.author_name := 'ABSU student';
  end if;

  new.body := btrim(new.body);
  return new;
end;
$$;

revoke all on function public.set_product_comment_author_name() from public, anon, authenticated;
