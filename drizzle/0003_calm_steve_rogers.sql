CREATE TABLE "dealers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"brand" varchar(100) DEFAULT 'Yamaha' NOT NULL,
	"street" varchar(255) NOT NULL,
	"zip" varchar(10) NOT NULL,
	"city" varchar(100) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"website" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dealers_slug_unique" UNIQUE("slug")
);
