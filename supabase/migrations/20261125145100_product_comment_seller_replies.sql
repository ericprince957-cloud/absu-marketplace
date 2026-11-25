create table if not exists public.product_comment_replies (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null unique references public.product_comments(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  seller_name text not null default 'ABSU seller',
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists product_comment_replies_product_created_idx
  on public.product_comment_replies (product_id, created_at asc);

alter table public.product_comment_replies enable row level security;
grant select on public.product_comment_replies to anon, authenticated;
grant insert, delete on public.product_comment_replies to authenticated;

drop policy if exists product_comment_replies_public_read on public.product_comment_replies;
create policy product_comment_replies_public_read on public.product_comment_replies
for select to anon, authenticated using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'approved')
);

drop policy if exists product_comment_replies_seller_insert on public.product_comment_replies;
create policy product_comment_replies_seller_insert on public.product_comment_replies
for insert to authenticated with check (
  seller_id = (select auth.uid())
  and exists (select 1 from public.products p where p.id = product_id and p.seller_id = (select auth.uid()) and p.status = 'approved')
  and exists (select 1 from public.profiles profile where profile.id = (select auth.uid()) and profile.is_suspended = false)
);

drop policy if exists product_comment_replies_seller_or_admin_delete on public.product_comment_replies;
create policy product_comment_replies_seller_or_admin_delete on public.product_comment_replies
for delete to authenticated using (
  seller_id = (select auth.uid())
  or exists (select 1 from public.user_roles role where role.user_id = (select auth.uid()) and role.role = 'admin')
);

create or replace function public.set_product_comment_reply_seller()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare confirmed_at timestamptz; profile_name text; owner_id uuid;
begin
  if new.seller_id <> auth.uid() then raise exception 'seller_identity_mismatch'; end if;
  select p.seller_id into owner_id
  from public.products p join public.product_comments c on c.product_id = p.id
  where p.id = new.product_id and c.id = new.comment_id and p.status = 'approved';
  if owner_id is null or owner_id <> auth.uid() then raise exception 'seller_not_product_owner'; end if;
  select u.email_confirmed_at into confirmed_at from auth.users u where u.id = auth.uid();
  if confirmed_at is null then raise exception 'email_verification_required'; end if;
  if exists (select 1 from public.profiles profile where profile.id = auth.uid() and profile.is_suspended = true) then
    raise exception 'account_suspended';
  end if;
  select coalesce(nullif(btrim(profile.full_name), ''), nullif(btrim(profile.username), ''), 'ABSU seller')
  into profile_name from public.profiles profile where profile.id = auth.uid();
  new.seller_name := coalesce(profile_name, 'ABSU seller');
  new.body := btrim(new.body);
  return new;
end;
$$;

drop trigger if exists product_comment_reply_seller_guard on public.product_comment_replies;
create trigger product_comment_reply_seller_guard before insert on public.product_comment_replies
for each row execute function public.set_product_comment_reply_seller();
revoke all on function public.set_product_comment_reply_seller() from public, anon, authenticated;