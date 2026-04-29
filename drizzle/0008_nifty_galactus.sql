ALTER TABLE "articles" ADD COLUMN "google_indexed_at" timestamp;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "google_indexing_error" text;