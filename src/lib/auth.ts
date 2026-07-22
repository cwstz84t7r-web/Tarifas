export const SESSION_COOKIE = "tarifas_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 días

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toHex(sig);
}

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno SESSION_SECRET.");
  }
  return secret;
}

export async function createSessionToken(): Promise<string> {
  const secret = requireSecret();
  const payload = String(Date.now());
  const sig = await hmacHex(payload, secret);
  return `${payload}.${sig}`;
}

export async function isValidSessionToken(
  token: string | null | undefined
): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = await hmacHex(payload, secret);
  if (expected.length !== sig.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
