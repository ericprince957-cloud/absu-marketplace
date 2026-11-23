-- Comments for approved ABSU Trade listings.
create table if not exists public.product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'ABSU student',
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists product_comments_product_created_idx
  on public.product_comments (product_id, created_at desc);

alter table public.product_comments enable row level security;

grant select on public.product_comments to anon, authenticated;
grant insert, delete on public.product_comments to authenticated;

drop policy if exists product_comments_public_read on public.product_comments;
create policy product_comments_public_read
  on public.product_comments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'approved'
    )
  );

drop policy if exists product_comments_verified_insert on public.product_comments;
create policy product_comments_verified_insert
  on public.product_comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'email_verified'), 'false') = 'true'
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

drop policy if exists product_comments_owner_or_admin_delete on public.product_comments;
create policy product_comments_owner_or_admin_delete
  on public.product_comments for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.user_roles role
      where role.user_id = (select auth.uid()) and role.role = 'admin'
    )
  );

create or replace function public.set_product_comment_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select coalesce(
    nullif(btrim(full_name), ''),
    nullif(btrim(username), ''),
    'ABSU student'
  )
  into new.author_name
  from public.profiles
  where id = new.author_id;

  if new.author_name is null then
    new.author_name := 'ABSU student';
  end if;

  new.body := btrim(new.body);
  return new;
end;
$$;

drop trigger if exists product_comment_author_name on public.product_comments;
create trigger product_comment_author_name
before insert on public.product_comments
for each row execute function public.set_product_comment_author_name();

revoke all on function public.set_product_comment_author_name() from public, anon, authenticated;
