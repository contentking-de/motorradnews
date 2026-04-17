export async function geocodeAddress(
  street: string,
  zip: string,
  city: string,
): Promise<{ lat: number; lon: number } | null> {
  function parseCoords(data: unknown): { lat: number; lon: number } | null {
    if (!Array.isArray(data) || !data.length) return null;
    const first = data[0] as Record<string, unknown>;
    const lat = parseFloat(String(first?.lat ?? ""));
    const lon = parseFloat(String(first?.lon ?? ""));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  const fullQuery = [street, [zip, city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ") + ", Deutschland";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: fullQuery, format: "json", limit: "1" }),
      { headers: { "User-Agent": "motorrad-news/1.0 (https://motorrad.news)" } },
    );
    if (res.ok) {
      const coords = parseCoords(await res.json());
      if (coords) return coords;
    }

    const cityQuery = `${zip} ${city}, Deutschland`;
    const fallback = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: cityQuery, format: "json", limit: "1" }),
      { headers: { "User-Agent": "motorrad-news/1.0 (https://motorrad.news)" } },
    );
    if (fallback.ok) return parseCoords(await fallback.json());
    return null;
  } catch {
    return null;
  }
}
