-- Require evidence of current ABSU student status before granting seller access.
alter table public.seller_applications
  add column if not exists matric_number text,
  add column if not exists faculty text,
  add column if not exists department text,
  add column if not exists level text,
  add column if not exists verification_document_path text;

create index if not exists seller_applications_status_created_idx
  on public.seller_applications (status, created_at desc);

drop policy if exists seller_applications_insert_self on public.seller_applications;
create policy seller_applications_insert_self
  on public.seller_applications for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and matric_number is not null
    and length(trim(matric_number)) between 5 and 30
    and faculty is not null and length(trim(faculty)) between 2 and 100
    and department is not null and length(trim(department)) between 2 and 100
    and level is not null
    and verification_document_path is not null
    and verification_document_path like ((select auth.uid())::text || '/%')
    and not coalesce((select p.is_suspended from public.profiles p where p.id = (select auth.uid())), true)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seller-verification', 'seller-verification', false, 5242880, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set public=false, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','application/pdf'];

drop policy if exists seller_verification_upload_own on storage.objects;
create policy seller_verification_upload_own on storage.objects for insert to authenticated
with check (bucket_id='seller-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists seller_verification_read_admin on storage.objects;
create policy seller_verification_read_admin on storage.objects for select to authenticated
using (bucket_id='seller-verification' and public.is_admin());

drop policy if exists seller_verification_read_own on storage.objects;
create policy seller_verification_read_own on storage.objects for select to authenticated
using (bucket_id='seller-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists seller_verification_delete_own on storage.objects;
create policy seller_verification_delete_own on storage.objects for delete to authenticated
using (bucket_id='seller-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);
