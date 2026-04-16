"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import { dealerSchema, DEALER_BRANDS } from "@/lib/validations";

export type DealerFormDealer = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  street: string | null;
  zip: string | null;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
};

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors";

function parseBrands(raw: string): string[] {
  return raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
}

interface DealerFormProps {
  dealer?: DealerFormDealer;
}

export function DealerForm({ dealer }: DealerFormProps) {
  const router = useRouter();
  const isEdit = Boolean(dealer);

  const [name, setName] = useState(dealer?.name ?? "");
  const [slug, setSlug] = useState(dealer?.slug ?? "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    dealer?.brand ? parseBrands(dealer.brand) : ["Yamaha"],
  );
  const [street, setStreet] = useState(dealer?.street ?? "");
  const [zip, setZip] = useState(dealer?.zip ?? "");
  const [city, setCity] = useState(dealer?.city ?? "");
  const [phone, setPhone] = useState(dealer?.phone ?? "");
  const [email, setEmail] = useState(dealer?.email ?? "");
  const [website, setWebsite] = useState(dealer?.website ?? "");
  const [description, setDescription] = useState(dealer?.description ?? "");
  const [isActive, setIsActive] = useState(dealer?.isActive ?? true);

  const slugTouchedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onNameChange = (v: string) => {
    setName(v);
    if (!slugTouchedRef.current) setSlug(slugify(v));
  };

  const onSlugChange = (v: string) => {
    slugTouchedRef.current = true;
    setSlug(v);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand],
    );
  };

  const handleSubmit = async () => {
    setError(null);

    const brandString = selectedBrands.join(", ");

    const parsed = dealerSchema.safeParse({
      name: name.trim(),
      slug: slug.trim(),
      brand: brandString,
      street: street.trim() || "",
      zip: zip.trim() || "",
      city: city.trim(),
      phone: phone.trim() || "",
      email: email.trim() || "",
      website: website.trim() || "",
      description: description.trim() || "",
      logoUrl: "",
      isActive,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message ?? "Bitte Eingaben prüfen.");
      return;
    }

    const payload = parsed.data;

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/dealers/${dealer!.id}` : "/api/dealers";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Speichern fehlgeschlagen.");
        return;
      }
      router.push("/admin/haendler");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <Input
        id="dealer-name"
        label="Händlername"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        maxLength={255}
      />

      <Input
        id="dealer-slug"
        label="Slug"
        value={slug}
        onChange={(e) => onSlugChange(e.target.value)}
        required
        maxLength={255}
        spellCheck={false}
      />

      <fieldset className="space-y-3 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">
          Marken
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {DEALER_BRANDS.map((b) => (
            <label
              key={b}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedBrands.includes(b)
                  ? "border-[#E31E24] bg-[#E31E24]/5 text-[#111111] font-medium"
                  : "border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="accent-[#E31E24]"
              />
              {b}
            </label>
          ))}
        </div>
        {selectedBrands.length === 0 && (
          <p className="text-xs text-red-600">Bitte mindestens eine Marke wählen.</p>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">
          Adresse
        </legend>
        <Input
          id="dealer-street"
          label="Straße (optional)"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          maxLength={255}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="dealer-zip"
            label="PLZ (optional)"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={10}
          />
          <div className="sm:col-span-2">
            <Input
              id="dealer-city"
              label="Ort"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              maxLength={100}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">
          Kontakt (optional)
        </legend>
        <Input
          id="dealer-phone"
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={50}
        />
        <Input
          id="dealer-email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
        />
        <Input
          id="dealer-website"
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://…"
        />
      </fieldset>

      <div className="w-full">
        <label
          htmlFor="dealer-description"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Beschreibung (optional)
        </label>
        <textarea
          id="dealer-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="Profil / Beschreibung des Händlers…"
          className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors"
        />
      </div>

      <div className="w-full">
        <label
          htmlFor="dealer-active"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Status
        </label>
        <select
          id="dealer-active"
          className={selectClass}
          value={isActive ? "true" : "false"}
          onChange={(e) => setIsActive(e.target.value === "true")}
        >
          <option value="true">Aktiv</option>
          <option value="false">Inaktiv</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "Wird gespeichert…"
            : isEdit
              ? "Änderungen speichern"
              : "Händler anlegen"}
        </Button>
      </div>
    </form>
  );
}
