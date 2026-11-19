-- ABSU Marketplace reference seed data.
-- Safe to re-run. Does not create users, products, orders or payments.
-- Run only after the reviewed schema migrations have been applied.

insert into public.app_settings (key, value)
values
  ('free_slot_limit', '50'::jsonb),
  ('membership_price_kobo', '150000'::jsonb),
  ('membership_period_days', '30'::jsonb),
  ('currency', '"NGN"'::jsonb)
on conflict (key) do update
set value = excluded.value;

insert into public.categories (name, slug, description, icon, sort_order, is_active)
values
  ('Textbooks and Notes', 'textbooks-and-notes', 'Textbooks, course materials, handouts and study notes.', 'book-open', 10, true),
  ('Electronics', 'electronics', 'Laptops, accessories and other electronic devices.', 'laptop', 20, true),
  ('Phones and Accessories', 'phones-and-accessories', 'Mobile phones, chargers, cases and accessories.', 'smartphone', 30, true),
  ('Fashion', 'fashion', 'Clothing, footwear, bags and personal style.', 'shirt', 40, true),
  ('Food and Snacks', 'food-and-snacks', 'Meals, snacks, drinks and campus food vendors.', 'utensils', 50, true),
  ('Hostel Essentials', 'hostel-essentials', 'Bedding, storage, kitchen and everyday hostel items.', 'bed', 60, true),
  ('Services', 'services', 'Student services, repairs, design, tutoring and other skills.', 'wrench', 70, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
