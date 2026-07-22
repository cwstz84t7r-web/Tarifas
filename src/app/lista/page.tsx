import { TopBar } from "@/components/TopBar";
import { ShoppingList } from "@/components/ShoppingList";
import { PrintButton } from "@/components/PrintButton";
import { listShoppingItems } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ListaPage() {
  const items = await listShoppingItems();

  return (
    <>
      <TopBar />
      <div className="container">
        <div className="toolbar" style={{ marginTop: 0 }}>
          <div>
            <h2>Lista de la compra</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Añade lo que quieras en cada supermercado y márcalo cuando lo compres.
            </p>
          </div>
          <PrintButton />
        </div>
        <ShoppingList items={items} />
      </div>
    </>
  );
}
