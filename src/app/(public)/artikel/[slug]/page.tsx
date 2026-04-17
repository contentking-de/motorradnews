import { redirect } from "next/navigation";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export default async function ArticleRedirect({ params }: Props) {
  const { slug } = await params;

  const [row] = await db
    .select({ categorySlug: categories.slug })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!row) {
    redirect("/");
  }

  redirect(`/${row.categorySlug}/${slug}`);
}
