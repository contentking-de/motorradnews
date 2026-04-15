ALTER TABLE "ingested_items" DROP CONSTRAINT "ingested_items_article_id_articles_id_fk";
--> statement-breakpoint
ALTER TABLE "ingested_items" ADD CONSTRAINT "ingested_items_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;