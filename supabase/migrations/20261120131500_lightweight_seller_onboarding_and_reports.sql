-- Lightweight seller onboarding and seller reporting.
alter table public.seller_applications add column if not exists location text;
drop policy if exists seller_applications_insert_self on public.seller_applications;
create policy seller_applications_insert_self on public.seller_applications for insert to authenticated with check (
 user_id=(select auth.uid()) and status='pending'
 and business_name is not null and length(trim(business_name)) between 2 and 80
 and description is not null and length(trim(description)) between 10 and 1000
 and phone is not null and length(trim(phone)) between 10 and 20
 and location is not null and length(trim(location)) between 2 and 120
 and not coalesce((select p.is_suspended from public.profiles p where p.id=(select auth.uid())),true)
);
create table if not exists public.seller_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete restrict,
 seller_id uuid not null references auth.users(id) on delete restrict,
 product_id uuid references public.products(id) on delete set null,
 reason text not null check(reason in ('scam_or_fraud','fake_or_misleading_listing','unsafe_or_abusive','payment_issue','unresponsive_seller','other')),
 details text not null check(length(trim(details)) between 10 and 1000),
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 admin_note text, created_at timestamptz not null default now(), reviewed_at timestamptz,
 constraint seller_reports_not_self check(reporter_id<>seller_id)
);
create index if not exists seller_reports_status_created_idx on public.seller_reports(status,created_at desc);
create index if not exists seller_reports_seller_idx on public.seller_reports(seller_id,created_at desc);
alter table public.seller_reports enable row level security;
drop policy if exists seller_reports_insert_authenticated on public.seller_reports;
create policy seller_reports_insert_authenticated on public.seller_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and reporter_id<>seller_id);
drop policy if exists seller_reports_select_reporter_admin on public.seller_reports;
create policy seller_reports_select_reporter_admin on public.seller_reports for select to authenticated using(reporter_id=(select auth.uid()) or public.is_admin());
drop policy if exists seller_reports_update_admin on public.seller_reports;
create policy seller_reports_update_admin on public.seller_reports for update to authenticated using(public.is_admin()) with check(public.is_admin());

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
 update public.seller_applications set status=case when p_approve then 'approved' else 'rejected' end,admin_note=p_note,reviewed_by=(select auth.uid()),reviewed_at=now() where id=app.id;
 if p_approve then insert into public.user_roles(user_id,role) values(app.user_id,'seller') on conflict do nothing; end if;
 insert into public.notifications(user_id,title,body,link) values(app.user_id,'Seller application reviewed',case when p_approve then 'Your seller application was approved.' else coalesce(p_note,'Your seller application was rejected.') end,'/seller');
end
$function$;
