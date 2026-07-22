create table if not exists products (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists product_links (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  store text not null check (store in ('mercadona','dia','carrefour','alcampo','consum','eroski')),
  url text not null,
  last_price numeric(10,2),
  last_currency text default 'EUR',
  last_checked_at timestamptz,
  last_status text,
  last_error text,
  created_at timestamptz not null default now(),
  unique (product_id, store)
);

create table if not exists price_entries (
  id text primary key,
  product_link_id text not null references product_links(id) on delete cascade,
  price numeric(10,2) not null,
  currency text not null default 'EUR',
  source text not null default 'auto',
  checked_at timestamptz not null default now()
);

create index if not exists idx_price_entries_link_date
  on price_entries (product_link_id, checked_at);
