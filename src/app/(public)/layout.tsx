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
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#E31E24] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
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
