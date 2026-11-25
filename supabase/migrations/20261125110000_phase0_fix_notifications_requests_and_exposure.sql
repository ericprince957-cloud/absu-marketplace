-- Phase 0 production fixes (additive / reversible).
--
-- ROLLBACK (only if needed):
--   revoke update (is_read) on public.notifications from authenticated;
--   drop policy item_requests_read_open_anon on public.item_requests;
--   drop policy item_requests_read_open_or_owner on public.item_requests;
--   create policy item_requests_read_open_or_owner on public.item_requests for select to anon, authenticated
--     using ((status = 'open') or (requester_id = (select auth.uid())) or is_admin());
--   grant insert, update, delete, truncate, references, trigger on public.seller_public to anon, authenticated;
--   grant execute on function public.notify_account_verified() to public, anon, authenticated;
--   grant execute on function public.notify_seller_application() to public, anon, authenticated;
--   grant execute on function public.place_order(uuid, integer, text, text) to anon;
--   grant all on public.product_views to anon, authenticated;

-- 1) Notifications: the UPDATE policy already existed, but the table-level
--    UPDATE privilege was never granted, so "mark as read" failed for every user.
--    Column-level grant: users can only ever change is_read (RLS limits rows to their own).
grant update (is_read) on public.notifications to authenticated;

-- 2) Item requests: the single SELECT policy applied to anon but called is_admin(),
--    which anon cannot execute ("permission denied for function is_admin").
--    Split it so anon only sees open requests and signed-in users keep the full rule.
drop policy if exists item_requests_read_open_or_owner on public.item_requests;

create policy item_requests_read_open_anon on public.item_requests
  for select to anon
  using (status = 'open');

create policy item_requests_read_open_or_owner on public.item_requests
  for select to authenticated
  using (
    status = 'open'
    or requester_id = (select auth.uid())
    or public.is_admin()
  );

-- 3) seller_public is a security-definer view over profiles and is auto-updatable.
--    anon/authenticated held write privileges on it, which would let API callers
--    write to profiles through the view and bypass RLS. Keep read-only.
revoke insert, update, delete, truncate, references, trigger
  on public.seller_public from anon, authenticated;

-- 4) Trigger-only SECURITY DEFINER functions must not be callable through /rest/v1/rpc.
--    Triggers keep working: EXECUTE is checked when a trigger is created, not when it fires.
revoke execute on function public.notify_account_verified() from public, anon, authenticated;
revoke execute on function public.notify_seller_application() from public, anon, authenticated;

-- 5) Orders need a signed-in buyer (function already raises not_authenticated for anon).
revoke execute on function public.place_order(uuid, integer, text, text) from anon;

-- 6) product_views is written only by record_product_view() (SECURITY DEFINER) and has
--    no RLS policies, so direct API privileges serve no purpose.
revoke all on public.product_views from anon, authenticated;
