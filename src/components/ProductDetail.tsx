"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductWithLinks, ProductLink, PriceEntry } from "@/lib/types";
import { STORE_KEYS, STORES, type StoreKey } from "@/lib/stores";
import { formatPrice, formatDate, formatDiscount } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";

const STATUS_LABEL: Record<string, string> = {
  ok: "Actualizado",
  blocked: "Bloqueado por la tienda",
  not_found: "No se encontró el precio",
  network: "Error de conexión",
  parse: "Enlace no reconocido",
};

function statusClass(status: string | null): string {
  if (status === "ok") return "status-ok";
  if (status === "blocked" || status === "not_found") return "status-warn";
  if (status === "network" || status === "parse") return "status-error";
  return "status-none";
}

function ExistingLinkRow({
  link,
  history,
  productName,
}: {
  link: ProductLink;
  history: PriceEntry[];
  productName: string;
}) {
  const router = useRouter();
  const store = STORES[link.store];
  const [busy, setBusy] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualPrice, setManualPrice] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState(false);

  async function handleAddToList() {
    setBusy(true);
    try {
      await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store: link.store, name: productName, productLinkId: link.id }),
      });
      setAddedToList(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleRefresh() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/links/${link.id}/refresh`, { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setMessage(data.message);
        setShowManual(true);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(manualPrice.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      setManualError("Introduce un precio válido.");
      return;
    }
    setBusy(true);
    setManualError(null);
    try {
      const res = await fetch(`/api/links/${link.id}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!res.ok) {
        const data = await res.json();
        setManualError(data.error ?? "No se pudo guardar el precio.");
        return;
      }
      setManualPrice("");
      setShowManual(false);
      setMessage(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Quitar el enlace de ${store.label} de este producto?`)) return;
    setBusy(true);
    try {
      await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="store-detail-row">
      <div className="store-detail-head">
        <div className="store-field-label" style={{ marginBottom: 0 }}>
          <span className="dot" style={{ background: store.color }} />
          {store.label}
        </div>
        <span className={`chip ${statusClass(link.lastStatus)}`}>
          {link.lastStatus ? STATUS_LABEL[link.lastStatus] ?? link.lastStatus : "Sin comprobar"}
        </span>
      </div>

      <div className="price-line">
        <p className="store-detail-price">{formatPrice(link.lastPrice)}</p>
        {link.lastPromo && link.lastRegularPrice && (
          <>
            <span className="strike">{formatPrice(link.lastRegularPrice)}</span>
            <span className="promo-badge">
              🏷️ Oferta {formatDiscount(link.lastPrice, link.lastRegularPrice)}
            </span>
          </>
        )}
      </div>
      <p className="muted">Última comprobación: {formatDate(link.lastCheckedAt)}</p>
      {message && <p className="error-text">{message}</p>}

      <Sparkline entries={history} color={store.color} />

      <div className="row-actions">
        <button className="btn secondary" onClick={handleRefresh} disabled={busy}>
          {busy ? <span className="spinner" /> : "Actualizar precio"}
        </button>
        <button className="btn ghost" onClick={() => setShowManual((v) => !v)} disabled={busy}>
          Precio manual
        </button>
        <a className="btn ghost" href={link.url} target="_blank" rel="noreferrer">
          Ver producto
        </a>
        <button className="btn ghost" onClick={handleAddToList} disabled={busy || addedToList}>
          {addedToList ? "Añadido a la lista ✓" : "Añadir a la lista"}
        </button>
        <button className="btn danger" onClick={handleDelete} disabled={busy}>
          Quitar
        </button>
      </div>

      {showManual && (
        <form className="manual-inline" onSubmit={handleManualSubmit}>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy}>
            Guardar
          </button>
          {manualError && <span className="error-text">{manualError}</span>}
        </form>
      )}
    </div>
  );
}

function AddLinkRow({ productId, store }: { productId: string; store: StoreKey }) {
  const router = useRouter();
  const meta = STORES[store];
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store, url }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "No se pudo guardar el enlace.");
        return;
      }
      setUrl("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="store-detail-row">
      <div className="store-field-label">
        <span className="dot" style={{ background: meta.color }} />
        {meta.label}
      </div>
      <form className="manual-inline" onSubmit={handleSubmit} style={{ marginTop: 0 }}>
        <input
          type="url"
          placeholder={meta.example}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ maxWidth: "none", flex: 1 }}
        />
        <button className="btn" type="submit" disabled={busy}>
          Añadir
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export function ProductDetail({
  product,
  histories,
}: {
  product: ProductWithLinks;
  histories: Record<string, PriceEntry[]>;
}) {
  const router = useRouter();
  const [refreshingAll, setRefreshingAll] = useState(false);

  async function handleRefreshAll() {
    setRefreshingAll(true);
    try {
      await fetch(`/api/products/${product.id}/refresh`, { method: "POST" });
      router.refresh();
    } finally {
      setRefreshingAll(false);
    }
  }

  async function handleDeleteProduct() {
    if (!confirm(`¿Eliminar "${product.name}" y todo su histórico?`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="toolbar" style={{ marginTop: 0 }}>
        <h2>{product.name}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={handleRefreshAll} disabled={refreshingAll}>
            {refreshingAll ? <span className="spinner" /> : "Actualizar todo"}
          </button>
          <button className="btn danger" onClick={handleDeleteProduct}>
            Eliminar
          </button>
        </div>
      </div>
      {refreshingAll && (
        <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>
          Consultando cada tienda con una pausa entre medias para no parecer un
          robot — puede tardar hasta un minuto.
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        {STORE_KEYS.map((key) => {
          const link = product.links.find((l) => l.store === key);
          if (link) {
            return (
              <ExistingLinkRow
                key={key}
                link={link}
                history={histories[link.id] ?? []}
                productName={product.name}
              />
            );
          }
          return <AddLinkRow key={key} productId={product.id} store={key} />;
        })}
      </div>
    </>
  );
}
