import { NextRequest, NextResponse } from "next/server";
import { getLink, recordFailure, recordSuccess } from "@/lib/data";
import { scrapePrice } from "@/lib/scrapers";

const FAILURE_MESSAGES: Record<string, string> = {
  blocked: "Esta tienda ha bloqueado la lectura automática. Introduce el precio a mano.",
  not_found: "No se encontró el precio en la página. Introduce el precio a mano.",
  network: "Error de conexión al consultar la tienda. Inténtalo de nuevo más tarde.",
  parse: "El enlace no tiene el formato esperado para esta tienda.",
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const link = await getLink(id);
  if (!link) {
    return NextResponse.json({ error: "Enlace no encontrado." }, { status: 404 });
  }

  const result = await scrapePrice(link.store, link.url);

  if (result.ok) {
    await recordSuccess(id, result.price, result.currency, "auto");
    return NextResponse.json({ ok: true, price: result.price, currency: result.currency });
  }

  await recordFailure(id, result.reason, result.message ?? null);
  return NextResponse.json({
    ok: false,
    reason: result.reason,
    message: FAILURE_MESSAGES[result.reason] ?? "No se pudo obtener el precio.",
  });
}
