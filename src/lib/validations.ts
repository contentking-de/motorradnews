import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const articleSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(255),
  slug: z.string().min(1, "Slug ist erforderlich").max(255),
  teaser: z.string().min(1, "Teaser ist erforderlich").max(500),
  body: z.string().min(1, "Artikeltext ist erforderlich"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid("Kategorie ist erforderlich"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  slug: z.string().min(1, "Slug ist erforderlich").max(100),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const userSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UserInput = z.infer<typeof userSchema>;
