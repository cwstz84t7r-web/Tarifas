import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <h1>Tarifas</h1>
          <small>precios de supermercados</small>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
