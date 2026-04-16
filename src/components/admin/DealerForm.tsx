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
  street: string;
  zip: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
};

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors";

interface DealerFormProps {
  dealer?: DealerFormDealer;
}

export function DealerForm({ dealer }: DealerFormProps) {
  const router = useRouter();
  const isEdit = Boolean(dealer);

  const [name, setName] = useState(dealer?.name ?? "");
  const [slug, setSlug] = useState(dealer?.slug ?? "");
  const [brand, setBrand] = useState(dealer?.brand ?? "Yamaha");
  const [street, setStreet] = useState(dealer?.street ?? "");
  const [zip, setZip] = useState(dealer?.zip ?? "");
  const [city, setCity] = useState(dealer?.city ?? "");
  const [phone, setPhone] = useState(dealer?.phone ?? "");
  const [email, setEmail] = useState(dealer?.email ?? "");
  const [website, setWebsite] = useState(dealer?.website ?? "");
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

  const handleSubmit = async () => {
    setError(null);

    const parsed = dealerSchema.safeParse({
      name: name.trim(),
      slug: slug.trim(),
      brand: brand.trim(),
      street: street.trim(),
      zip: zip.trim(),
      city: city.trim(),
      phone: phone.trim() || "",
      email: email.trim() || "",
      website: website.trim() || "",
      logoUrl: "",
      isActive,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message ?? "Bitte Eingaben prüfen.");
      return;
    }

    const payload = {
      ...parsed.data,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      website: parsed.data.website || null,
      logoUrl: null,
    };

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

      <div className="w-full">
        <label
          htmlFor="dealer-brand"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Marke
        </label>
        <select
          id="dealer-brand"
          className={selectClass}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        >
          {DEALER_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">
          Adresse
        </legend>
        <Input
          id="dealer-street"
          label="Straße"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
          maxLength={255}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="dealer-zip"
            label="PLZ"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
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
