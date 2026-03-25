import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, categories, articles } from "./schema";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const bmwBody = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        {
          type: "text",
          text: "Mehr Hubraum, weniger Gewicht: Was die Adventure kann",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Mit der R 1300 GS Adventure rückt BMW Motorrad sein Reise-Enduro noch näher an den Sweetspot aus Langstreckenkomfort und Geländetauglichkeit. Der neue Boxer mit ShiftCam-Technik liefert spürbar mehr Drehmoment im unteren Drehzahlbereich – genau dort, wo es auf Schotter und bei voll beladenem Gepäck zählt.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Die Fahrwerksgeometrie wirkt auf der Straße souveräner als beim Vorgänger, ohne die typische GS-Leichtigkeit zu verlieren. Adaptive Fahrmodi, ABS Pro und die optionale semiaktive Federung runden das technische Paket ab. Für Tourenfahrer, die auch mal abseits befestigter Wege unterwegs sind, bleibt die Adventure die Referenz im Segment.",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "„Die R 1300 GS Adventure fühlt sich an wie ein Schwerlast-Hubschrauber mit Motorradführerschein – nur dass sie dabei erstaunlich agil bleibt.“",
            },
          ],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Motor: Zweizylinder-Boxer, ca. 1.300 cm³, ShiftCam-Variable Ventilsteuerung" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Leistung: rund 145 PS, maximales Drehmoment kräftig ausgeprägt ab niedrigen Drehzahlen" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Tankinhalt & Reichweite: großvolumiger Tank für lange Etappen ohne Tankstopp-Panik" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Elektronik: Fahrmodi, Traktionskontrolle, optionale semiaktive Federung, großes TFT-Display" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const ducatiBody = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Auf der Landstraße: Rennstrecken-DNA im Alltag" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Die Panigale V4 S ist kein Motorrad für gemütliche Sonntagsausfahrten – und genau deshalb fasziniert sie. Der V4-Motor aus der MotoGP-Familie drückt mit brachialer Linearität Gas, während das semiaktive Öhlins-Fahrwerk auf gutem Asphalt eine Präzision liefert, die an Supersportler erinnert.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Im Test überzeugte vor allem die Bremsanlage mit M50-Monoblöcken und die knackige Schaltung der Quickshifter-Lösung. Die Sitzposition bleibt sportlich straff; nach 200 Kilometern merkt man die Rennsport-Geometrie – wer das sucht, wird belohnt.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Bewertung & Fazit" }],
    },
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Motor & Sound: 9,5 / 10 – kultivierter Wahnsinn" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Fahrwerk: 9 / 10 – auf der Rennstrecke unschlagbar, auf schlechter Fahrbahn knackig" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Alltagstauglichkeit: 7 / 10 – heiß, eng, laut – und genau richtig so" }],
            },
          ],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Pro: ", marks: [{ type: "bold" }] },
                { type: "text", text: "Emotionales Fahrerlebnis, Top-Bremsen, Elektronik auf WM-Niveau" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Contra: ", marks: [{ type: "bold" }] },
                { type: "text", text: "Hitze an den Beinen im Stau, Versicherung und Reifen kosten Premium" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Fazit: Wer ein Straßen-Superbike der Extraklasse sucht und Kompromisse bewusst eingeht, findet in der V4 S eine der eindrucksvollsten Maschinen im aktuellen Marktangebot.",
            },
          ],
        },
      ],
    },
  ],
};

const motogpBody = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Katar GP: Márquez setzt von Start bis Ziel das Tempo" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Marc Márquez hat den Auftakt zur MotoGP-Saison 2025 in Losail dominiert. Vom ersten Training an wirkte die neue Maschine des mehrfachen Weltmeisters harmonisch abgestimmt; im Rennen übersetzte sich das in eine kontrollierte Führung, die die Verfolger kaum ins Zwängen brachten.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hinter Márquez entwickelte sich ein packendes Duell um die Podiumsplätze. Reifenmanagement und Windschatten-Taktik spielten auf der langen Startgeraden und den schnellen Kurven des Katar-Rings eine zentrale Rolle – klassische Nachtrenn- Dramatik unter Flutlicht.",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "„Wenn Marc so startet, muss der Rest der Konkurrenz in den nächsten Wochen antworten – sonst wird die Saison sehr eintönig.“",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Rennverlauf in Kürze" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Pole und Sieg für Márquez – keine Fehler unter Druck" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Starker zweiter Platz nach spannendem Mittelteil des Rennens" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Mehrere Fahrer mit Strafen wegen Track-Limits – WM-Punkte neu sortiert" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Nächster Stopp: traditioneller Kontrastboden nach dem Wüsten-Kick-off" }],
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  console.log("Seeding users...");
  const passwordHash = bcrypt.hashSync("m59rockT!richtig", 12);
  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@motorrad.news",
      passwordHash,
      role: "ADMIN",
      avatarUrl: null,
      isActive: true,
    })
    .returning();

  console.log("Seeding categories...");
  const insertedCategories = await db
    .insert(categories)
    .values([
      {
        name: "Neuheiten",
        slug: "neuheiten",
        description: "Die neuesten Motorräder und Modelle",
        sortOrder: 0,
      },
      {
        name: "Tests",
        slug: "tests",
        description: "Ausführliche Motorrad-Tests und Fahrberichte",
        sortOrder: 1,
      },
      {
        name: "Technik",
        slug: "technik",
        description: "Technik-Ratgeber und Werkstatt-Tipps",
        sortOrder: 2,
      },
      {
        name: "Reisen",
        slug: "reisen",
        description: "Motorrad-Reisen und Tourentipps",
        sortOrder: 3,
      },
      {
        name: "Motorsport",
        slug: "motorsport",
        description: "MotoGP, Superbike und Motorsport-News",
        sortOrder: 4,
      },
    ])
    .returning();

  const catBySlug = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id])) as Record<
    string,
    string
  >;

  const publishedAt = new Date();

  console.log("Seeding articles...");
  await db.insert(articles).values([
    {
      title: "BMW R 1300 GS Adventure: Das Reise-Enduro Flaggschiff",
      slug: "bmw-r-1300-gs-adventure-das-reise-enduro-flaggschiff",
      teaser:
        "BMW Motorrad präsentiert die neue R 1300 GS Adventure. Mit dem neuen ShiftCam-Boxermotor und modernster Elektronik setzt sie neue Maßstäbe im Reise-Enduro-Segment.",
      body: JSON.stringify(bmwBody),
      coverImageUrl: "/uploads/placeholder-bmw.jpg",
      categoryId: catBySlug.neuheiten,
      authorId: admin.id,
      status: "PUBLISHED",
      publishedAt,
    },
    {
      title: "Ducati Panigale V4 S im Test: Straßen-Superbike der Extraklasse",
      slug: "ducati-panigale-v4-s-im-test",
      teaser:
        "Die Ducati Panigale V4 S vereint Rennstrecken-Performance mit Alltagstauglichkeit. Wir haben das italienische Superbike ausführlich getestet.",
      body: JSON.stringify(ducatiBody),
      coverImageUrl: "/uploads/placeholder-ducati.jpg",
      categoryId: catBySlug.tests,
      authorId: admin.id,
      status: "PUBLISHED",
      publishedAt,
    },
    {
      title: "MotoGP 2025: Márquez dominiert den Saisonauftakt",
      slug: "motogp-2025-marquez-dominiert-saisonauftakt",
      teaser:
        "Marc Márquez feiert beim Saisonauftakt in Katar einen überlegenen Sieg und sendet eine klare Botschaft an die Konkurrenz.",
      body: JSON.stringify(motogpBody),
      coverImageUrl: "/uploads/placeholder-motogp.jpg",
      categoryId: catBySlug.motorsport,
      authorId: admin.id,
      status: "PUBLISHED",
      publishedAt,
    },
  ]);

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
