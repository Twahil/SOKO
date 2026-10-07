create table if not exists orders (
  id text primary key,
  user_id text not null references "user"("id") on delete cascade,
  placed_at timestamptz not null default current_timestamp,
  status text not null default 'packing',
  subtotal integer not null,
  delivery_fee integer not null,
  total integer not null,
  fulfillment text not null,
  payment text not null,
  customer jsonb not null
);

create table if not exists order_items (
  id bigserial primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  qty integer not null,
  unit text not null,
  price integer not null,
  image text not null
);

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists order_items_order_id_idx on order_items(order_id);
