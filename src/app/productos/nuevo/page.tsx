"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { STORE_KEYS, STORES } from "@/lib/stores";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ponle un nombre al producto.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), links }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el producto.");
        return;
      }
      router.push(`/productos/${data.product.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar />
      <div className="container">
        <Link href="/" className="back-link">
          ← Volver
        </Link>
        <div className="card">
          <h2>Nuevo producto</h2>
          <p className="muted" style={{ marginTop: 4, marginBottom: 16 }}>
            Ponle un nombre y pega el enlace del producto en cada tienda donde
            quieras seguirlo. Puedes dejar tiendas en blanco y añadirlas más
            tarde.
          </p>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Nombre del producto</label>
              <input
                id="name"
                type="text"
                placeholder="p. ej. Detergente líquido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {STORE_KEYS.map((key) => (
              <div key={key} className="store-field">
                <div className="store-field-label">
                  <span className="dot" style={{ background: STORES[key].color }} />
                  {STORES[key].label}
                </div>
                <input
                  type="url"
                  placeholder={STORES[key].example}
                  value={links[key] ?? ""}
                  onChange={(e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar producto"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
