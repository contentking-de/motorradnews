"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { slugify, truncate, cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  articleCount: number;
};

type CategoryManagerProps = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export default function CategoryManager({
  categories,
  loading,
  error,
  onRefresh,
}: CategoryManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...categories].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "de")
      ),
    [categories]
  );

  function openCreate() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setSlugManual(false);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setSlugManual(true);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setSaving(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) {
      alert("Bitte Name und Slug ausfüllen.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            slug: trimmedSlug,
            description: description.trim() || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(
            typeof data.error === "string"
              ? data.error
              : "Kategorie konnte nicht gespeichert werden."
          );
          return;
        }
      } else {
        const maxOrder = Math.max(0, ...categories.map((c) => c.sortOrder));
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            slug: trimmedSlug,
            description: description.trim() || null,
            sortOrder: maxOrder + 1,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(
            typeof data.error === "string"
              ? data.error
              : "Kategorie konnte nicht erstellt werden."
          );
          return;
        }
      }
      closeModal();
      await onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (cat.articleCount > 0) {
      alert(
        `Die Kategorie „${cat.name}“ ist noch ${cat.articleCount} ${cat.articleCount === 1 ? "Artikel" : "Artikeln"} zugeordnet und kann nicht gelöscht werden. Bitte zuerst die Artikel verschieben oder die Zuordnung entfernen.`
      );
      return;
    }

    if (
      !confirm(
        `Kategorie „${cat.name}“ wirklich unwiderruflich löschen?`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/categories/${cat.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(
        typeof data.error === "string"
          ? data.error
          : "Kategorie konnte nicht gelöscht werden."
      );
      return;
    }
    await onRefresh();
  }

  async function moveSort(index: number, direction: "up" | "down") {
    const j = direction === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[j];
    const orderA = a.sortOrder;
    const orderB = b.sortOrder;

    setReorderingId(a.id);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/categories/${a.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: orderB }),
        }),
        fetch(`/api/categories/${b.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: orderA }),
        }),
      ]);
      if (!resA.ok || !resB.ok) {
        alert("Sortierung konnte nicht geändert werden.");
        return;
      }
      await onRefresh();
    } finally {
      setReorderingId(null);
    }
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#666666]">
          Kategorien strukturieren Inhalte auf der Website. Slugs erscheinen in
          der URL.
        </p>
        <Button
          type="button"
          variant="primary"
          className="shrink-0 gap-2"
          onClick={openCreate}
        >
          <Plus className="size-4" aria-hidden />
          Neue Kategorie
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-12 text-center text-sm text-[#666666]">
          Kategorien werden geladen …
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <FolderOpen
            className="mb-4 size-12 text-[#666666]"
            strokeWidth={1.25}
            aria-hidden
          />
          <p className="font-display text-lg font-semibold text-[#111111]">
            Noch keine Kategorien
          </p>
          <p className="mt-1 max-w-md text-sm text-[#666666]">
            Legen Sie eine erste Kategorie an, um Artikel thematisch
            zuzuordnen.
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-6 gap-2"
            onClick={openCreate}
          >
            <Plus className="size-4" aria-hidden />
            Neue Kategorie
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Name
                </th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Slug
                </th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Beschreibung
                </th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Artikel
                </th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Reihenfolge
                </th>
                <th className="px-4 py-3 text-right font-display font-semibold text-[#111111]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F9F9F9]/80"
                >
                  <td className="px-4 py-3 font-medium text-[#111111]">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-[#F9F9F9] px-2 py-0.5 text-xs text-[#666666]">
                      {cat.slug}
                    </code>
                  </td>
                  <td
                    className="max-w-[220px] px-4 py-3 text-[#666666]"
                    title={cat.description ?? undefined}
                  >
                    {cat.description
                      ? truncate(cat.description, 72)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={cat.articleCount > 0 ? "info" : "default"}
                    >
                      {cat.articleCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="!p-1.5"
                        disabled={
                          index === 0 || reorderingId === cat.id
                        }
                        aria-label="Nach oben"
                        onClick={() => moveSort(index, "up")}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <span className="min-w-[2ch] text-center text-xs text-[#666666]">
                        {cat.sortOrder}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="!p-1.5"
                        disabled={
                          index === sorted.length - 1 ||
                          reorderingId === cat.id
                        }
                        aria-label="Nach unten"
                        onClick={() => moveSort(index, "down")}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="size-4" aria-hidden />
                        Bearbeiten
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(cat)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Löschen
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && closeModal()}
        title={editingId ? "Kategorie bearbeiten" : "Neue Kategorie"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="cat-name"
            label="Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="z. B. Reiseberichte"
            required
            autoComplete="off"
          />
          <Input
            id="cat-slug"
            label="Slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            placeholder="reiseberichte"
            required
            autoComplete="off"
          />
          <div className="w-full">
            <label
              htmlFor="cat-desc"
              className="block text-sm font-display font-semibold text-[#111111] mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="cat-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung für Redaktion und SEO …"
              className={cn(
                "w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors resize-y min-h-[100px]"
              )}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => !saving && closeModal()}
            >
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving
                ? "Speichern …"
                : editingId
                  ? "Änderungen speichern"
                  : "Kategorie anlegen"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
