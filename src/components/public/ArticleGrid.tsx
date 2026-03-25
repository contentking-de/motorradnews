import { ArticleCard, type PublicArticle } from "./ArticleCard";

export type ArticleGridProps = {
  articles: PublicArticle[];
};

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
