import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "EDITOR"]);
export const articleStatusEnum = pgEnum("article_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("EDITOR"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  teaser: text("teaser").notNull(),
  body: text("body").notNull(),
  coverImageUrl: text("cover_image_url"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  status: articleStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
});

export const articleTags = pgTable("article_tags", {
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const sourceTypeEnum = pgEnum("source_type", ["RSS", "HTML"]);

export const ingestedItemStatusEnum = pgEnum("ingested_item_status", [
  "NEW",
  "REWRITING",
  "REWRITTEN",
  "ARTICLE_CREATED",
  "FAILED",
  "SKIPPED",
]);

export const newsSources = pgTable("news_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  feedUrl: text("feed_url"),
  sourceType: sourceTypeEnum("source_type").notNull().default("RSS"),
  isActive: boolean("is_active").notNull().default(true),
  scrapeConfig: text("scrape_config"),
  defaultCategoryId: uuid("default_category_id").references(() => categories.id),
  defaultAuthorId: uuid("default_author_id").references(() => users.id),
  lastCrawledAt: timestamp("last_crawled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingestedItems = pgTable("ingested_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => newsSources.id, { onDelete: "cascade" }),
  externalUrl: text("external_url").notNull(),
  originalTitle: varchar("original_title", { length: 500 }),
  originalBody: text("original_body"),
  rewrittenTitle: varchar("rewritten_title", { length: 255 }),
  rewrittenTeaser: text("rewritten_teaser"),
  rewrittenBody: text("rewritten_body"),
  status: ingestedItemStatusEnum("status").notNull().default("NEW"),
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "set null" }),
  errorMessage: text("error_message"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  rewrittenAt: timestamp("rewritten_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dealers = pgTable("dealers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  brand: text("brand").notNull().default("Yamaha"),
  street: varchar("street", { length: 255 }),
  zip: varchar("zip", { length: 10 }),
  city: varchar("city", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventStatusEnum = pgEnum("event_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  venueAddress: varchar("venue_address", { length: 255 }).notNull(),
  venueCity: varchar("venue_city", { length: 100 }).notNull(),
  venueCountry: varchar("venue_country", { length: 100 }).notNull().default("Deutschland"),
  ticketUrl: text("ticket_url"),
  coverImageUrl: text("cover_image_url"),
  status: eventStatusEnum("event_status").notNull().default("DRAFT"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
