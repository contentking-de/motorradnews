import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerCategories = await db
    .select({
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111111]">
      <Header categories={headerCategories} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
