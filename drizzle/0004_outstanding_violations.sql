ALTER TABLE "dealers" ALTER COLUMN "brand" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "dealers" ALTER COLUMN "brand" SET DEFAULT 'Yamaha';--> statement-breakpoint
ALTER TABLE "dealers" ALTER COLUMN "street" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dealers" ALTER COLUMN "zip" DROP NOT NULL;