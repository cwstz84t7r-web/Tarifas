"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductWithLinks } from "@/lib/types";
import { STORE_KEYS, STORES } from "@/lib/stores";
import { formatPrice } from "@/lib/format";

function statusClass(status: string | null, hasLink: boolean): string {
  if (!hasLink) return "status-none";
  if (status === "ok") return "status-ok";
  if (status === "blocked" || status === "not_found") return "status-warn";
  if (status === "network" || status === "parse") return "status-error";
  return "status-none";
}

function ProductCard({ product }: { product: ProductWithLinks }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const pricedLinks = product.links.filter(
    (l) => l.lastPrice != null && l.lastStatus === "ok"
  );
  const bestPrice =
    pricedLinks.length > 0
      ? Math.min(...pricedLinks.map((l) => parseFloat(l.lastPrice!)))
      : null;

  async function handleRefresh(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRefreshing(true);
    try {
      await fetch(`/api/products/${product.id}/refresh`, { method: "POST" });
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Link href={`/productos/${product.id}`} className="product-card">
      <div className="product-card-head">
        <h3>{product.name}</h3>
        <button className="btn secondary" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <span className="spinner" /> : "Actualizar"}
        </button>
      </div>
      <div className="chip-row">
        {STORE_KEYS.map((key) => {
          const link = product.links.find((l) => l.store === key);
          const price = link?.lastPrice ? parseFloat(link.lastPrice) : null;
          const isBest = bestPrice != null && price === bestPrice;
          return (
            <span
              key={key}
              className={`chip ${statusClass(link?.lastStatus ?? null, !!link)} ${
                isBest ? "best" : ""
              }`}
              style={{ borderLeft: `3px solid ${STORES[key].color}` }}
            >
              {STORES[key].label}: {link ? formatPrice(link.lastPrice) : "sin enlace"}
            </span>
          );
        })}
      </div>
    </Link>
  );
}

export function ProductList({ products }: { products: ProductWithLinks[] }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>Todavía no has añadido ningún producto.</p>
        <p className="muted">Toca el botón + para añadir el primero.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
