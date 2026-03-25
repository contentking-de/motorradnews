import { headers } from "next/headers";

/** Basis-URL für serverseitige fetch-Aufrufe zur eigenen App (z. B. /api/*). */
export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto");
  const protocol =
    proto ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${protocol}://${host}`;
}
