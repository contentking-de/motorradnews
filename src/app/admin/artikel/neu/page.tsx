import { ArticleForm } from "@/components/admin/ArticleForm";
import { getRequestBaseUrl } from "@/lib/server-base-url";

export default async function NewArticlePage() {
  const base = await getRequestBaseUrl();
  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Kategorien konnten nicht geladen werden.");
  }
  const categories = (await res.json()) as { id: string; name: string }[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Neuer Artikel
      </h1>
      <ArticleForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
