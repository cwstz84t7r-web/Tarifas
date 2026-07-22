import postgres from "postgres";
import { readFileSync } from "node:fs";
import { join } from "node:path";

declare global {
  var __tarifasSql: ReturnType<typeof postgres> | undefined;
  var __tarifasSchemaReady: Promise<void> | undefined;
}

function getClient(): ReturnType<typeof postgres> {
  if (globalThis.__tarifasSql) return globalThis.__tarifasSql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL (cadena de conexión de Supabase)."
    );
  }
  const client = postgres(url, {
    ssl: "prefer",
    transform: postgres.camel,
    max: 5,
  });
  globalThis.__tarifasSql = client;
  return client;
}

async function ensureSchema(client: ReturnType<typeof postgres>) {
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  await client.unsafe(schema);
}

export function getSql() {
  const client = getClient();
  if (!globalThis.__tarifasSchemaReady) {
    globalThis.__tarifasSchemaReady = ensureSchema(client);
  }
  return globalThis.__tarifasSchemaReady.then(() => client);
}
