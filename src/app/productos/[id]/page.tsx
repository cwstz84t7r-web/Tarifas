import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { ProductDetail } from "@/components/ProductDetail";
import { getProductWithLinks, getHistory } from "@/lib/data";
import type { PriceEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductWithLinks(id);
  if (!product) notFound();

  const histories: Record<string, PriceEntry[]> = {};
  for (const link of product.links) {
    histories[link.id] = await getHistory(link.id);
  }

  return (
    <>
      <TopBar />
      <div className="container">
        <Link href="/" className="back-link">
          ← Volver
        </Link>
        <ProductDetail product={product} histories={histories} />
      </div>
    </>
  );
}
