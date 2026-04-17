import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CookieBanner } from "@/components/public/CookieBanner";
import { ConsentProvider } from "@/lib/consent";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { sortByPrioritySlugs } from "@/lib/utils";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerCategories: { name: string; slug: string }[] = [];
  try {
    headerCategories = sortByPrioritySlugs(
      await db
        .select({
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder)),
    );
  } catch {
    headerCategories = [];
  }

  return (
    <ConsentProvider>
      <div className="flex min-h-screen flex-col bg-white text-[#111111]">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[100] -translate-y-20 rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
        >
          Zum Inhalt springen
        </a>
        <Header categories={headerCategories} />
        <main id="main-content" className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
      <CookieBanner />
    </ConsentProvider>
  );
}
