"use client";

import { useCallback, useEffect, useState } from "react";
import CategoryManager, {
  type Category,
} from "@/components/admin/CategoryManager";

export default function KategorienPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        setError("Kategorien konnten nicht geladen werden.");
        setCategories([]);
        return;
      }
      const data: Category[] = await res.json();
      setCategories(data);
    } catch {
      setError("Kategorien konnten nicht geladen werden.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
        Kategorien verwalten
      </h1>

      <CategoryManager
        categories={categories}
        loading={loading}
        error={error}
        onRefresh={fetchCategories}
      />
    </div>
  );
}
