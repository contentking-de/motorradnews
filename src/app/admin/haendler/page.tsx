"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type DealerRow = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  street: string;
  zip: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
};

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

export default function DealersPage() {
  const [dealers, setDealers] = useState<DealerRow[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadDealers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (cityFilter) params.set("city", cityFilter);
      const q = params.toString();
      const res = await fetch(q ? `/api/dealers?${q}` : "/api/dealers");
      if (!res.ok) throw new Error("load_failed");
      setDealers(await res.json());
    } catch {
      setError("Händler konnten nicht geladen werden.");
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, cityFilter]);

  useEffect(() => {
    loadDealers();
  }, [loadDealers]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Händler „${name}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/dealers/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      loadDealers();
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Importiere...");
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

      const mapped = rows.map((r) => ({
        name: r["Händlername"] || r["name"] || "",
        brand: r["Marken"] || r["Marke"] || r["brand"] || "Yamaha",
        street: r["Straße"] || r["street"] || "",
        zip: String(r["PLZ"] || r["zip"] || ""),
        city: r["Ort"] || r["city"] || "",
        phone: r["Telefonnummer"] || r["Telefon"] || r["phone"] || "",
        email: r["E-Mail"] || r["email"] || "",
        website: r["Webseite"] || r["Website"] || r["website"] || "",
      }));

      const res = await fetch("/api/dealers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(mapped),
      });
      const result = (await res.json()) as {
        imported: number;
        skipped: number;
        errors: string[];
      };
      setImportStatus(
        `${result.imported} importiert, ${result.skipped} übersprungen${result.errors.length > 0 ? `. Fehler: ${result.errors.slice(0, 3).join("; ")}` : ""}`,
      );
      loadDealers();
    } catch (err) {
      setImportStatus(`Import fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          Händlerverzeichnis
        </h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="secondary"
            size="md"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4 shrink-0" aria-hidden />
            Import
          </Button>
          <Button href="/admin/haendler/neu" variant="primary" size="md" className="gap-2">
            <Plus className="size-4 shrink-0" aria-hidden />
            Neuer Händler
          </Button>
        </div>
      </div>

      {importStatus && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {importStatus}
          <button
            type="button"
            className="ml-2 text-blue-600 underline"
            onClick={() => setImportStatus(null)}
          >
            Schließen
          </button>
        </p>
      )}

      <section className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4 space-y-4" aria-label="Filter">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]"
              aria-hidden
            />
            <Input
              id="dealer-search"
              type="search"
              placeholder="Händler suchen…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-white"
              aria-label="Händler suchen"
            />
          </div>
          <Input
            id="filter-city"
            type="search"
            placeholder="Ort filtern…"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-white"
            aria-label="Ort filtern"
          />
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : dealers.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-[#111111]">Keine Händler gefunden</p>
          <p className="mt-2 text-sm text-[#666666]">
            Passe die Filter an oder lege einen neuen Händler an.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-[#666666]">{dealers.length} Händler gefunden</p>
          <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                <tr>
                  <th className="px-4 py-3 font-display font-semibold text-[#111111]">Händler</th>
                  <th className="px-4 py-3 font-display font-semibold text-[#111111] hidden sm:table-cell">
                    Marke
                  </th>
                  <th className="px-4 py-3 font-display font-semibold text-[#111111] hidden md:table-cell">
                    Adresse
                  </th>
                  <th className="px-4 py-3 font-display font-semibold text-[#111111]">Status</th>
                  <th className="px-4 py-3 text-right font-display font-semibold text-[#111111]">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {dealers.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#111111]">{d.name}</p>
                      {d.phone && (
                        <p className="mt-0.5 text-xs text-[#666666]">{d.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell max-w-[200px]">
                      <div className="flex flex-wrap items-center gap-1">
                        {d.brand
                          .split(",")
                          .map((b) => b.trim())
                          .filter(Boolean)
                          .map((b) => (
                            <span
                              key={b}
                              className="inline-block rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs text-[#666666]"
                            >
                              {b}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-[#666666]">
                        <MapPin className="size-3.5" />
                        {d.zip} {d.city}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          d.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {d.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/haendler/${d.id}`}
                          className="rounded-md p-1.5 text-[#666666] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                          title="Bearbeiten"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id, d.name)}
                          className="rounded-md p-1.5 text-[#666666] hover:bg-red-50 hover:text-red-600"
                          title="Löschen"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
