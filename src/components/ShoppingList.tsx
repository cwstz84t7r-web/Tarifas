"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShoppingItem } from "@/lib/types";
import { STORE_KEYS, STORES, type StoreKey } from "@/lib/stores";

function StoreSection({ store, items }: { store: StoreKey; items: ShoppingItem[] }) {
  const router = useRouter();
  const meta = STORES[store];
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const pendingCount = items.filter((i) => !i.checked).length;
  const hasChecked = items.some((i) => i.checked);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store, name }),
      });
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(item: ShoppingItem) {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
    router.refresh();
  }

  async function handleDelete(item: ShoppingItem) {
    await fetch(`/api/shopping/${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleClear() {
    await fetch("/api/shopping/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store }),
    });
    router.refresh();
  }

  return (
    <div className="shopping-section">
      <div className="shopping-header">
        <div className="shopping-header-label">
          <span className="dot" style={{ background: meta.color }} />
          {meta.label}
          <span className="shopping-count">
            {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? "" : "s"}` : "sin pendientes"}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="shopping-empty">Nada en la lista todavía.</p>
      ) : (
        <div className="shopping-items">
          {items.map((item) => (
            <div key={item.id} className={`shopping-item ${item.checked ? "checked" : ""}`}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item)}
              />
              <span className="item-name">{item.name}</span>
              <button type="button" onClick={() => handleDelete(item)} aria-label="Quitar">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="shopping-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={`Añadir a ${meta.label}...`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <button className="btn" type="submit" disabled={busy}>
          Añadir
        </button>
      </form>

      {hasChecked && (
        <button type="button" className="shopping-clear" onClick={handleClear}>
          Vaciar comprados
        </button>
      )}
    </div>
  );
}

export function ShoppingList({ items }: { items: ShoppingItem[] }) {
  return (
    <div style={{ marginTop: 16 }}>
      {STORE_KEYS.map((key) => (
        <StoreSection key={key} store={key} items={items.filter((i) => i.store === key)} />
      ))}
    </div>
  );
}
