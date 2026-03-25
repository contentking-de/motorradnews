import { ArticleForm, type ArticleFormArticle } from "@/components/admin/ArticleForm";
import { getRequestBaseUrl } from "@/lib/server-base-url";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const base = await getRequestBaseUrl();

  const [catRes, artRes] = await Promise.all([
    fetch(`${base}/api/categories`, { cache: "no-store" }),
    fetch(`${base}/api/articles/${id}`, { cache: "no-store" }),
  ]);

  if (!catRes.ok) {
    throw new Error("Kategorien konnten nicht geladen werden.");
  }
  if (artRes.status === 404) {
    notFound();
  }
  if (!artRes.ok) {
    throw new Error("Artikel konnte nicht geladen werden.");
  }

  const categories = (await catRes.json()) as { id: string; name: string }[];
  const raw = (await artRes.json()) as ArticleFormArticle;

  const article: ArticleFormArticle = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    teaser: raw.teaser,
    body: raw.body,
    coverImageUrl: raw.coverImageUrl,
    categoryId: raw.categoryId,
    status: raw.status,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Artikel bearbeiten
      </h1>
      <ArticleForm
        article={article}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
