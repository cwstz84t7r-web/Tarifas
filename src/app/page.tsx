import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ProductList } from "@/components/ProductList";
import { listProductsWithLinks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProductsWithLinks();

  return (
    <>
      <TopBar />
      <div className="container">
        <ProductList products={products} />
      </div>
      <Link href="/productos/nuevo" className="fab" aria-label="Añadir producto">
        +
      </Link>
    </>
  );
}
