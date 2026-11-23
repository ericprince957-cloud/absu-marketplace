-- Notification delivery for account verification, seller applications, seller approval and product-view milestones.
create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  viewed_at timestamptz not null default now()
);
create index if not exists product_views_product_id_idx on public.product_views(product_id);
alter table public.product_views enable row level security;

create or replace function public.notify_user(p_user_id uuid, p_title text, p_body text, p_link text default null)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if p_user_id is not null then
    insert into public.notifications(user_id,title,body,link,is_read,created_at)
    values (p_user_id, left(p_title,160), left(p_body,1000), p_link, false, now());
  end if;
end;
$$;

create or replace function public.notify_admins(p_title text, p_body text, p_link text default '/admin')
returns void language plpgsql security definer set search_path = public
as $$
declare admin_row record;
begin
  for admin_row in select user_id from public.user_roles where role = 'admin' loop
    perform public.notify_user(admin_row.user_id,p_title,p_body,p_link);
  end loop;
end;
$$;

create or replace function public.notify_account_verified()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.notify_user(new.id,'Account verified','Your email is verified. You can now use ABSU Trade.','/dashboard');
    perform public.notify_admins('New verified account','A user has verified their ABSU Trade account.','/admin/users');
  end if;
  return new;
end;
$$;

drop trigger if exists auth_user_verified_notification on auth.users;
create trigger auth_user_verified_notification
after update of email_confirmed_at on auth.users
for each row execute function public.notify_account_verified();

create or replace function public.notify_seller_application()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify_user(new.user_id,'Seller application received','Your request to become a seller has been received. We will notify you when it is reviewed.','/seller/apply');
    perform public.notify_admins('New seller application',coalesce(new.business_name,'A user') || ' has requested seller access.','/admin/sellers');
  elsif old.status is distinct from new.status and new.status = 'approved' then
    perform public.notify_user(new.user_id,'You are now an ABSU Trade seller','Your seller application has been approved. You can now publish products.','/seller');
    perform public.notify_admins('Seller approved',coalesce(new.business_name,'A seller') || ' has been approved.','/admin/sellers');
  elsif old.status is distinct from new.status and new.status = 'rejected' then
    perform public.notify_user(new.user_id,'Seller application update',coalesce(new.admin_note,'Your seller application was not approved. You can review your details and apply again.'),'/seller/apply');
  end if;
  return new;
end;
$$;

drop trigger if exists seller_application_notifications_insert on public.seller_applications;
create trigger seller_application_notifications_insert
after insert on public.seller_applications
for each row execute function public.notify_seller_application();

drop trigger if exists seller_application_notifications_update on public.seller_applications;
create trigger seller_application_notifications_update
after update of status on public.seller_applications
for each row execute function public.notify_seller_application();

create or replace function public.record_product_view(p_product_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare
  owner_id uuid;
  viewer uuid := auth.uid();
  total_views integer;
begin
  select seller_id into owner_id
  from public.products
  where id = p_product_id and status = 'approved' and quantity > 0;

  if owner_id is null or owner_id = viewer then
    return 0;
  end if;

  insert into public.product_views(product_id,viewer_id) values (p_product_id,viewer);
  select count(*)::integer into total_views from public.product_views where product_id = p_product_id;

  if total_views = any(array[10,25,50,100,250,500,1000]) then
    perform public.notify_user(owner_id,'Your product is getting attention',
      'Your listing has been viewed ' || total_views || ' times. Keep your product details and availability up to date.',
      '/seller/products');
    perform public.notify_admins('Product view milestone',
      'A marketplace listing has reached ' || total_views || ' views.',
      '/admin/products');
  end if;
  return total_views;
end;
$$;

revoke all on function public.notify_user(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.notify_admins(text,text,text) from public, anon, authenticated;
grant execute on function public.record_product_view(uuid) to anon, authenticated;

-- Product listings are published automatically; clear any legacy review queue.
update public.products set status = 'approved', moderation_note = null, updated_at = now()
where status = 'pending';
