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

export const eventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(255),
  slug: z.string().min(1, "Slug ist erforderlich").max(255),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().optional().or(z.literal("")),
  venueName: z.string().min(1, "Veranstaltungsort ist erforderlich").max(255),
  venueAddress: z.string().min(1, "Adresse ist erforderlich").max(255),
  venueCity: z.string().min(1, "Stadt ist erforderlich").max(100),
  venueCountry: z.string().min(1, "Land ist erforderlich").max(100),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const DEALER_BRANDS = [
  "Yamaha",
  "KTM",
  "Husqvarna",
  "GASGAS",
  "BMW",
  "Honda",
  "Kawasaki",
  "Suzuki",
  "Ducati",
  "Triumph",
  "Aprilia",
  "MV Agusta",
  "Royal Enfield",
  "Harley-Davidson",
  "Indian",
  "Beta",
  "Fantic",
  "CFMOTO",
  "Zero",
  "Vespa",
  "Buell",
  "Mash",
  "SYM",
  "Keeway",
  "Peugeot",
  "CCM",
] as const;
export type DealerBrand = (typeof DEALER_BRANDS)[number];

export const dealerSchema = z.object({
  name: z.string().min(1, "Händlername ist erforderlich").max(255),
  slug: z.string().min(1, "Slug ist erforderlich").max(255),
  brand: z.string().min(1, "Bitte mindestens eine Marke angeben"),
  street: z.string().max(255).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
  city: z.string().min(1, "Ort ist erforderlich").max(100),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  website: z.string().url("Ungültige URL").optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UserInput = z.infer<typeof userSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type DealerInput = z.infer<typeof dealerSchema>;
