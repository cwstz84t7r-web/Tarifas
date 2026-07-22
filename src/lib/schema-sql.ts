// Nota: este SQL vive aquí (como texto embebido en el código) y no en un
// archivo .sql suelto porque Vercel no incluye archivos sueltos que no
// formen parte del grafo de imports de JavaScript/TypeScript en el paquete
// que despliega. Al ser una constante importada, sí queda incluida.
export const SCHEMA_SQL = `
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
  last_regular_price numeric(10,2),
  last_promo boolean not null default false,
  last_checked_at timestamptz,
  last_status text,
  last_error text,
  created_at timestamptz not null default now(),
  unique (product_id, store)
);

alter table product_links add column if not exists last_regular_price numeric(10,2);
alter table product_links add column if not exists last_promo boolean not null default false;

create table if not exists price_entries (
  id text primary key,
  product_link_id text not null references product_links(id) on delete cascade,
  price numeric(10,2) not null,
  currency text not null default 'EUR',
  regular_price numeric(10,2),
  is_promo boolean not null default false,
  source text not null default 'auto',
  checked_at timestamptz not null default now()
);

alter table price_entries add column if not exists regular_price numeric(10,2);
alter table price_entries add column if not exists is_promo boolean not null default false;

create index if not exists idx_price_entries_link_date
  on price_entries (product_link_id, checked_at);

create table if not exists shopping_items (
  id text primary key,
  store text not null check (store in ('mercadona','dia','carrefour','alcampo','consum','eroski')),
  name text not null,
  checked boolean not null default false,
  product_link_id text references product_links(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_shopping_items_store
  on shopping_items (store, checked, created_at);
`;
