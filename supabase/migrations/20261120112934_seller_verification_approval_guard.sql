-- Do not grant seller role unless the submitted student evidence still exists.
create or replace function public.review_seller_application(p_application_id uuid, p_approve boolean, p_note text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  app public.seller_applications%rowtype;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  select * into app from public.seller_applications where id = p_application_id for update;
  if not found or app.status <> 'pending' then raise exception 'invalid_application'; end if;

  if p_approve and (
    app.matric_number is null or length(trim(app.matric_number)) < 5
    or app.faculty is null or app.department is null or app.level is null
    or app.verification_document_path is null
    or not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'seller-verification' and o.name = app.verification_document_path
    )
    or not exists (
      select 1 from auth.users u
      where u.id = app.user_id and u.email_confirmed_at is not null
    )
  ) then raise exception 'verification_evidence_required'; end if;

  update public.seller_applications
  set status = case when p_approve then 'approved' else 'rejected' end,
      admin_note = p_note, reviewed_by = (select auth.uid()), reviewed_at = now()
  where id = app.id;

  if p_approve then
    insert into public.user_roles(user_id, role) values(app.user_id, 'seller') on conflict do nothing;
  end if;

  insert into public.notifications(user_id, title, body, link)
  values (
    app.user_id, 'Seller application reviewed',
    case when p_approve then 'Your seller application was approved.' else coalesce(p_note, 'Your seller application was rejected.') end,
    '/seller'
  );
end
$function$;

drop policy if exists seller_verification_delete_own on storage.objects;
