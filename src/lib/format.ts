export function formatPrice(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "—";
  return `${num.toFixed(2)} €`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "nunca";
  const date = new Date(value);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}
