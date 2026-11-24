-- Add buyer pickup/delivery address to order requests.
alter table public.orders
  add column if not exists delivery_address text;

drop function if exists public.place_order(uuid, integer, text);

create or replace function public.place_order(
  p_product_id uuid,
  p_quantity integer,
  p_note text,
  p_delivery_address text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  uid uuid;
  prod public.products%rowtype;
  oid uuid;
  address_value text;
begin
  uid := (select auth.uid());
  if uid is null then raise exception 'not_authenticated'; end if;
  if exists(select 1 from public.profiles where id = uid and is_suspended) then
    raise exception 'account_suspended';
  end if;

  address_value := nullif(trim(p_delivery_address), '');
  if address_value is null or length(address_value) < 5 or length(address_value) > 250 then
    raise exception 'invalid_delivery_address';
  end if;

  select * into prod from public.products where id = p_product_id for update;
  if not found or prod.status <> 'approved' then raise exception 'not_available'; end if;
  if prod.seller_id = uid then raise exception 'own_product'; end if;
  if p_quantity < 1 or p_quantity > prod.quantity then raise exception 'out_of_stock'; end if;

  update public.products set quantity = quantity - p_quantity where id = prod.id;
  insert into public.orders(buyer_id, seller_id, total, note, delivery_address)
  values(uid, prod.seller_id, prod.price * p_quantity, nullif(trim(p_note), ''), address_value)
  returning id into oid;

  insert into public.order_items(order_id, product_id, title, unit_price, quantity)
  values(oid, prod.id, prod.title, prod.price, p_quantity);

  insert into public.notifications(user_id, title, body, link)
  values(
    prod.seller_id,
    'New order',
    'You received an order for ' || prod.title || '. Open Orders to view the buyer address and details.',
    '/seller/orders'
  );
  return oid;
end
$function$;

revoke all on function public.place_order(uuid, integer, text, text) from public;
grant execute on function public.place_order(uuid, integer, text, text) to authenticated;
