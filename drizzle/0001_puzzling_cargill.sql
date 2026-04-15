CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."ingested_item_status" AS ENUM('NEW', 'REWRITING', 'REWRITTEN', 'ARTICLE_CREATED', 'FAILED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('RSS', 'HTML');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"venue_name" varchar(255) NOT NULL,
	"venue_address" varchar(255) NOT NULL,
	"venue_city" varchar(100) NOT NULL,
	"venue_country" varchar(100) DEFAULT 'Deutschland' NOT NULL,
	"ticket_url" text,
	"cover_image_url" text,
	"event_status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"author_id" uuid NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ingested_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"external_url" text NOT NULL,
	"original_title" varchar(500),
	"original_body" text,
	"rewritten_title" varchar(255),
	"rewritten_teaser" text,
	"rewritten_body" text,
	"status" "ingested_item_status" DEFAULT 'NEW' NOT NULL,
	"article_id" uuid,
	"error_message" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"rewritten_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"feed_url" text,
	"source_type" "source_type" DEFAULT 'RSS' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"scrape_config" text,
	"default_category_id" uuid,
	"default_author_id" uuid,
	"last_crawled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingested_items" ADD CONSTRAINT "ingested_items_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingested_items" ADD CONSTRAINT "ingested_items_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_sources" ADD CONSTRAINT "news_sources_default_category_id_categories_id_fk" FOREIGN KEY ("default_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_sources" ADD CONSTRAINT "news_sources_default_author_id_users_id_fk" FOREIGN KEY ("default_author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;