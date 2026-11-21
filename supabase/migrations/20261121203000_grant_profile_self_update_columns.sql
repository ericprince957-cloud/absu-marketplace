-- Allow authenticated users to edit only their own safe profile fields.
-- Row ownership and suspension are still enforced by profiles_update_self RLS.
-- Sensitive fields such as id, email, is_suspended and timestamps remain non-updatable.
grant update (full_name, username, phone, whatsapp, faculty, department, level, hostel, bio)
on table public.profiles to authenticated;
