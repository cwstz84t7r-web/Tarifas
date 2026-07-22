import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import type { StoreKey } from "@/lib/stores";
import type {
  Product,
  ProductLink,
  ProductWithLinks,
  PriceEntry,
  ShoppingItem,
} from "@/lib/types";

export async function listProductsWithLinks(): Promise<ProductWithLinks[]> {
  const sql = await getSql();
  const products = await sql<Product[]>`
    select id, name, created_at as "createdAt"
    from products
    order by created_at desc
  `;
  const links = await sql<ProductLink[]>`
    select id, product_id as "productId", store, url,
           last_price as "lastPrice", last_currency as "lastCurrency",
           last_regular_price as "lastRegularPrice", last_promo as "lastPromo",
           last_checked_at as "lastCheckedAt", last_status as "lastStatus",
           last_error as "lastError", created_at as "createdAt"
    from product_links
    order by store asc
  `;
  return products.map((p) => ({
    ...p,
    links: links.filter((l) => l.productId === p.id),
  }));
}

export async function getProductWithLinks(id: string): Promise<ProductWithLinks | null> {
  const sql = await getSql();
  const [product] = await sql<Product[]>`
    select id, name, created_at as "createdAt" from products where id = ${id}
  `;
  if (!product) return null;
  const links = await sql<ProductLink[]>`
    select id, product_id as "productId", store, url,
           last_price as "lastPrice", last_currency as "lastCurrency",
           last_regular_price as "lastRegularPrice", last_promo as "lastPromo",
           last_checked_at as "lastCheckedAt", last_status as "lastStatus",
           last_error as "lastError", created_at as "createdAt"
    from product_links
    where product_id = ${id}
    order by store asc
  `;
  return { ...product, links };
}

export async function createProduct(
  name: string,
  links: { store: StoreKey; url: string }[]
): Promise<ProductWithLinks> {
  const sql = await getSql();
  const id = randomUUID();
  await sql`insert into products (id, name) values (${id}, ${name})`;
  for (const link of links) {
    if (!link.url.trim()) continue;
    await sql`
      insert into product_links (id, product_id, store, url)
      values (${randomUUID()}, ${id}, ${link.store}, ${link.url.trim()})
      on conflict (product_id, store) do update set url = excluded.url
    `;
  }
  const created = await getProductWithLinks(id);
  if (!created) throw new Error("No se pudo crear el producto.");
  return created;
}

export async function addOrUpdateLink(
  productId: string,
  store: StoreKey,
  url: string
): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into product_links (id, product_id, store, url)
    values (${randomUUID()}, ${productId}, ${store}, ${url.trim()})
    on conflict (product_id, store) do update set
      url = excluded.url,
      last_status = null,
      last_error = null
  `;
}

export async function deleteLink(linkId: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from product_links where id = ${linkId}`;
}

export async function deleteProduct(productId: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from products where id = ${productId}`;
}

export async function getLink(linkId: string): Promise<ProductLink | null> {
  const sql = await getSql();
  const [link] = await sql<ProductLink[]>`
    select id, product_id as "productId", store, url,
           last_price as "lastPrice", last_currency as "lastCurrency",
           last_regular_price as "lastRegularPrice", last_promo as "lastPromo",
           last_checked_at as "lastCheckedAt", last_status as "lastStatus",
           last_error as "lastError", created_at as "createdAt"
    from product_links where id = ${linkId}
  `;
  return link ?? null;
}

export async function recordSuccess(
  linkId: string,
  price: number,
  currency: string,
  source: "auto" | "manual",
  regularPrice?: number | null,
  isPromo?: boolean
): Promise<void> {
  const sql = await getSql();
  const promo = isPromo ?? false;
  const regular = promo ? regularPrice ?? null : null;
  await sql.begin(async (tx) => {
    await tx`
      update product_links set
        last_price = ${price},
        last_currency = ${currency},
        last_regular_price = ${regular},
        last_promo = ${promo},
        last_checked_at = now(),
        last_status = 'ok',
        last_error = null
      where id = ${linkId}
    `;
    await tx`
      insert into price_entries (id, product_link_id, price, currency, regular_price, is_promo, source)
      values (${randomUUID()}, ${linkId}, ${price}, ${currency}, ${regular}, ${promo}, ${source})
    `;
  });
}

export async function recordFailure(
  linkId: string,
  status: string,
  message: string | null
): Promise<void> {
  const sql = await getSql();
  await sql`
    update product_links set
      last_checked_at = now(),
      last_status = ${status},
      last_error = ${message}
    where id = ${linkId}
  `;
}

export async function getHistory(linkId: string): Promise<PriceEntry[]> {
  const sql = await getSql();
  return sql<PriceEntry[]>`
    select id, product_link_id as "productLinkId", price, currency,
           regular_price as "regularPrice", is_promo as "isPromo",
           source, checked_at as "checkedAt"
    from price_entries
    where product_link_id = ${linkId}
    order by checked_at asc
  `;
}

export async function listShoppingItems(): Promise<ShoppingItem[]> {
  const sql = await getSql();
  return sql<ShoppingItem[]>`
    select id, store, name, checked, product_link_id as "productLinkId",
           created_at as "createdAt"
    from shopping_items
    order by checked asc, created_at asc
  `;
}

export async function addShoppingItem(
  store: StoreKey,
  name: string,
  productLinkId?: string | null
): Promise<ShoppingItem> {
  const sql = await getSql();
  const id = randomUUID();
  const [item] = await sql<ShoppingItem[]>`
    insert into shopping_items (id, store, name, product_link_id)
    values (${id}, ${store}, ${name.trim()}, ${productLinkId ?? null})
    returning id, store, name, checked, product_link_id as "productLinkId",
              created_at as "createdAt"
  `;
  return item;
}

export async function setShoppingItemChecked(id: string, checked: boolean): Promise<void> {
  const sql = await getSql();
  await sql`update shopping_items set checked = ${checked} where id = ${id}`;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from shopping_items where id = ${id}`;
}

export async function clearCheckedShoppingItems(store?: StoreKey): Promise<void> {
  const sql = await getSql();
  if (store) {
    await sql`delete from shopping_items where checked = true and store = ${store}`;
  } else {
    await sql`delete from shopping_items where checked = true`;
  }
}
