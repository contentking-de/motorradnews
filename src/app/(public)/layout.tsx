import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CookieBanner } from "@/components/public/CookieBanner";
import { ConsentProvider } from "@/lib/consent";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerCategories: { name: string; slug: string }[] = [];
  try {
    headerCategories = await db
      .select({
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder));
  } catch {
    headerCategories = [];
  }

  return (
    <ConsentProvider>
      <div className="flex min-h-screen flex-col bg-white text-[#111111]">
        <Header categories={headerCategories} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
      <CookieBanner />
    </ConsentProvider>
  );
}
