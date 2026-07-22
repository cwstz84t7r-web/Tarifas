import type { PriceEntry } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

export function Sparkline({ entries, color }: { entries: PriceEntry[]; color: string }) {
  if (entries.length === 0) {
    return <p className="muted">Todavía no hay histórico para esta tienda.</p>;
  }
  if (entries.length === 1) {
    return (
      <p className="muted">
        Solo hay un dato registrado ({formatDateShort(entries[0].checkedAt)}). Actualiza
        de nuevo más adelante para ver la evolución.
      </p>
    );
  }

  const width = 300;
  const height = 70;
  const padding = 6;
  const prices = entries.map((e) => parseFloat(e.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = entries.map((entry, i) => {
    const x = padding + (i / (entries.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((parseFloat(entry.price) - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="sparkline-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <path d={path} fill="none" stroke={color} strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
        ))}
      </svg>
      <div
        className="muted"
        style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}
      >
        <span>{formatDateShort(entries[0].checkedAt)}</span>
        <span>{formatDateShort(entries[entries.length - 1].checkedAt)}</span>
      </div>
    </div>
  );
}
