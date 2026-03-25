"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";
import { articleSchema } from "@/lib/validations";

export type ArticleFormCategory = { id: string; name: string };

export type ArticleFormArticle = {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  body: string;
  coverImageUrl: string | null;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

function normalizeBodyFromApi(body: string | undefined): string {
  if (!body || body.trim() === "") return EMPTY_DOC;
  try {
    const parsed = JSON.parse(body) as { type?: string };
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return body;
    }
  } catch {
    /* kein JSON-Dokument */
  }
  return EMPTY_DOC;
}

const STATUS_OPTIONS = [
  { value: "DRAFT" as const, label: "Entwurf" },
  { value: "PUBLISHED" as const, label: "Veröffentlicht" },
  { value: "ARCHIVED" as const, label: "Archiviert" },
];

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors";

interface ArticleFormProps {
  article?: ArticleFormArticle;
  categories: ArticleFormCategory[];
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(article);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [teaser, setTeaser] = useState(article?.teaser ?? "");
  const [categoryId, setCategoryId] = useState(
    article?.categoryId ?? categories[0]?.id ?? ""
  );
  const [status, setStatus] = useState<ArticleFormArticle["status"]>(
    article?.status ?? "DRAFT"
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    article?.coverImageUrl ?? ""
  );
  const [body, setBody] = useState(() =>
    normalizeBodyFromApi(article?.body)
  );

  const slugTouchedRef = useRef(false);
  const draftRestoredRef = useRef(false);
  const formSnapshotRef = useRef({
    title,
    slug,
    teaser,
    categoryId,
    status,
    coverImageUrl,
    body,
  });

  useEffect(() => {
    formSnapshotRef.current = {
      title,
      slug,
      teaser,
      categoryId,
      status,
      coverImageUrl,
      body,
    };
  }, [title, slug, teaser, categoryId, status, coverImageUrl, body]);

  const storageKey = isEdit
    ? `motorrad-news-article-draft-${article!.id}`
    : "motorrad-news-article-draft-new";

  const [showAutoSaved, setShowAutoSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    try {
      const raw = localStorage.getItem("motorrad-news-article-draft-new");
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (typeof d.title === "string") setTitle(d.title);
      if (typeof d.slug === "string") {
        setSlug(d.slug);
        const t = typeof d.title === "string" ? d.title : "";
        slugTouchedRef.current = d.slug !== slugify(t);
      }
      if (typeof d.teaser === "string") setTeaser(d.teaser);
      if (typeof d.categoryId === "string") setCategoryId(d.categoryId);
      if (
        d.status === "DRAFT" ||
        d.status === "PUBLISHED" ||
        d.status === "ARCHIVED"
      ) {
        setStatus(d.status);
      }
      if (typeof d.coverImageUrl === "string") setCoverImageUrl(d.coverImageUrl);
      if (typeof d.body === "string") setBody(d.body);
    } catch {
      /* ignore */
    }
  }, [isEdit]);

  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(formSnapshotRef.current)
        );
        setShowAutoSaved(true);
        window.setTimeout(() => setShowAutoSaved(false), 3500);
      } catch {
        /* Speicher voll o. Ä. */
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [storageKey]);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouchedRef.current) {
      setSlug(slugify(v));
    }
  };

  const onSlugChange = (v: string) => {
    slugTouchedRef.current = true;
    setSlug(v);
  };

  const submitArticle = async (nextStatus: ArticleFormArticle["status"]) => {
    setError(null);
    const coverTrim = coverImageUrl.trim();
    const coverForZod = coverTrim === "" ? "" : coverTrim;

    const parsed = articleSchema.safeParse({
      title: title.trim(),
      slug: slug.trim(),
      teaser: teaser.trim(),
      body,
      coverImageUrl: coverForZod,
      categoryId,
      status: nextStatus,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message ?? "Bitte Eingaben prüfen.");
      return;
    }

    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      teaser: parsed.data.teaser,
      body: parsed.data.body,
      coverImageUrl:
        !parsed.data.coverImageUrl || parsed.data.coverImageUrl === ""
          ? null
          : parsed.data.coverImageUrl,
      categoryId: parsed.data.categoryId,
      status: parsed.data.status,
    };

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Speichern fehlgeschlagen."
        );
        return;
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      router.push("/admin/artikel");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const teaserLen = teaser.length;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => e.preventDefault()}
    >
      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      {showAutoSaved && (
        <p className="text-sm text-[#666666]" aria-live="polite">
          Automatisch gespeichert
        </p>
      )}

      <Input
        id="article-title"
        label="Titel"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        required
        maxLength={255}
      />

      <Input
        id="article-slug"
        label="Slug"
        value={slug}
        onChange={(e) => onSlugChange(e.target.value)}
        required
        maxLength={255}
        spellCheck={false}
      />

      <div className="w-full">
        <label
          htmlFor="article-teaser"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Teaser
        </label>
        <textarea
          id="article-teaser"
          value={teaser}
          onChange={(e) => setTeaser(e.target.value)}
          maxLength={500}
          rows={4}
          required
          className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E31E24] transition-colors"
          placeholder="Kurzer Teaser für Listen und Vorschau …"
        />
        <p className="mt-1 text-right text-xs text-[#666666]">
          {teaserLen} / 500 Zeichen
        </p>
      </div>

      <div className="w-full">
        <label
          htmlFor="article-category"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Kategorie
        </label>
        <select
          id="article-category"
          className={selectClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.length === 0 ? (
            <option value="">Keine Kategorien</option>
          ) : (
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="w-full">
        <label
          htmlFor="article-status"
          className="mb-1 block text-sm font-display font-semibold text-[#111111]"
        >
          Status
        </label>
        <select
          id="article-status"
          className={selectClass}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ArticleFormArticle["status"])
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <ImageUploader
        value={coverImageUrl}
        onChange={setCoverImageUrl}
        label="Titelbild"
      />

      <div className="w-full">
        <span className="mb-1 block text-sm font-display font-semibold text-[#111111]">
          Artikeltext
        </span>
        <ArticleEditor content={body} onChange={setBody} />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {isEdit ? (
          <Button
            type="button"
            variant="primary"
            disabled={submitting || categories.length === 0}
            onClick={() => submitArticle(status)}
          >
            {submitting ? "Wird gespeichert…" : "Änderungen speichern"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={submitting || categories.length === 0}
              onClick={() => submitArticle("DRAFT")}
            >
              {submitting ? "Wird gespeichert…" : "Als Entwurf speichern"}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={submitting || categories.length === 0}
              onClick={() => submitArticle("PUBLISHED")}
            >
              {submitting ? "Wird gespeichert…" : "Veröffentlichen"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
